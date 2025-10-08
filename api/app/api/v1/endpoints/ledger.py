from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import json

from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.database import get_db, engine
from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey, Boolean, String
from sqlalchemy.orm import relationship

from app.models import Base as ModelsBase


class JournalEntryModel(ModelsBase):
    __tablename__ = 'journal_entries'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    description = Column(Text, nullable=True)
    lines_json = Column(Text, nullable=False)  # Array of {account_type, debit, credit, entity}
    is_balanced = Column(Boolean, default=False)
    meta_json = Column(Text, nullable=True)

    owner = relationship('User')


class AccountModel(ModelsBase):
    __tablename__ = 'accounts_master'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    code = Column(String(20), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # asset|liability|equity|income|expense
    is_active = Column(Boolean, default=True)
    owner = relationship('User')


class JournalLine(BaseModel):
    account_type: str  # asset|liability|income|expense|equity
    debit: float = 0.0
    credit: float = 0.0
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    memo: Optional[str] = None


class JournalEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = None
    lines: List[JournalLine]
    meta: Optional[dict] = None

    def is_balanced(self) -> bool:
        total_debit = sum(max(0.0, float(l.debit)) for l in self.lines)
        total_credit = sum(max(0.0, float(l.credit)) for l in self.lines)
        return abs(total_debit - total_credit) < 1e-6


router = APIRouter(prefix="/ledger", tags=["ledger"])


# Ensure ledger tables exist (idempotent)
try:
    ModelsBase.metadata.create_all(bind=engine)
except Exception:
    # Avoid hard failures if engine not ready at import-time
    pass


@router.get("/journal", response_model=List[JournalEntry])
def list_journal(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(JournalEntryModel).filter(JournalEntryModel.user_id == user.id).order_by(JournalEntryModel.timestamp.desc()).all()
    result: List[JournalEntry] = []
    for r in rows:
        try:
            result.append(JournalEntry(timestamp=r.timestamp, description=r.description, lines=[JournalLine(**x) for x in json.loads(r.lines_json)], meta=json.loads(r.meta_json) if r.meta_json else None))
        except Exception:
            continue
    return result


@router.post("/journal", response_model=JournalEntry)
def post_journal(entry: JournalEntry, user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        balanced = entry.is_balanced()
        row = JournalEntryModel(
            user_id=user.id,
            timestamp=entry.timestamp,
            description=entry.description,
            lines_json=json.dumps([l.dict() for l in entry.lines]),
            is_balanced=balanced,
            meta_json=json.dumps(entry.meta) if entry.meta else None
        )
        db.add(row)
        db.commit()
        return entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save journal entry: {e}")


@router.get('/journal.csv')
def journal_csv(start: str = None, end: str = None, user=Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(JournalEntryModel).filter(JournalEntryModel.user_id == user.id)
    from datetime import datetime as _dt
    if start:
        try:
            s = _dt.fromisoformat(start.replace('Z','+00:00'))
            q = q.filter(JournalEntryModel.timestamp >= s)
        except Exception:
            pass
    if end:
        try:
            e = _dt.fromisoformat(end.replace('Z','+00:00'))
            q = q.filter(JournalEntryModel.timestamp < e)
        except Exception:
            pass
    rows = q.order_by(JournalEntryModel.timestamp.asc()).all()
    lines = ["timestamp,description,account_type,debit,credit,memo"]
    for r in rows:
        try:
            lines_data = json.loads(r.lines_json)
        except Exception:
            lines_data = []
        for l in lines_data:
            ts = r.timestamp.isoformat()
            desc = (r.description or '').replace(',', ' ')
            acct = str(l.get('account_type',''))
            debit = float(l.get('debit') or 0.0)
            credit = float(l.get('credit') or 0.0)
            memo = str(l.get('memo') or '').replace(',', ' ')
            lines.append(f"{ts},{desc},{acct},{debit:.2f},{credit:.2f},{memo}")
    csv = "\n".join(lines) + "\n"
    return Response(content=csv, media_type="text/csv")


@router.delete('/journal')
def clear_journal(all: int = 0, before: Optional[datetime] = None, user=Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(JournalEntryModel).filter(JournalEntryModel.user_id == user.id)
    if not all and before is None:
        raise HTTPException(status_code=400, detail="Specify ?all=1 or ?before=ISO")
    if not all and before is not None:
        q = q.filter(JournalEntryModel.timestamp < before)
    count = q.count()
    q.delete(synchronize_session=False)
    db.commit()
    return { 'deleted': count }


class COAItem(BaseModel):
    code: str
    name: str
    type: str


@router.get('/accounts', response_model=List[COAItem])
def list_accounts(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(AccountModel).filter(AccountModel.user_id == user.id, AccountModel.is_active == True).order_by(AccountModel.type, AccountModel.code).all()
    return [COAItem(code=r.code, name=r.name, type=r.type) for r in rows]


@router.post('/seed-coa')
def seed_default_coa(user=Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(AccountModel).filter(AccountModel.user_id == user.id).count()
    if existing > 0:
        return { 'status': 'exists' }
    defaults = [
        # Assets
        ('1000', 'Cash', 'asset'),
        ('1100', 'Goal Fund', 'asset'),
        ('1200', 'Investment Account', 'asset'),
        ('1300', 'Property', 'asset'),
        # Liabilities
        ('2000', 'Mortgage', 'liability'),
        ('2100', 'Auto Loan', 'liability'),
        ('2200', 'Credit Card', 'liability'),
        # Equity
        ('3000', 'Household Equity', 'equity'),
        # Income
        ('4000', 'Salary', 'income'),
        ('4100', 'Dividends', 'income'),
        ('4200', 'Rental Income', 'income'),
        # Expenses
        ('5000', 'Rent', 'expense'),
        ('5100', 'Maintenance', 'expense'),
        ('5200', 'Insurance', 'expense'),
        ('5300', 'Property Tax', 'expense'),
        ('5400', 'Loan Interest', 'expense'),
        ('5500', 'PAYE Tax', 'expense')
    ]
    for code, name, typ in defaults:
        db.add(AccountModel(user_id=user.id, code=code, name=name, type=typ))
    db.commit()
    return { 'status': 'seeded', 'count': len(defaults) }
