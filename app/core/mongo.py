import os
from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger
from app.core.config import settings

class MongoDBManager:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect(cls):
        try:
            mongo_uri = os.getenv("MONGODB_URI", settings.MONGODB_URI)
            if not mongo_uri:
                logger.warning("No MONGODB_URI set, skipping MongoDB connection")
                return
            
            # Using tlsAllowInvalidCertificates for development/testing if needed, 
            # but ideally should be false in prod
            cls.client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
            cls.db = cls.client[settings.MONGODB_DB]
            
            # Ping to verify connection
            await cls.db.command("ping")
            logger.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            cls.client = None

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            logger.info("Disconnected from MongoDB")

    @classmethod
    async def log_telegram_payload(cls, payload: dict):
        if not cls.db:
            return
        try:
            collection = cls.db.telegram_raw_logs
            await collection.insert_one(payload)
        except Exception as e:
            logger.error(f"Error logging to MongoDB: {e}")

mongodb = MongoDBManager()
