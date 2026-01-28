from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
from app.config import get_settings

settings = get_settings()

# Create engine with SQLite-specific settings
# check_same_thread=False is required for SQLite with FastAPI
# StaticPool ensures connection persistence for SQLite
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=settings.debug, 
)


def create_db_and_tables():
    """Create all database tables from SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.
    """
    with Session(engine) as session:
        yield session
