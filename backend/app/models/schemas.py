from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# ========== Search Models ==========

class ParsedQuery(BaseModel):
    """Parsed search query with brand, model, and part."""
    brand: Optional[str] = None
    model: Optional[str] = None
    part: Optional[str] = None
    raw_query: str


class VendorResult(BaseModel):
    """Search result from a single vendor."""
    vendor: str
    url: str
    method: str  # "instant" or "scraping"
    status: str  # "ready", "processing", "failed"
    pricing: Optional[Dict[str, float]] = None  # {"min": 24.99, "max": 45.00}
    eta: Optional[str] = None  # "2s" for processing vendors
    logo_url: Optional[str] = None


class SearchRequest(BaseModel):
    """Request to search across vendors."""
    query: str
    vendors: List[str] = [
        # Search Engines
        "google",
        "google_shopping",
        "bing_shopping",
        "duckduckgo",
        # National Marketplaces
        "ebay",
        "amazon",
        # Local BC/Surrey Stores
        "kms_tools",
        # Major Retailers
        "canadian_tire",
        "home_depot",
        # Pneumatic Specialists
        "contractor_cave",
        "canada_tool_parts",
        # Repair Videos
        "youtube",  # Last - for learning how to install/repair
    ]


class SearchResponse(BaseModel):
    """Response containing search results."""
    parsed: ParsedQuery
    results: List[VendorResult]
    ai_suggestions: Optional[Dict[str, Any]] = None


# ========== Parts Catalog Models ==========

class PartDetail(BaseModel):
    """Individual part from PDF extraction."""
    callout: str
    description: str
    part_number: Optional[str] = None
