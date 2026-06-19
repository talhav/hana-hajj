import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()

_client: Optional[AsyncIOMotorClient] = None


def get_database() -> AsyncIOMotorDatabase:
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    db_name = os.getenv("MONGODB_DB", "hana_travels")
    return _client[db_name]


async def close_database() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
