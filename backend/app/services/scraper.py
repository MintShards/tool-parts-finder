from typing import List, Dict, Optional
from urllib.parse import quote_plus
from app.models.schemas import VendorResult, ParsedQuery


class VendorScraper:
    """Multi-vendor search URL generation and scraping."""

    # Vendor URL templates for instant search (Canadian websites - Surrey BC focus)
    VENDOR_TEMPLATES = {
        # Search Engines
        "google": "https://www.google.com/search?q={query}&gl=ca&hl=en",
        "google_shopping": "https://www.google.com/search?q={query}&tbm=shop&gl=ca&hl=en",
        "bing_shopping": "https://www.bing.com/shop?q={query}&cc=CA",
        "duckduckgo_shopping": "https://duckduckgo.com/?q={query}+buy&ia=web",
        "youtube": "https://www.youtube.com/results?search_query={query}+repair",

        # National Marketplaces
        "ebay": "https://www.ebay.ca/sch/i.html?_nkw={query}",
        "amazon": "https://www.amazon.ca/s?k={query}",
        # Note: Kijiji removed - search doesn't work properly with URL parameters

        # Local BC/Surrey Tool Stores
        "kms_tools": "https://www.kmstools.com/catalogsearch/result/?q={query}",
        # Note: Princess Auto removed - their search doesn't support URL parameters

        # Major Canadian Retailers
        "canadian_tire": "https://www.canadiantire.ca/en/search-results.html?q={query}",
        "home_depot": "https://www.homedepot.ca/search?q={query}",
        # Note: RONA removed - strict bot protection (403)

        # Pneumatic Specialists
        "contractor_cave": "https://contractorcave.ca/?s={query}",
        "canada_tool_parts": "https://www.canadatoolparts.ca/?s={query}",
        # Note: AirToolPro and Grainger removed - bot protection blocks automated access
    }

    # Vendor display names and logos
    VENDOR_INFO = {
        # Search Engines
        "google": {
            "name": "Google Search (Canada)",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
        },
        "google_shopping": {
            "name": "Google Shopping (Canada)",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
        },
        "bing_shopping": {
            "name": "Bing Shopping (Canada)",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bing_Fluent_Logo.svg"
        },
        "duckduckgo_shopping": {
            "name": "DuckDuckGo Shopping",
            "logo": "https://upload.wikimedia.org/wikipedia/en/9/90/The_DuckDuckGo_Duck.png"
        },
        "youtube": {
            "name": "YouTube (Repair Videos)",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
        },

        # National Marketplaces
        "ebay": {
            "name": "eBay Canada",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"
        },
        "amazon": {
            "name": "Amazon Canada",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
        },

        # Local BC/Surrey Tool Stores
        "kms_tools": {
            "name": "KMS Tools (BC)",
            "logo": None
        },

        # Major Canadian Retailers
        "canadian_tire": {
            "name": "Canadian Tire",
            "logo": "https://upload.wikimedia.org/wikipedia/en/4/42/Canadian_Tire_logo.svg"
        },
        "home_depot": {
            "name": "Home Depot Canada",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg"
        },

        # Pneumatic Specialists
        "contractor_cave": {
            "name": "Contractor Cave",
            "logo": None
        },
        "canada_tool_parts": {
            "name": "Canada Tool Parts",
            "logo": None
        },
    }

    @classmethod
    async def search_all_vendors(
        cls,
        query: str,
        vendors: List[str]
    ) -> List[VendorResult]:
        """
        Generate search URLs for all requested vendors.

        For Phase 1 (MVP), we generate instant URLs.
        Future phases will add scraping for pricing.
        """
        results = []

        for vendor in vendors:
            if vendor not in cls.VENDOR_TEMPLATES:
                continue

            result = await cls._generate_vendor_result(vendor, query)
            results.append(result)

        return results

    @classmethod
    async def _generate_vendor_result(
        cls,
        vendor: str,
        query: str
    ) -> VendorResult:
        """Generate a vendor result with URL and metadata."""
        template = cls.VENDOR_TEMPLATES[vendor]
        encoded_query = quote_plus(query)
        url = template.format(query=encoded_query)

        vendor_info = cls.VENDOR_INFO.get(vendor, {"name": vendor.title(), "logo": None})

        return VendorResult(
            vendor=vendor_info["name"],
            url=url,
            method="instant",
            status="ready",
            logo_url=vendor_info["logo"]
        )

    @classmethod
    async def scrape_pricing(cls, vendor: str, query: str) -> Optional[Dict[str, float]]:
        """
        Scrape pricing from vendor (Phase 4 feature).

        For now, returns None. Will implement in Phase 4 with Playwright.
        """
        # TODO: Implement in Phase 4
        return None
