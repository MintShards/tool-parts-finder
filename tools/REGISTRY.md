# Tools Registry

**Version**: 1.0
**Last Updated**: 2025-03-22

This registry documents all available tools in the WAT framework. Tools are deterministic scripts that execute specific operations reliably.

---

## Current Architecture Note

The WAT framework describes standalone tools in `tools/`, but the current implementation has deterministic logic in `backend/app/services/`. Both approaches are valid - this registry documents the **actual** tools available.

**Migration Path**: Consider extracting service logic into standalone CLI tools for better modularity in Phase 3+.

---

## Available Tools

### 1. Query Parser
**Location**: `backend/app/services/parser.py`
**Function**: `parse_search_query()`

**Purpose**: Extract structured data (brand, model, part) from raw user queries

**Inputs**:
- `query` (string): Raw search query (e.g., "Ingersoll Rand 2135 trigger valve")

**Outputs**:
```python
{
    "brand": "Ingersoll Rand",  # or None if not detected
    "model": "2135",            # or None if not detected
    "part": "trigger valve",    # or None if not detected
    "raw_query": "Ingersoll Rand 2135 trigger valve"
}
```

**Cost**: Free (local processing)
**Latency**: ~50ms
**Error Handling**: Returns None for undetected fields, never raises exceptions

**Known Patterns**:
- Brand detection: 20+ pneumatic tool brands (Ingersoll Rand, DeWalt, Milwaukee, etc.)
- Model numbers: Alphanumeric patterns (2135, DCF899, M18, etc.)
- Part names: Common tool parts (trigger, anvil, switch, motor, etc.)

**Dependencies**: None (pure Python regex)

---

### 2. Vendor URL Generator
**Location**: `backend/app/services/scraper.py`
**Function**: `generate_search_urls()`

**Purpose**: Build optimized search URLs for 7 Canadian vendor websites

**Inputs**:
- `parsed_query` (dict): Structured query from parser
- `vendors` (list): Vendor keys to generate URLs for (default: all 7)

**Outputs**:
```python
{
    "ebay": "https://ebay.ca/sch/i.html?_nkw=Ingersoll+Rand+2135+trigger+valve",
    "amazon": "https://amazon.ca/s?k=Ingersoll+Rand+2135+trigger+valve",
    "kms": "https://www.kmstools.com/search?q=Ingersoll+Rand+2135+trigger+valve",
    "cdn_tire": "https://www.canadiantire.ca/en/search-results.html?q=Ingersoll+Rand+2135",
    "home_depot": "https://www.homedepot.ca/search?q=trigger+valve",
    "contractor_cave": "https://contractorcave.com/search?q=Ingersoll+Rand+2135",
    "cdn_tool_parts": "https://canadatoolparts.com/search?q=2135+trigger+valve"
}
```

**Cost**: Free (URL generation only, no API calls)
**Latency**: ~20ms
**Error Handling**: Returns empty dict if vendor template missing

**Vendor Templates**:
- Maintained in `VENDOR_TEMPLATES` dict
- URL-encodes query parameters automatically
- Vendor-specific optimization (see `workflows/search_parts.md`)

**Dependencies**: None (pure Python string formatting)

---

### 3. localStorage Storage Manager
**Location**: `frontend/src/services/storage.js`
**Functions**: `getHistory()`, `addToHistory()`, `getFavorites()`, `addFavorite()`, etc.

**Purpose**: Store search history and favorites in browser localStorage (replaces MongoDB)

**Inputs** (addToHistory):
```javascript
{
    query: "Ingersoll Rand 2135 trigger valve",
    parsed: {...},
    resultsOpened: ["eBay Canada", "Amazon Canada", ...]
}
```

**Outputs**: Data stored in browser localStorage

**Cost**: Free (uses browser storage, ~5-10MB limit)
**Latency**: <1ms (synchronous, no network calls)
**Error Handling**: Try/catch with console logging, graceful degradation

