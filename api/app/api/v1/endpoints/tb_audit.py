from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Any, Optional
from datetime import datetime
import os, json

from app.auth import get_current_user
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models import TBAuditEntry

router = APIRouter(prefix="/tb-audit", tags=["tb-audit"])

AUDIT_DIR = os.environ.get("TB_AUDIT_DIR", "/tmp/tb_audit_logs")
os.makedirs(AUDIT_DIR, exist_ok=True)


class Suggestion(BaseModel):
    type: str
    id: Optional[Any] = None
    goalId: Optional[Any] = None
    name: Optional[str] = None
    monthly_amount: Optional[float] = None
    amount: Optional[float] = None
    reason: Optional[str] = None


class AuditEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    suggestions: List[Suggestion]
    meta: Optional[dict] = None


def _file_for_user(user_id: int) -> str:
    return os.path.join(AUDIT_DIR, f"user_{user_id}_tb_audit.json")


@router.get("/entries", response_model=List[AuditEntry])
def list_entries(user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Prefer DB; fallback to file if table missing
    try:
        rows = db.query(TBAuditEntry).filter(TBAuditEntry.user_id == user.id).order_by(TBAuditEntry.timestamp.desc()).all()
        return [AuditEntry(timestamp=r.timestamp, suggestions=json.loads(r.suggestions_json), meta=json.loads(r.meta_json) if r.meta_json else None) for r in rows]
    except Exception:
        path = _file_for_user(user.id)
        if not os.path.exists(path):
            return []
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            return [AuditEntry(**e) for e in data]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed reading audit log: {e}")


@router.post("/entries", response_model=AuditEntry)
def add_entry(entry: AuditEntry, user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        row = TBAuditEntry(
            user_id=user.id,
            timestamp=entry.timestamp,
            suggestions_json=json.dumps([s.dict() for s in entry.suggestions]),
            meta_json=json.dumps(entry.meta) if entry.meta else None
        )
        db.add(row)
        db.commit()
        return entry
    except Exception as e:
        # Fallback to file system if DB not available
        path = _file_for_user(user.id)
        try:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    data = json.load(f)
            else:
                data = []
            data.append(json.loads(entry.json()))
            with open(path, 'w') as f:
                json.dump(data, f)
            return entry
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Failed writing audit log: {e}; fallback failed: {e2}")


@router.delete("/entries")
def clear_entries(user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db.query(TBAuditEntry).filter(TBAuditEntry.user_id == user.id).delete()
        db.commit()
        return {"status": "cleared"}
    except Exception:
        path = _file_for_user(user.id)
        try:
            if os.path.exists(path):
                os.remove(path)
            return {"status": "cleared"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed clearing audit log: {e}")
