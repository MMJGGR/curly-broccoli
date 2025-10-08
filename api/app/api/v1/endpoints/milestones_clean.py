import os
import json
from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.models import User


router = APIRouter(prefix="/milestones", tags=["milestones-clean"])

MILESTONES_DIR = os.environ.get("MILESTONES_DIR", "/tmp/milestones")


def _ensure_dir(path: str) -> None:
    try:
        os.makedirs(path, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed creating milestones dir: {e}")


def _file_for_user(user_id: Any) -> str:
    return os.path.join(MILESTONES_DIR, f"user_{user_id}.json")


def _read_all(path: str) -> List[Dict[str, Any]]:
    try:
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f) or []
    except json.JSONDecodeError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading milestones: {e}")


def _write_all(path: str, items: List[Dict[str, Any]]) -> None:
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(items, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed writing milestones: {e}")


@router.get("/")
async def list_milestones(current_user: User = Depends(get_current_user)):
    """List milestones for current user (file-based persistence)."""
    _ensure_dir(MILESTONES_DIR)
    path = _file_for_user(current_user.id)
    return {"user_id": current_user.id, "milestones": _read_all(path)}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_milestone(payload: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Create/append a milestone for current user.

    Payload is stored as-is with server-generated fields id and ts if missing.
    """
    _ensure_dir(MILESTONES_DIR)
    path = _file_for_user(current_user.id)
    items = _read_all(path)
    item = dict(payload or {})
    item.setdefault("id", f"ms_{int(datetime.utcnow().timestamp()*1000)}")
    item.setdefault("created_at", datetime.utcnow().isoformat() + "Z")
    items.append(item)
    _write_all(path, items)
    return {"ok": True, "milestone": item}


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(milestone_id: str, current_user: User = Depends(get_current_user)):
    """Delete a milestone by id for current user."""
    _ensure_dir(MILESTONES_DIR)
    path = _file_for_user(current_user.id)
    items = [m for m in _read_all(path) if str(m.get("id")) != str(milestone_id)]
    _write_all(path, items)
    return None

