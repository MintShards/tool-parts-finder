from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class MongoDB:
    """MongoDB connection manager."""

    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None


mongodb = MongoDB()


async def connect_to_mongodb():
    """Connect to MongoDB Atlas."""
    mongodb.client = AsyncIOMotorClient(settings.mongodb_uri)
    mongodb.database = mongodb.client[settings.database_name]
    print(f"✅ Connected to MongoDB: {settings.database_name}")


async def close_mongodb_connection():
    """Close MongoDB connection."""
    if mongodb.client:
        mongodb.client.close()
        print("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return mongodb.database
