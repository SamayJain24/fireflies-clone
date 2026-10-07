from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# SQLite database URL. Configured with check_same_thread=False for multithreaded FastAPI workers
SQLALCHEMY_DATABASE_URL = "sqlite:///./fireflies.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # Set to True for SQL query debugging
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session
    and ensures clean closure after the request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """
    Creates all database tables defined in SQLAlchemy models.
    """
    from backend.app.models.base import Base
    import backend.app.models.meeting
    import backend.app.models.transcript
    import backend.app.models.action_item
    import backend.app.models.bonus
    
    Base.metadata.create_all(bind=engine)
