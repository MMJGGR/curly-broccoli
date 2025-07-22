from app.database import Base, engine
from app.models import User, Profile, RiskProfile, Account, Transaction, Milestone, Goal # Import all models

print("Attempting to create all tables...")
Base.metadata.create_all(bind=engine)
print("Tables created (if they didn't exist).")
