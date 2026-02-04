from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic v2."""

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema

        def validate_from_any(value):
            if isinstance(value, ObjectId):
                return value
            if isinstance(value, str) and ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError(f"Invalid ObjectId: {value}")

        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.no_info_after_validator_function(
                validate_from_any,
                core_schema.str_schema(),
            ),
        ])

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        field_schema.update(type="string")


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
        "youtube",  # Repair videos first - most valuable for learning
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
    ]


class SearchResponse(BaseModel):
    """Response containing search results."""
    parsed: ParsedQuery
    results: List[VendorResult]
    ai_suggestions: Optional[Dict[str, Any]] = None


# ========== Search History Models ==========

class SearchHistory(BaseModel):
    """Search history entry."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    query: str
    parsed: ParsedQuery
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    results_opened: List[str] = []
    marked_ordered: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}


class SearchHistoryResponse(BaseModel):
    """Response containing search history."""
    history: List[SearchHistory]
    total: int


# ========== Favorites Models ==========

class Favorite(BaseModel):
    """Favorite part entry."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    part_description: str
    search_query: str
    times_ordered: int = 0
    last_ordered: Optional[datetime] = None
    preferred_vendor: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}


class FavoriteCreate(BaseModel):
    """Request to create a favorite."""
    part_description: str
    search_query: str


class FavoriteUpdate(BaseModel):
    """Request to update a favorite."""
    times_ordered: Optional[int] = None
    last_ordered: Optional[datetime] = None
    preferred_vendor: Optional[str] = None


class FavoriteResponse(BaseModel):
    """Response containing favorites."""
    favorites: List[Favorite]
    total: int


# ========== Parts Catalog Models ==========

class PartDetail(BaseModel):
    """Individual part from PDF extraction."""
    callout: str
    description: str
    part_number: Optional[str] = None


class PartsCatalog(BaseModel):
    """Cached PDF catalog data."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    pdf_filename: str
    brand: Optional[str] = None
    model: Optional[str] = None
    parts: List[PartDetail] = []
    extracted_at: datetime = Field(default_factory=datetime.utcnow)
    expiry: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}


# ========== Equivalents Models ==========

class EquivalentPart(BaseModel):
    """Cross-reference equivalent part."""
    brand: str
    part_number: str
    confidence: float
    source: str = "ai_generated"  # or "user_confirmed"
    order_count: int = 0


class EquivalentsMap(BaseModel):
    """Cross-brand equivalents mapping."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    primary_part: Dict[str, Any]
    equivalents: List[EquivalentPart] = []
    learning_data: Dict[str, Any] = {}

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ========== Order Pattern Models ==========

class OrderFeedback(BaseModel):
    """User feedback on what was actually ordered."""
    query: str
    vendor: str
    part_ordered: str
    price: Optional[float] = None


class OrderPattern(BaseModel):
    """Order pattern tracking for AI learning."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    part_query: str
    ordered_from: str
    price_paid: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    equivalent_used: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
