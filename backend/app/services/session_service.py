import json
import uuid
import time
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("uvicorn")

class SessionService:
    def __init__(self):
        self.redis_client = None
        self._in_memory_store: Dict[str, Dict[str, Any]] = {}
        
        if settings.REDIS_URL:
            try:
                import redis
                self.redis_client = redis.from_url(settings.REDIS_URL)
                # Check connection
                self.redis_client.ping()
                logger.info("Successfully connected to Redis for temporary storage.")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis ({e}). Falling back to in-memory session cache.")
                self.redis_client = None
        else:
            logger.info("No REDIS_URL provided. Using in-memory session cache.")

    def create_session(self, data: Dict[str, Any]) -> str:
        session_id = str(uuid.uuid4())
        self.set_session(session_id, data)
        return session_id

    def set_session(self, session_id: str, data: Dict[str, Any]) -> None:
        expiry = settings.SESSION_EXPIRY_SECONDS
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"session:{session_id}",
                    expiry,
                    json.dumps(data)
                )
                return
            except Exception as e:
                logger.error(f"Redis write error: {e}. Writing to in-memory fallback.")
                
        # In-memory storage with expiry timestamp
        self._in_memory_store[session_id] = {
            "data": data,
            "expires_at": time.time() + expiry
        }
        self._clean_expired_in_memory()

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        if not session_id:
            return None
            
        if self.redis_client:
            try:
                raw_data = self.redis_client.get(f"session:{session_id}")
                if raw_data:
                    return json.loads(raw_data)
                return None
            except Exception as e:
                logger.error(f"Redis read error: {e}. Checking in-memory fallback.")

        # Check in-memory
        if session_id in self._in_memory_store:
            session = self._in_memory_store[session_id]
            if time.time() < session["expires_at"]:
                return session["data"]
            else:
                del self._in_memory_store[session_id]
        return None

    def delete_session(self, session_id: str) -> None:
        if not session_id:
            return
            
        if self.redis_client:
            try:
                self.redis_client.delete(f"session:{session_id}")
                return
            except Exception as e:
                logger.error(f"Redis delete error: {e}")

        if session_id in self._in_memory_store:
            del self._in_memory_store[session_id]

    def _clean_expired_in_memory(self) -> None:
        now = time.time()
        expired_keys = [
            k for k, v in self._in_memory_store.items() if now >= v["expires_at"]
        ]
        for k in expired_keys:
            del self._in_memory_store[k]

session_service = SessionService()
