# Manage Favorites Workflow

---
**version**: 1.0
**last_updated**: 2025-03-22
**owner**: Agent Layer (WAT Framework)
**tools_used**: `backend/app/routers/favorites.py`, MongoDB Atlas
---

## Objective
Allow users to save frequently ordered parts for instant re-search, tracking order counts and preferred vendors.

## Required Inputs

### Add Favorite
- **part_description** (string): User-friendly name (e.g., "IR 2135 Trigger Valve")
- **search_query** (string): Original search query that found the part

### Increment Orders
- **favorite_id** (ObjectId): MongoDB document ID

### Delete Favorite
- **favorite_id** (ObjectId): MongoDB document ID

---

## Process Steps

### 1. Add New Favorite
**Tool**: `backend/app/routers/favorites.py` → `POST /api/favorites`

**Action**: Create new favorite document in MongoDB

**Validation**:
- `part_description` required, 1-100 characters
- `search_query` required, 1-500 characters
- Duplicate check: Warn if exact `search_query` already exists

**Data Stored**:
```python
{
    "_id": ObjectId("..."),
    "part_description": "IR 2135 Trigger Valve",
    "search_query": "Ingersoll Rand 2135 trigger valve",
    "times_ordered": 0,
    "last_ordered": null,
    "preferred_vendor": null,
    "created_at": "2025-03-22T10:30:00Z"
}
```

**Frontend Update**: Add star to favorites bar immediately (optimistic UI)

**Error Handling**:
- MongoDB connection lost → Show error toast, don't update UI
- Duplicate entry → Ask "Already exists. Add anyway?"

---

### 2. Load All Favorites
**Tool**: `backend/app/routers/favorites.py` → `GET /api/favorites`

**Action**: Retrieve all favorites sorted by `times_ordered` descending

**Sorting Logic**:
```python
db.favorites.find().sort("times_ordered", -1).limit(20)
```

**Display Order**:
1. Most frequently ordered parts first
2. Never ordered parts last (alphabetical)

**Caching**: Frontend caches for 5 minutes, invalidates on add/delete

---

### 3. Increment Order Count
**Tool**: `backend/app/routers/favorites.py` → `POST /api/favorites/{id}/increment-orders`

**Trigger**: User manually clicks "Mark as Ordered" after searching favorite

**Action**: Update MongoDB document
```python
db.favorites.update_one(
    {"_id": favorite_id},
    {
        "$inc": {"times_ordered": 1},
        "$set": {"last_ordered": datetime.utcnow()}
    }
)
```

**Future Enhancement** (Phase 5): Auto-detect which vendor tab user stayed on longest to set `preferred_vendor`

---

### 4. Delete Favorite
**Tool**: `backend/app/routers/favorites.py` → `DELETE /api/favorites/{id}`

**Action**: Remove from MongoDB

**Confirmation**: Frontend shows "Are you sure?" modal before deletion

**Cleanup**: No cascade needed (favorites are standalone documents)

---

### 5. Quick Re-Search from Favorite
**Tool**: Reuse `search_parts.md` workflow

**Action**:
1. Load `search_query` from favorite document
2. Trigger standard search workflow
3. Increment `times_ordered` (if user manually marks as ordered)

**User Flow**:
1. Click favorite star → Tabs open instantly
2. User orders part from vendor
3. User clicks "Mark as Ordered" → Counter increments

---

## Success Criteria
- ✅ Favorites persist across sessions
- ✅ Most ordered parts appear first
- ✅ Re-searching favorite takes <500ms
- ✅ Duplicate detection prevents clutter

## Error Handling

### MongoDB Connection Lost
**Symptom**: API returns 500 on favorites requests

**Action**:
1. Show cached favorites (read-only mode)
2. Display warning banner: "Favorites temporarily read-only"
3. Queue add/delete operations for retry when connection returns

**Recovery**: Auto-reconnect via connection pooling

---

### Favorite Not Found (404)
**Symptom**: User clicks deleted favorite (stale UI)

**Action**:
1. Remove from frontend immediately
2. Show toast: "Favorite no longer exists"
3. Refresh favorites list

---

### Duplicate Add Attempt
**Symptom**: User tries to add same `search_query` twice

**Action**:
1. Backend checks for existing `search_query`
2. Return 409 Conflict with existing favorite ID
3. Frontend asks: "Already exists as '[description]'. Add anyway?"
4. If yes, allow duplicate with different description

---

## Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| Load favorites | <300ms | ~200ms ✅ |
| Add favorite | <200ms | ~150ms ✅ |
| Delete favorite | <200ms | ~100ms ✅ |
| Increment order count | <150ms | ~100ms ✅ |
| Re-search from favorite | <500ms | ~400ms ✅ |

---

## Known Constraints
- **Favorites limit**: No hard limit currently (consider 100-item cap in Phase 3)
- **No folders/categories**: All favorites in flat list (Phase 4 feature)
- **No sharing**: Favorites are per-user (multi-user auth in Phase 6)
- **No analytics**: Order tracking is manual (auto-detection in Phase 5)

---

## Learned Improvements
*(Document updates here as system evolves)*

### 2025-03-22: Initial version
- Basic CRUD operations working
- Sort by order count for prioritization
- Manual order tracking (auto-detection planned for Phase 5)
