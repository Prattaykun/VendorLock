
import asyncio
import os
import sys
from dotenv import load_dotenv
import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient

async def test_connections():
    load_dotenv()
    
    # Test PostgreSQL
    pg_url = os.getenv("DATABASE_URL")
    if pg_url:
        print(f"Testing PostgreSQL connection to {pg_url.split('@')[-1]}...")
        try:
            # Clean URL for asyncpg
            clean_url = pg_url.replace("postgresql+asyncpg://", "postgresql://")
            conn = await asyncpg.connect(clean_url)
            print("[SUCCESS] PostgreSQL connected successfully!")
            await conn.close()
        except Exception as e:
            print(f"[FAILURE] PostgreSQL connection failed: {e}")
    else:
        print("[WARNING] DATABASE_URL not found in .env")

    # Test MongoDB
    mongo_uri = os.getenv("MONGODB_URI")
    if mongo_uri:
        print(f"Testing MongoDB connection...")
        try:
            client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
            info = await client.server_info()
            print(f"[SUCCESS] MongoDB connected successfully! Server version: {info.get('version')}")
        except Exception as e:
            print(f"[FAILURE] MongoDB connection failed: {e}")
    else:
        print("[WARNING] MONGODB_URI not found in .env")

if __name__ == "__main__":
    asyncio.run(test_connections())