**Business Logic**:
- 50-search limit (auto-trims oldest)
- Duplicate detection (1-minute window)
- Sort favorites by `times_ordered` descending
- Export/import capabilities for backup

**Dependencies**: None (pure JavaScript)

**Benefits**:
- Zero infrastructure cost
- Works offline
- Privacy-first (data never leaves browser)
- Instant performance

---

### 4. Tab Manager
**Location**: `frontend/src/utils/tabManager.js`
**Function**: `openVendorTabs()`

**Purpose**: Open multiple vendor tabs with pop-up blocker handling

**Inputs**:
- `vendorUrls` (object): Map of vendor keys to URLs
- `onBlockDetected` (callback): Handler for pop-up block detection

**Outputs**: None (side effect: opens browser tabs)

**Cost**: Free (client-side only)
**Latency**: ~300ms for 4 tabs, ~600ms for 7 tabs (staggered)
**Error Handling**: Detects pop-up blocking, triggers fallback UI

**Browser Compatibility**:
- Chrome/Edge: 6 tabs reliable
- Firefox: 4 tabs reliable
- Safari: 3 tabs reliable (stricter blocking)
- Mobile: Manual fallback recommended

**Dependencies**: Browser `window.open()` API

---

## Future Tools (Planned)

### Phase 2: AI PDF Extractor
**Location**: `tools/extract_pdf_parts.py` (not yet created)
**Purpose**: Extract part numbers from exploded view diagrams using GPT-4 Vision
**Dependencies**: OpenAI API, python-multipart, aiofiles
**Cost**: $0.01-0.05 per PDF page (OpenAI pricing)

### Phase 4: Vendor Price Scraper
**Location**: `tools/scrape_vendor_pricing.py` (not yet created)
**Purpose**: Scrape real-time pricing from vendor websites
**Dependencies**: Playwright, BeautifulSoup4
**Cost**: Free (scraping only)
**Rate Limits**: See `workflows/error_recovery.md` for vendor-specific limits

### Phase 5: AI Learning Engine
**Location**: `tools/train_recommendation_model.py` (not yet created)
**Purpose**: Train AI on team's ordering patterns to improve suggestions
**Dependencies**: OpenAI API, scikit-learn
**Cost**: Variable based on training data size

---

## Tool Development Guidelines

When creating new tools:

1. **Standalone Execution**: Tool should run independently from FastAPI
2. **Clear I/O**: Document inputs, outputs, error cases
3. **Deterministic**: Same inputs → same outputs (no randomness)
4. **Testable**: Include unit tests in `tests/tools/`
5. **Documented**: Add to this registry immediately
6. **Error Handling**: Never crash - return error codes or raise specific exceptions
7. **Performance**: Target <1s for most operations
8. **Cost Tracking**: Document any API costs or resource usage

---

## Testing Tools

### Manual Testing
```bash
# Test query parser
cd backend
python -c "from app.services.parser import parse_search_query; print(parse_search_query('Ingersoll Rand 2135 trigger'))"

# Test URL generator
python -c "from app.services.scraper import generate_search_urls; print(generate_search_urls({'brand': 'Ingersoll Rand', 'model': '2135', 'part': 'trigger'}, ['ebay', 'amazon']))"
```

### Automated Testing
```bash
# Run all tool tests (when created)
cd backend
pytest tests/tools/

# Run specific tool test
pytest tests/tools/test_parser.py -v
```

---

## Maintenance Schedule

- **Weekly**: Review error logs in `.tmp/workflow_logs/`
- **Monthly**: Test all vendor URL templates (websites change)
- **Quarterly**: Update brand/model patterns in parser
- **Annually**: Review all dependencies for security updates

---

## Registry Change Log

### 2025-03-22: Initial version
- Documented 6 core tools (parser, scraper, MongoDB, history, favorites, tabs)
- Established registry format and maintenance guidelines
- Identified 3 future tools for Phase 2+
