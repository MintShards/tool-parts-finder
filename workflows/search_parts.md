# Search Parts Workflow

---
**version**: 1.0
**last_updated**: 2025-03-22
**owner**: Agent Layer (WAT Framework)
**tools_used**: `backend/app/services/parser.py`, `backend/app/services/scraper.py`
---

## Objective
Execute multi-vendor search for tool parts based on user query, opening vendor tabs with optimized search URLs.

## Required Inputs
- **query** (string): User's raw search query (e.g., "Ingersoll Rand 2135 trigger valve")
- **vendors** (array): List of vendor keys to search (default: all 7 vendors)

## Process Steps

### 1. Parse User Query
**Tool**: `backend/app/services/parser.py` → `parse_search_query()`

**Action**: Extract structured data from raw query
- Brand detection (Ingersoll Rand, DeWalt, Makita, etc.)
- Model number extraction (2135, DCF899, etc.)
- Part description (trigger valve, anvil, switch, etc.)

**Output**:
```python
{
    "brand": "Ingersoll Rand",
    "model": "2135",
    "part": "trigger valve",
    "raw_query": "Ingersoll Rand 2135 trigger valve"
}
```

**Edge Cases**:
- No brand detected → Use full raw query for all vendors
- Model number ambiguous → Include in search string
- Part description only → Search by part name + common brands

---

### 2. Generate Vendor URLs
**Tool**: `backend/app/services/scraper.py` → `generate_search_urls()`

**Action**: Build optimized search URLs for each vendor using templates

**Logic**:
```python
for vendor in selected_vendors:
    search_term = optimize_for_vendor(parsed_query, vendor)
    url = VENDOR_TEMPLATES[vendor].format(query=search_term)
```

**Vendor-Specific Optimization**:
- **eBay Canada**: Use full query with brand + model + part
- **Amazon Canada**: Prioritize exact model numbers for better results
- **KMS Tools**: Include brand name for category filtering
- **Canadian Tire**: Use part description + brand
- **Home Depot**: Generic part names work better than specific models
- **Contractor Cave**: Pneumatic-specific terms (CFM, PSI) improve results
- **Canada Tool Parts**: OEM part numbers when available

**Output**:
```python
{
    "ebay": "https://ebay.ca/sch/i.html?_nkw=Ingersoll+Rand+2135+trigger+valve",
    "amazon": "https://amazon.ca/s?k=Ingersoll+Rand+2135+trigger+valve",
    # ... 5 more vendors
}
```

---

### 3. Open Vendor Tabs
**Tool**: Frontend `tabManager.js` → `openVendorTabs()`

**Action**: Open new browser tabs for each vendor URL

**Timing**:
- Tabs 1-4: Immediate (parallel)
- Tabs 5-7: Staggered 300ms delay (prevent browser blocking)

**Browser Compatibility**:
- Modern browsers: Direct `window.open()` with user gesture
- Pop-up blockers active: Show instruction modal with manual links

**Fallback**: If tab opening fails, display clickable vendor cards with manual "Open" buttons

---

### 4. Log Search to History
**Tool**: `backend/app/routers/history.py` → `POST /api/history`

**Action**: Save search to MongoDB for history sidebar

**Data Stored**:
```python
{
    "query": "Ingersoll Rand 2135 trigger valve",
    "parsed": {
        "brand": "Ingersoll Rand",
        "model": "2135",
        "part": "trigger valve"
    },
    "timestamp": "2025-03-22T10:30:00Z",
    "results_opened": ["ebay", "amazon", "kms", "cdn_tire", "home_depot", "contractor_cave", "cdn_tool_parts"],
    "marked_ordered": null  # Updated later if user marks as ordered
}
```

**Retention**: Last 50 searches, 30-day auto-cleanup

---

## Success Criteria
- ✅ All selected vendor tabs open successfully
- ✅ Search logged to history within 200ms
- ✅ Query parsing accuracy >85% for brand/model extraction
- ✅ User can immediately order from vendors without re-searching

## Error Handling

### Parser Failures
**Symptom**: `parsed.brand === null` and generic query

**Action**: Fall back to raw query for all vendors. No blocking error.

**Log**: Warning to `.tmp/workflow_logs/search_parts.log`

---

### Vendor URL Generation Fails
**Symptom**: Missing vendor in URL list

**Action**: Skip failed vendor, continue with others

**User Message**: "Some vendors unavailable (check later)"

---

### Tab Opening Blocked
**Symptom**: Browser blocks pop-ups

**Action**:
1. Detect block via `window.open()` return value check
2. Show modal: "Enable pop-ups for this site or click vendors below"
3. Display manual vendor links as fallback

**Prevention**: Use user-triggered `onClick` events (not programmatic opens)

---

### MongoDB Connection Lost
**Symptom**: History logging fails with connection error

**Action**:
1. Continue with tab opening (don't block user)
2. Queue history write for retry (3 attempts with exponential backoff)
3. Show toast: "Search history temporarily unavailable"

**Recovery**: Auto-reconnect via `backend/app/database/mongodb.py` connection pooling

---

## Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| Query parsing | <100ms | ~50ms ✅ |
| URL generation | <50ms | ~20ms ✅ |
| Tab opening (4 vendors) | <500ms | ~300ms ✅ |
| History logging | <200ms | ~150ms ✅ |
| Total workflow | <1s | ~600ms ✅ |

---

## Known Constraints
- **Browser pop-up limits**: Most browsers allow 4-6 tabs max in rapid succession
- **eBay rate limits**: 100 requests/min (not currently hit by search-only)
- **Amazon detection**: Blocks headless browsers (not applicable for user tabs)
- **Mobile limitations**: Tab management unreliable on iOS Safari (use manual links)

---

## Learned Improvements
*(Document updates here as system evolves)*

### 2025-03-22: Initial version
- Baseline workflow established
- Vendor templates working for all 7 Canadian vendors
- Tab opening optimized with staggered delays
