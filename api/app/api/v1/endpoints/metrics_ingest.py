import os
import json
from datetime import datetime
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/metrics", tags=["metrics-clean"])

METRICS_DIR = os.environ.get("METRICS_DIR", "/tmp/metrics")


def _ensure_dir(path: str) -> None:
    try:
        os.makedirs(path, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed creating metrics dir: {e}")


@router.post("/ingest", status_code=status.HTTP_202_ACCEPTED)
async def ingest_metrics(payload: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Accepts lightweight client-side performance metrics and stores them to a local file.

    This is a best-effort sink to enable observability without DB dependencies.
    """
    try:
        _ensure_dir(METRICS_DIR)
        entry = {
            "user_id": current_user.id,
            "ts": datetime.utcnow().isoformat() + "Z",
            **payload
        }
        path = os.path.join(METRICS_DIR, f"user_{current_user.id}.log")
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
        return {"status": "accepted"}
    except HTTPException:
        raise
    except Exception as e:
        # Do not fail UX if metrics ingestion fails
        raise HTTPException(status_code=500, detail=f"Failed ingesting metrics: {e}")

