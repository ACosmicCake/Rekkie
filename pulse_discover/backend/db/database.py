from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Hardcode the database URL to use the local SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Add connect_args={"check_same_thread": False} for SQLite compatibility with FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
