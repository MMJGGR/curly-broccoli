from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.database import get_db
from app.models import TBAuditEntry
from .ledger import JournalEntryModel
import json

router = APIRouter(prefix="/events", tags=["events"])


@router.get('/recent')
def recent_events(limit: int = 20, user=Depends(get_current_user), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Consolidate recent events from TB audit and Journal meta.
    Returns newest-first up to `limit` entries with type, timestamp, title/description.
    """
    out: List[Dict[str, Any]] = []
    # Journal entries with meta
    try:
        jrows = db.query(JournalEntryModel).filter(JournalEntryModel.user_id == user.id).order_by(JournalEntryModel.timestamp.desc()).limit(limit).all()
        for r in jrows:
            meta = None
            try:
                meta = json.loads(r.meta_json) if r.meta_json else None
            except Exception:
                meta = None
            out.append({
                'type': 'journal',
                'timestamp': r.timestamp,
                'title': r.description or 'Journal Entry',
                'meta': meta or {}
            })
    except Exception:
        pass
    # TB audit entries
    try:
        arows = db.query(TBAuditEntry).filter(TBAuditEntry.user_id == user.id).order_by(TBAuditEntry.timestamp.desc()).limit(limit).all()
        for r in arows:
            out.append({
                'type': 'audit',
                'timestamp': r.timestamp,
                'title': 'Trial Balance Audit',
                'meta': {'suggestions': json.loads(r.suggestions_json)}
            })
    except Exception:
        pass
    # Sort newest-first and limit
    out.sort(key=lambda e: e['timestamp'], reverse=True)
    return { 'events': out[:limit] }

