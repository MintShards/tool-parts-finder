# Error Recovery Workflow

---
**version**: 1.0
**last_updated**: 2025-03-22
**owner**: Agent Layer (WAT Framework)
**tools_used**: All backend services, MongoDB, external vendor APIs
---

## Objective
Gracefully handle failures across all workflows, recover automatically where possible, and log learnings for system improvement.

---

## Error Categories

### 1. MongoDB Connection Failures

**Symptoms**:
- `pymongo.errors.ServerSelectionTimeoutError`
- API returns 500 on database operations
- Connection pool exhausted

**Detection**:
```python
try:
    await db.collection.operation()
except ServerSelectionTimeoutError as e:
    trigger_recovery("mongodb_connection_lost")
```

**Recovery Actions**:
1. **Immediate**: Use connection pooling auto-reconnect (60s timeout)
2. **Fallback**: Enable read-only mode with cached data
3. **User Notice**: Banner "Database temporarily unavailable - using cached data"
4. **Retry**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
5. **Escalation**: After 5 failures, log to `.tmp/workflow_logs/mongodb_failures.log`

**Prevention**:
- Maintain connection pool size: 10-50 connections
- Enable health checks every 30s
- Set `maxIdleTimeMS: 60000` to prevent stale connections

**Self-Improvement**:
- If failures recur at specific times → Log pattern to `workflows/LEARNINGS.md`
- If MongoDB Atlas hits free tier limits → Document upgrade trigger

---

### 2. Browser Pop-Up Blocking

**Symptoms**:
- `window.open()` returns `null`
- Tabs don't open despite user clicking search
- Browser console shows "Pop-up blocked"

**Detection**:
```javascript
const newWindow = window.open(url);
if (!newWindow || newWindow.closed) {
    trigger_recovery("popup_blocked");
}
```

**Recovery Actions**:
1. **Immediate**: Show instruction modal "Enable pop-ups or click vendors below"
2. **Fallback**: Display manual vendor links as clickable cards
3. **User Education**: "Add site to pop-up allowlist for automatic tabs"
4. **Track**: Log browser type to identify patterns

**Prevention**:
- Use user-triggered `onClick` events (not programmatic opens)
- Stagger tab opening: 4 immediate + 3 delayed (300ms)
- Test on Chrome, Firefox, Safari, Edge monthly

**Self-Improvement**:
- If Safari blocks more often → Document Safari-specific workaround
- If mobile browsers fail → Add mobile-optimized flow

---

### 3. Query Parsing Failures

**Symptoms**:
- `parsed.brand === null` for obvious brand names
- Model number not extracted when clearly present
- Generic fallback used unnecessarily

**Detection**:
```python
parsed = parse_search_query(query)
if parsed["brand"] is None and "ingersoll" in query.lower():
    trigger_recovery("parser_accuracy_issue")
```

