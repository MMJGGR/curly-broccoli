# File: api/app/dev.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db, Base, engine

router = APIRouter(prefix="/dev", tags=["dev"])

@router.post("/clear-db")
def clear_db(db: Session = Depends(get_db)):
    """
    Clear all tables in the database.
    """
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    return {"message": "Database cleared"}
