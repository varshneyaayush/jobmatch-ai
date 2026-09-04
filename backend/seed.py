import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import engine, Base, SessionLocal
from app.database.seed_data import seed_database
import app.models

def main():
    print("Creating DB tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        print("SUCCESS: Database initialized and seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
