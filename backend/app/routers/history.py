from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime

from app.models.schemas import SearchHistory, SearchHistoryResponse
from app.database.mongodb import get_database
from app.config import settings

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=SearchHistoryResponse)
async def get_search_history(
    limit: int = Query(default=50, le=settings.search_history_limit)
):
    """
    Get recent search history.

    Returns last N searches ordered by timestamp (newest first).
    """
    try:
        db = get_database()

        # Fetch recent searches
        cursor = db.search_history.find().sort("timestamp", -1).limit(limit)
        history = await cursor.to_list(length=limit)

        # Convert to SearchHistory models
        history_items = [SearchHistory(**item) for item in history]

        total = await db.search_history.count_documents({})

        return SearchHistoryResponse(
            history=history_items,
            total=total
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("")
async def clear_search_history():
    """Clear all search history."""
    try:
        db = get_database()
        result = await db.search_history.delete_many({})

        return {
            "status": "success",
            "deleted_count": result.deleted_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