**Recovery Actions**:
1. **Immediate**: Fall back to raw query for vendor search (don't block user)
2. **Log**: Save failed parse to `.tmp/failed_parses.json`
3. **Learn**: Analyze failed parses weekly, update parser patterns
4. **User**: No visible error (silent fallback to full query)

**Prevention**:
- Maintain brand/model pattern list in `backend/app/services/parser.py`
- Add new brands when encountered 3+ times in failed parses
- Test against sample dataset monthly

**Self-Improvement**:
- If "Milwaukee" fails parsing → Add to brand list
- If "M18" misidentified → Update model regex patterns
- Document improvements in `workflows/LEARNINGS.md`

---

### 4. Vendor URL Generation Errors

**Symptoms**:
- Missing vendor in URL response
- Malformed URL (missing query parameter)
- Vendor template outdated (vendor changed URL structure)

**Detection**:
```python
urls = generate_search_urls(parsed_query, vendors)
if len(urls) < len(vendors):
    trigger_recovery("missing_vendor_urls")
```

**Recovery Actions**:
1. **Immediate**: Skip failed vendors, continue with working ones
2. **User Notice**: Toast "Some vendors unavailable (Amazon, eBay still working)"
3. **Log**: Save failed vendor to `.tmp/vendor_failures.log`
4. **Test**: Background job tests all vendor URLs weekly
5. **Update**: Check vendor websites for URL structure changes

**Prevention**:
- Maintain vendor templates in `VENDOR_TEMPLATES` dict
- Monitor vendor site changes quarterly
- Test all URLs in CI/CD pipeline

**Self-Improvement**:
- If eBay URL changes → Update template immediately
- If vendor discontinues search API → Remove from supported list
- Document URL changes in `workflows/LEARNINGS.md`

---

### 5. Rate Limiting (Future - Phase 4)

**Symptoms** (when pricing scraping enabled):
- 429 Too Many Requests from vendor
- IP temporarily blocked
- Slow response times (>5s)

**Detection**:
```python
if response.status_code == 429:
    trigger_recovery("rate_limit_hit")
```

**Recovery Actions**:
1. **Immediate**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
2. **Cache**: Serve cached pricing if available (<1 hour old)
3. **User Notice**: "Pricing temporarily unavailable - tabs still opened"
4. **Throttle**: Reduce request rate automatically
5. **Rotate**: Use proxy rotation if configured

**Prevention**:
- Respect vendor rate limits (document per-vendor in `VENDORS.md`)
- Implement request queuing with max 10/second
- Cache pricing data for 30 minutes

**Self-Improvement**:
- If eBay rate limit is 100/min → Document and enforce
- If Amazon blocks headless → Switch to API (if available)
- Log all rate limit encounters to improve throttling

---

### 6. Frontend-Backend Connection Lost

**Symptoms**:
- API requests timeout (>10s)
- CORS errors
- Network failures

**Detection**:
```javascript
try {
    const response = await axios.get('/api/search');
} catch (error) {
    if (error.code === 'ECONNABORTED') {
        trigger_recovery("backend_unreachable");
    }
}
```

**Recovery Actions**:
1. **Immediate**: Retry request (3 attempts, 2s delay)
2. **Fallback**: Use locally cached data if available
3. **User Notice**: "Connection lost - retrying..."
4. **Offline Mode**: Allow manual vendor link opening without API
5. **Health Check**: Ping `/health` endpoint every 30s

**Prevention**:
- Set axios timeout to 10s
- Enable axios retry interceptor (3 attempts)
- Monitor backend uptime with health checks

**Self-Improvement**:
- If backend crashes frequently → Investigate logs
- If deployment causes downtime → Add blue-green deployment
- Document connection issues in `workflows/LEARNINGS.md`

---

### 7. Environment Configuration Errors

**Symptoms**:
- `MONGODB_URI` not set
- `OPENAI_API_KEY` missing (Phase 2+)
- Invalid environment variables

**Detection**:
```python
from app.config import get_settings

settings = get_settings()
if not settings.mongodb_uri:
    trigger_recovery("missing_env_config")
```

**Recovery Actions**:
1. **Immediate**: Raise clear error message "MONGODB_URI not configured"
2. **Documentation**: Point to `README.md` setup instructions
3. **Validation**: Check all required env vars on startup
4. **Fail Fast**: Don't start server with invalid config

**Prevention**:
- Maintain `.env.example` with all required variables
- Validate env vars in `backend/app/config.py`
- Document setup steps in `START_HERE.md`

**Self-Improvement**:
- If setup fails frequently → Improve documentation
- If new env var needed → Update `.env.example` immediately
- Add env validation tests

---

## Recovery Logging

All errors log to `.tmp/workflow_logs/` with structure:
```json
{
    "timestamp": "2025-03-22T10:30:00Z",
    "workflow": "search_parts.md",
    "error_type": "mongodb_connection_lost",
    "severity": "high",
    "recovery_action": "exponential_backoff_retry",
    "outcome": "recovered_after_3_attempts",
    "lesson": "Connection pool exhausted during peak usage - increase pool size"
}
```

**Weekly Review**: Analyze logs to identify patterns and update workflows

---

## Self-Improvement Triggers

After recovery, check if update needed:

1. **Error recurs 3+ times** → Update workflow with specific handling
2. **New error pattern** → Create new recovery section
3. **Vendor changes** → Update templates and document in `LEARNINGS.md`
4. **Performance degradation** → Investigate and optimize
5. **User-reported issue** → Reproduce, fix, test, document

**Action**: Update relevant workflow markdown with:
- What broke
- How it was fixed
- How to prevent in future
- New monitoring/validation added

---

## Performance Targets
| Error Type | Recovery Time | Acceptable? |
|------------|---------------|-------------|
| MongoDB reconnect | <5s | ✅ Target |
| Pop-up fallback | <1s | ✅ Target |
| Parser fallback | <100ms | ✅ Target |
| Vendor skip | <50ms | ✅ Target |
| API retry | <6s | ✅ Target |

---

## Escalation Path

**Severity Levels**:
1. **Low**: Single search fails, no user impact
2. **Medium**: Feature degraded but core search works
3. **High**: Core search broken, immediate fix needed
4. **Critical**: Database corruption, data loss risk

**Escalation**:
- **Low/Medium**: Log and handle gracefully
- **High**: Alert admin, enable degraded mode
- **Critical**: Stop service, prevent data corruption

---

## Learned Improvements
*(Document updates here as system evolves)*

### 2025-03-22: Initial version
- Baseline error recovery strategies established
- MongoDB auto-reconnect with exponential backoff
- Pop-up blocker detection and fallback implemented
- Logging infrastructure ready for pattern analysis
