from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SearchRequest,
    SearchResponse
)
from app.services.parser import QueryParser
from app.services.scraper import VendorScraper

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_parts(request: SearchRequest):
    """
    Search for tool parts across multiple vendors.

    Returns instant URLs for vendor search results.
    Note: History is now stored in frontend localStorage.
    """
    try:
        # Parse the query
        parsed = QueryParser.parse(request.query)

        # Build optimized search query
        search_query = QueryParser.build_search_query(parsed)

        # Get search results from all vendors
        results = await VendorScraper.search_all_vendors(search_query, request.vendors)

        return SearchResponse(
            parsed=parsed,
            results=results,
            ai_suggestions=None  # Phase 3 feature
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
