import re
from typing import Optional
from app.models.schemas import ParsedQuery


class QueryParser:
    """Parse search queries to extract brand, model, and part information."""

    # Common pneumatic and power tool brands (with common misspellings)
    BRANDS = [
        "ingersoll rand", "ir", "ingersol", "ingersoll",
        "chicago pneumatic", "cp",
        "snap-on", "snap on", "snapon",
        "mac tools", "mac",
        "dewalt", "de walt", "dwalt",
        "makita", "makitta", "maketa",
        "milwaukee", "milwakee", "milwaukie",
        "bosch", "bosh",
        "craftsman",
        "porter cable", "porter-cable",
        "bostitch",
        "senco",
        "paslode",
        "hitachi", "hikoki",
        "ridgid", "rigid",
        "husky",
        "campbell hausfeld",
        "ryobi",
        "black+decker", "black and decker", "b+d",
        "metabo",
        "festool",
        "hilti",
    ]

    # Tool types for context
    TOOL_TYPES = [
        "grinder", "angle grinder", "die grinder",
        "drill", "impact drill", "hammer drill", "rotary hammer",
        "driver", "impact driver", "screwdriver",
        "saw", "circular saw", "reciprocating saw", "jigsaw",
        "sander", "orbital sander", "belt sander",
        "ratchet", "air ratchet", "pneumatic ratchet",
        "wrench", "impact wrench", "air wrench",
        "nailer", "nail gun", "stapler",
        "compressor", "air compressor",
    ]

    # Common parts and their synonyms
    PART_SYNONYMS = {
        "brush": ["carbon brush", "motor brush"],
        "switch": ["on off switch", "power switch", "trigger switch"],
        "trigger": ["trigger switch", "variable speed trigger"],
        "chuck": ["drill chuck", "keyless chuck"],
        "bearing": ["ball bearing", "roller bearing"],
        "gear": ["gear set", "transmission gear"],
        "motor": ["electric motor", "motor assembly"],
        "armature": ["motor armature", "rotor"],
        "seal": ["o-ring", "o ring", "gasket", "seal kit"],
        "spring": ["compression spring", "return spring"],
        "valve": ["check valve", "pressure valve"],
        "piston": ["piston assembly", "piston ring"],
        "vane": ["rotor vane", "carbon vane"],
    }

    @classmethod
    def parse(cls, query: str) -> ParsedQuery:
        """
        Parse query to extract brand, model, and part.

        Examples:
        - "Makita DTD152 carbon brush" → brand: Makita, model: DTD152, part: carbon brush
        - "CB-440" → part number search
        - "makita brush" → brand: Makita, part: brush
        - "impact driver switch" → tool type + part
        """
        query_lower = query.lower().strip()

        brand, brand_matched = cls._extract_brand(query_lower)
        model = cls._extract_model(query_lower)
        part = cls._extract_part(query_lower, brand_matched, model)

        return ParsedQuery(
            brand=brand,
            model=model,
            part=part,
            raw_query=query
        )

    @classmethod
    def _extract_brand(cls, query: str) -> tuple[Optional[str], Optional[str]]:
        """
        Extract brand name from query (with fuzzy matching for misspellings).
        Returns: (normalized_brand_name, original_matched_text)
        """
        for brand in cls.BRANDS:
            if brand in query:
                # Normalize brand names (including misspellings)
                normalized = None
                if brand in ["ingersoll rand", "ir", "ingersol", "ingersoll"]:
                    normalized = "Ingersoll Rand"
                elif brand in ["chicago pneumatic", "cp"]:
                    normalized = "Chicago Pneumatic"
                elif brand in ["snap-on", "snap on", "snapon"]:
                    normalized = "Snap-on"
                elif brand in ["mac tools", "mac"]:
                    normalized = "Mac Tools"
                elif brand in ["dewalt", "de walt", "dwalt"]:
                    normalized = "Dewalt"
                elif brand in ["makita", "makitta", "maketa"]:
                    normalized = "Makita"
                elif brand in ["milwaukee", "milwakee", "milwaukie"]:
                    normalized = "Milwaukee"
                elif brand in ["bosch", "bosh"]:
                    normalized = "Bosch"
                elif brand in ["porter cable", "porter-cable"]:
                    normalized = "Porter Cable"
                elif brand in ["campbell hausfeld"]:
                    normalized = "Campbell Hausfeld"
                elif brand in ["hitachi", "hikoki"]:
                    normalized = "Hitachi"
                elif brand in ["ridgid", "rigid"]:
                    normalized = "Ridgid"
                elif brand in ["black+decker", "black and decker", "b+d"]:
                    normalized = "Black+Decker"
                else:
                    normalized = brand.title()

                return (normalized, brand)  # Return both normalized name and original match
        return (None, None)

    @classmethod
    def _extract_model(cls, query: str) -> Optional[str]:
        """Extract model number from query."""
        # Look for model patterns: numbers, alphanumeric codes
        # Order matters - try more specific patterns first
        patterns = [
            r'\b([A-Z]{2,4}-\d{2,5}[A-Z]?)\b',  # CB-440, IR-2135, DTD-152
            r'\b([A-Z]{2,4}\d{3,5}[A-Z]?)\b',  # DTD152, DWE402, CB440
            r'\b([A-Z]{2}\d{4,6})\b',  # N123456, CB440
            r'\b(\d{3,5}[A-Z]?)\b',  # 2135, 894A, 12345 (least specific, try last)
        ]

        for pattern in patterns:
            match = re.search(pattern, query.upper())
            if match:
                return match.group(1)
        return None

    @classmethod
    def _extract_part(cls, query: str, brand: Optional[str], model: Optional[str]) -> Optional[str]:
        """Extract part description from query."""
        # Remove brand and model from query to get part description
        remaining = query

        if brand:
            remaining = remaining.replace(brand.lower(), "").strip()

        if model:
            remaining = remaining.replace(model.lower(), "").strip()

        # Remove tool types from remaining to get just the part
        for tool_type in cls.TOOL_TYPES:
            remaining = remaining.replace(tool_type, "").strip()

        # Clean up extra spaces
        remaining = re.sub(r'\s+', ' ', remaining).strip()

        return remaining if remaining else None

    @classmethod
    def build_search_query(cls, parsed: ParsedQuery) -> str:
        """
        Build optimized search query from parsed components.

        Handles:
        - Brand + Model + Part: "Makita DTD152 carbon brush"
        - Short searches: "makita brush"
        - Part only: "carbon brush"
        - Model only: "DTD152"
        """
        components = []

        if parsed.brand:
            components.append(parsed.brand)
        if parsed.model:
            components.append(parsed.model)
        if parsed.part:
            # Expand part with synonyms if it's a short search
            part = parsed.part
            # Check if part is a single word that has synonyms
            if part and ' ' not in part.strip():
                for key, synonyms in cls.PART_SYNONYMS.items():
                    if key in part.lower():
                        # For short searches, keep it simple
                        part = key
                        break
            components.append(part)

        # Build the query
        if not components:
            # Fallback to raw query
            query = parsed.raw_query
        else:
            query = " ".join(components)

        # Add "parts" keyword for better filtering (unless it's already there or it's a part number search)
        # Don't add if query is very short (likely a part number)
        if len(query) > 10 and "parts" not in query.lower() and not query.upper().isupper():
            if parsed.brand or parsed.model:
                query += " parts"

        return query
