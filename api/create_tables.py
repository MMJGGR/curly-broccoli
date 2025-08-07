#!/usr/bin/env python3
"""
Script to manually create database tables
"""
import os
import sys

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Base

if __name__ == "__main__":
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")