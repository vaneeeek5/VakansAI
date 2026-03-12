import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from backend.app.models import Topic

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres" # default if local, but we don't have db locally
print("No local DB available to test directly. We rely on the fixes.")
