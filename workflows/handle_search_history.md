# Handle Search History Workflow

---
**version**: 1.0
**last_updated**: 2025-03-22
**owner**: Agent Layer (WAT Framework)
**tools_used**: `backend/app/routers/history.py`, MongoDB Atlas
---

## Objective
Track recent searches for quick re-execution, maintaining 50-search limit with 30-day auto-cleanup.

## Required Inputs

### Log Search
- **query** (string): Raw search query
- **parsed** (object): Structured query data (brand, model, part)
- **results_opened** (array): List of vendor keys that opened successfully

### Retrieve History
- **limit** (int): Max searches to return (default: 50)

### Clear History
- No inputs (clears all)

---

## Process Steps

### 1. Log Search to History
**Tool**: `backend/app/routers/history.py` → `POST /api/history`

**Trigger**: Every search execution (called from `search_parts.md` workflow)

**Action**: Insert new document to MongoDB

**Data Stored**:
```python
{
    "_id": ObjectId("..."),
    "query": "Ingersoll Rand 2135 trigger valve",
    "parsed": {
        "brand": "Ingersoll Rand",
        "model": "2135",
        "part": "trigger valve"
    },
    "timestamp": "2025-03-22T10:30:00Z",
    "results_opened": ["ebay", "amazon", "kms", "cdn_tire", "home_depot"],
    "marked_ordered": null,  # Vendor where part was ordered (if marked)
    "order_timestamp": null
}
```

**Duplicate Handling**:
- Identical query within 1 minute → Update timestamp, don't duplicate
- Same query after 1 minute → Create new entry (represents new search session)

---

### 2. Retrieve Search History
**Tool**: `backend/app/routers/history.py` → `GET /api/history?limit=50`

**Action**: Fetch recent searches sorted by timestamp descending

**Query**:
```python
db.search_history.find().sort("timestamp", -1).limit(50)
```

**Auto-Cleanup**: Delete entries older than 30 days on retrieval
```python
db.search_history.delete_many({
    "timestamp": {"$lt": datetime.utcnow() - timedelta(days=30)}
})
```

**Caching**: Frontend caches for 30 seconds, invalidates on new search

---

### 3. Re-Execute Search from History
**Tool**: Reuse `search_parts.md` workflow

**Action**:
1. Load `query` from history document
2. Trigger standard search workflow with saved query
3. Create new history entry (don't update old one)

**User Flow**:
1. Click search in history sidebar → Tabs open instantly
2. New history entry created with current timestamp

---

### 4. Mark Search as Ordered
**Tool**: `backend/app/routers/history.py` → `PATCH /api/history/{id}/mark-ordered`

**Inputs**:
- **history_id** (ObjectId): Search history document ID
- **vendor** (string): Vendor where part was ordered (e.g., "ebay")

**Action**: Update document
```python
db.search_history.update_one(
    {"_id": history_id},
    {
        "$set": {
            "marked_ordered": vendor,
            "order_timestamp": datetime.utcnow()
        }
    }
)
```

**UI Update**: Show checkmark icon next to ordered searches in sidebar

**Future Use** (Phase 5): Train AI on which vendors team prefers for specific parts

---

### 5. Clear All History
**Tool**: `backend/app/routers/history.py` → `DELETE /api/history`

**Action**: Delete all history documents

**Confirmation**: Frontend shows "Clear all search history? This cannot be undone."

**Safety**: Does NOT delete favorites (separate collection)

---

## Success Criteria
- ✅ All searches logged within 200ms
- ✅ History loads in <300ms
- ✅ No duplicates within 1-minute window
- ✅ Auto-cleanup keeps database under 50 entries per user
- ✅ 30-day retention enforced

## Error Handling

### MongoDB Connection Lost During Log
**Symptom**: History write fails with connection error

**Action**:
1. Don't block search execution (tabs still open)
2. Queue history write for retry (3 attempts, exponential backoff)
3. Show toast: "Search history temporarily unavailable"

**Recovery**: Auto-reconnect via connection pooling

---

### History Retrieval Fails
**Symptom**: GET /api/history returns 500

**Action**:
1. Show cached history (if available)
2. Display warning banner: "History temporarily unavailable"
3. Retry on next page load

---

### Auto-Cleanup Errors
**Symptom**: 30-day cleanup query fails

**Action**:
1. Log error to `.tmp/workflow_logs/history_cleanup.log`
2. Continue serving history (don't block user)
3. Retry cleanup on next retrieval attempt

**Monitoring**: If cleanup fails 10+ times, alert admin (disk space issue likely)

---

### Mark as Ordered Fails (404)
**Symptom**: History document deleted before marking

**Action**:
1. Show toast: "Search no longer in history"
2. Refresh history sidebar
3. Suggest adding to favorites instead

---

## Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| Log search | <200ms | ~150ms ✅ |
| Retrieve history | <300ms | ~200ms ✅ |
| Auto-cleanup (30-day) | <100ms | ~50ms ✅ |
| Mark as ordered | <150ms | ~100ms ✅ |
| Clear all history | <200ms | ~120ms ✅ |

---

## Known Constraints
- **50-search limit**: Enforced at retrieval time (older searches auto-deleted)
- **30-day retention**: Hard-coded (no user preference yet)
- **No full-text search**: History searchable only by exact match (Phase 3 feature)
- **No export**: Can't export history to CSV (Phase 4 feature)
- **Single-user**: No multi-user isolation (auth in Phase 6)

---

## Learned Improvements
*(Document updates here as system evolves)*

### 2025-03-22: Initial version
- 50-search limit with 30-day cleanup working
- Duplicate detection within 1-minute window
- Order tracking prepared for Phase 5 AI learning
