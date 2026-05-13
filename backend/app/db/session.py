from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.services.catalog import seed_products


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
if settings.database_url.startswith("sqlite:///"):
    database_file = settings.database_url.replace("sqlite:///", "", 1)
    if database_file and database_file != ":memory:":
        Path(database_file).parent.mkdir(parents=True, exist_ok=True)
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database():
    from app.models import cart_item, order, product, user  # noqa: F401

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()
