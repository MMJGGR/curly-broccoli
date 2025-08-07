from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Base and engine from the main database configuration
from app.database import engine as main_app_engine, get_db
from app.models import Base

router = APIRouter(prefix="/dev", tags=["dev"])

@router.post("/clear-db", status_code=200)
def clear_db(db: Session = Depends(get_db)):
    """
    Clears the database by dropping and recreating all tables.
    Designed for PostgreSQL.
    """
    try:
        logger.info("Attempting to clear PostgreSQL database.")

        # Close the session from get_db to release any locks
        db.close()

        # Use a fresh connection for schema manipulation
        with main_app_engine.connect() as connection:
            with connection.begin(): # Begin a transaction for DDL operations
                logger.info("Dropping all tables.")
                Base.metadata.drop_all(bind=connection)
                logger.info("All tables dropped.")

                logger.info("Creating all tables.")
                Base.metadata.create_all(bind=connection)
                logger.info("All tables created.")

        return {"message": "Database cleared successfully"}
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemyError during database clearing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database clearing failed (SQLAlchemyError): {e}")
    except Exception as e:
        logger.error(f"Unexpected error during database clearing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during database clearing: {str(e)}")