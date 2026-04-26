"""
Database initialisation — Supabase (PostgreSQL) + MongoDB.
"""
import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client, Client
from loguru import logger

from app.core.config import settings

# ── Singletons ────────────────────────────────────────────────────────────────
_pg_pool: asyncpg.Pool | None = None
_mongo_client: AsyncIOMotorClient | None = None
_supabase_client: Client | None = None


async def init_db():
    """Initialise all database connections on app startup."""
    global _pg_pool, _mongo_client, _supabase_client

    # PostgreSQL pool (direct asyncpg — for high-throughput queries)
    try:
        _pg_pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"),
            min_size=5,
            max_size=20,
            command_timeout=60,
        )
        logger.info("PostgreSQL pool initialised")
    except Exception as e:
        logger.warning(f"PostgreSQL pool failed (non-fatal in dev): {e}")

    # MongoDB
    try:
        _mongo_client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        await _mongo_client.server_info()
        logger.info("MongoDB connected")
    except Exception as e:
        logger.warning(f"MongoDB connection failed (non-fatal in dev): {e}")

    # Supabase client
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            logger.info("Supabase client initialised")
        except Exception as e:
            logger.warning(f"Supabase init failed: {e}")


async def close_db():
    """Gracefully close all connections on app shutdown."""
    if _pg_pool:
        await _pg_pool.close()
        logger.info("PostgreSQL pool closed")
    if _mongo_client:
        _mongo_client.close()
        logger.info("MongoDB client closed")


def get_pg_pool() -> asyncpg.Pool:
    if _pg_pool is None:
        raise RuntimeError("PostgreSQL pool not initialised")
    return _pg_pool


def get_mongo_db():
    if _mongo_client is None:
        raise RuntimeError("MongoDB client not initialised")
    return _mongo_client[settings.MONGODB_DB]


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        # Lazy init — create client on first access
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                logger.info("✅ Supabase client lazy-initialised")
            except Exception as e:
                raise RuntimeError(f"Supabase client init failed: {e}")
        else:
            raise RuntimeError("Supabase URL or anon key not configured in .env")
    return _supabase_client
