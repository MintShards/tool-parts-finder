from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models.schemas import (
    SearchRequest,
    SearchResponse,
    ParsedQuery,
    SearchHistory
)
from app.services.parser import QueryParser
from app.services.scraper import VendorScraper
from app.database.mongodb import get_database

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_parts(request: SearchRequest):
    """
    Search for tool parts across multiple vendors.

    Returns instant URLs for vendor search results.
    """
    try:
        # Parse the query
        parsed = QueryParser.parse(request.query)

        # Build optimized search query
        search_query = QueryParser.build_search_query(parsed)

        # Get search results from all vendors
        results = await VendorScraper.search_all_vendors(search_query, request.vendors)

        # Save to search history
        db = get_database()
        history_entry = SearchHistory(
            query=request.query,
            parsed=parsed,
            timestamp=datetime.utcnow(),
            results_opened=[r.vendor for r in results]
        )

        await db.search_history.insert_one(history_entry.model_dump(by_alias=True, exclude={"id"}))

        return SearchResponse(
            parsed=parsed,
            results=results,
            ai_suggestions=None  # Phase 3 feature
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
