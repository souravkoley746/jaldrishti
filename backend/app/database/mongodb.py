"""
MongoDB Atlas Connection & Database Manager for JALDRISHTI.
Provides asynchronous connection pooling and singleton collection access
with resilient fallback for local development & testing.
"""

import os
from typing import Optional, Any, Dict, List
import structlog
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = structlog.get_logger()

class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.docs:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                res = dict(doc)
                if "_id" not in res:
                    res["_id"] = res.get("userId") or res.get("feedbackId") or res.get("token") or "mem_id"
                return res
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        class AsyncCursor:
            def __init__(self, items):
                self.items = items
            def __aiter__(self):
                self.iter = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self.iter)
                except StopIteration:
                    raise StopAsyncIteration
        
        filtered = []
        for doc in self.docs:
            if not query:
                filtered.append(dict(doc))
            else:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    filtered.append(dict(doc))
        return AsyncCursor(filtered)

    async def insert_one(self, doc: Dict[str, Any]):
        d = dict(doc)
        if "_id" not in d:
            d["_id"] = d.get("userId") or d.get("feedbackId") or d.get("token") or "mem_id"
        self.docs.append(d)
        return type("Result", (), {"inserted_id": d["_id"]})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        target = await self.find_one(query)
        if target:
            if "$set" in update:
                for k, v in update["$set"].items():
                    target[k] = v
            if "$push" in update:
                for k, v in update["$push"].items():
                    target.setdefault(k, []).append(v)
            if "$pull" in update:
                for k, v in update["$pull"].items():
                    if k in target and isinstance(target[k], list):
                        cond = v.get("replyId") if isinstance(v, dict) else None
                        if cond:
                            target[k] = [item for item in target[k] if item.get("replyId") != cond]
            for idx, d in enumerate(self.docs):
                if d.get("userId") == target.get("userId") or d.get("feedbackId") == target.get("feedbackId") or d.get("token") == target.get("token"):
                    self.docs[idx] = target
                    break
        return type("Result", (), {"modified_count": 1 if target else 0})()

    async def delete_one(self, query: Dict[str, Any]):
        target = await self.find_one(query)
        if target:
            self.docs = [d for d in self.docs if d != target]
            return type("Result", (), {"deleted_count": 1})()
        return type("Result", (), {"deleted_count": 0})()

    async def delete_many(self, query: Dict[str, Any]):
        initial_len = len(self.docs)
        if "token" in query:
            self.docs = [d for d in self.docs if d.get("token") != query["token"]]
        return type("Result", (), {"deleted_count": initial_len - len(self.docs)})()

class InMemoryDatabase:
    def __init__(self):
        self.users = InMemoryCollection("users")
        self.sessions = InMemoryCollection("sessions")
        self.feedbacks = InMemoryCollection("feedbacks")

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None
    is_fallback: bool = False

mongo_manager = MongoDBManager()

def get_mongodb_uri() -> str:
    """Retrieves MONGODB_URI safely from environment or settings."""
    uri = os.getenv("MONGODB_URI") or settings.MONGODB_URI
    return uri

async def connect_to_mongo() -> bool:
    """Initializes AsyncIOMotorClient connection pool to MongoDB Atlas."""
    try:
        uri = get_mongodb_uri()
        db_name = os.getenv("MONGODB_DB_NAME") or settings.MONGODB_DB_NAME or "jaldrishti"
        
        # Initialize Motor Async Client
        mongo_manager.client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
            maxPoolSize=20,
            minPoolSize=5
        )
        mongo_manager.db = mongo_manager.client[db_name]
        
        # Test connection ping
        await mongo_manager.client.admin.command('ping')
        mongo_manager.is_fallback = False
        logger.info("MongoDB Atlas connection established successfully", database=db_name)
        return True
    except Exception as e:
        logger.warning("MongoDB Atlas connection unavailable; activating in-memory database fallback.", error=str(e))
        mongo_manager.db = InMemoryDatabase()
        mongo_manager.is_fallback = True
        return False

async def close_mongo_connection():
    """Closes Motor client connection pool."""
    if mongo_manager.client and not mongo_manager.is_fallback:
        mongo_manager.client.close()
        logger.info("MongoDB Atlas connection closed")

def get_database() -> Any:
    """Returns authoritative MongoDB database instance."""
    if mongo_manager.db is None:
        mongo_manager.db = InMemoryDatabase()
        mongo_manager.is_fallback = True
    return mongo_manager.db
