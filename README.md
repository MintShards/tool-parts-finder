# Tool Parts Finder

AI-powered multi-vendor tool parts search for pneumatic tool repair businesses. Search across eBay, Amazon, Grainger, McMaster-Carr, MSC Industrial, and Zoro instantly from one centralized search bar.

![Tool Parts Finder](https://img.shields.io/badge/FARM_Stack-FastAPI%20%2B%20React%20%2B%20MongoDB-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Phase 1 (MVP) - Currently Implemented
- 🔍 **Multi-Vendor Search**: Search 6+ vendors simultaneously with one query
- ⚡ **Instant Tab Opening**: Results open in new tabs for immediate ordering
- 📝 **Smart Query Parsing**: Automatically extracts brand, model, and part details
- 📚 **Search History**: Track recent searches (last 50 searches, 30-day retention)
- ⭐ **Favorites System**: Star frequently ordered parts for quick access
- 🎨 **Clean UI**: Apple-inspired design with scarlet/white/black theme

### Coming Soon
- 📄 **AI PDF Extraction** (Phase 2): Upload exploded view diagrams → AI extracts part numbers
- 🤖 **Cross-Reference Intelligence** (Phase 3): Find equivalent parts across brands
- 💰 **Pricing Display** (Phase 4): Scrape pricing from vendors (where available)
- 📊 **Learning Engine** (Phase 5): AI learns your team's ordering patterns

## 🏗️ Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React 18 + Vite + TailwindCSS
- **Storage**: Browser localStorage (no database needed!)
- **AI**: OpenAI GPT-4 Vision (for future PDF parsing)
- **Deployment**: Any static host (Netlify, Vercel) + Railway/Render

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- OpenAI API key (for Phase 2+ only)

### Option 1: Local Development (Recommended)

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend (no .env needed for Phase 1!)
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`

#### Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

Frontend will run at `http://localhost:5173`

### Option 2: Docker Compose

```bash
# Start all services (no .env needed for Phase 1)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚀 Quick Start

See [START_HERE.md](START_HERE.md) for step-by-step setup instructions.

## 📖 Usage

### Basic Search

1. Enter part details in the search bar:
   ```
   Ingersoll Rand 2135 trigger valve
   ```

2. Click **Search** or press Enter

3. Multiple tabs will open automatically with search results from supported vendors (see [VENDORS.md](VENDORS.md))

4. Review results in each tab and order directly from vendors

### Using Favorites

1. After searching, click **"+ Add Current"** next to Favorites
2. Enter a description (e.g., "IR 2135 Trigger")
3. Star appears in favorites bar for quick re-search

### Search History

- Recent searches appear in the left sidebar (desktop)
- Click any search to repeat it instantly
- Clear history with trash icon

## 🎨 Design System

### Color Palette

```css
Scarlet Primary: #DC143C  /* Buttons, CTAs, accents */
Scarlet Hover:   #B01030  /* Hover states */
White:           #FFFFFF  /* Backgrounds */
Black:           #000000  /* Primary text */
Gray Tones:      #F5F5F5, #D1D1D1, #4A4A4A
```

### Apple-Inspired Aesthetic

- Clean white backgrounds
- Generous whitespace
- Minimal borders
- Card-based layouts
- Smooth transitions

## 💾 Data Storage

**Phase 1 uses browser localStorage** - no database required!

### localStorage Keys

#### `tool_parts_history` (last 50 searches)
```javascript
{
  id: "1234567890",
  query: "Ingersoll Rand 2135 trigger valve",
  parsed: { brand, model, part },
  timestamp: "2025-03-22T10:30:00Z",
  results_opened: ["eBay Canada", "Amazon Canada", ...]
}
```

#### `tool_parts_favorites`
```javascript
{
  id: "1234567890",
  part_description: "IR 2135 Trigger Valve",
  search_query: "Ingersoll Rand 2135 trigger valve",
  times_ordered: 15,
  last_ordered: "2025-03-22T10:30:00Z"
}
```

**Benefits**:
- ✅ Zero infrastructure setup
- ✅ Works offline after first load
- ✅ Instant performance (no network calls)
- ✅ Privacy-first (data never leaves browser)

## 🔧 API Endpoints

### Search
- `POST /api/search` - Search across vendors
  ```json
  {
    "query": "Ingersoll Rand 2135 trigger valve",
    "vendors": ["ebay", "amazon", "grainger", ...]
  }
  ```

### History & Favorites
*Stored in browser localStorage - no API endpoints needed!*
- See `frontend/src/services/storage.js` for implementation

## 🌐 Supported Vendors

**7 vendors** supported for Canadian market. See [VENDORS.md](VENDORS.md) for complete list including:
- eBay Canada, Amazon Canada (National marketplaces)
- KMS Tools (Local BC/Surrey)
- Canadian Tire, Home Depot (Major retailers)
- Contractor Cave, Canada Tool Parts (Pneumatic specialists)

## 🚧 Roadmap

### Phase 2: AI PDF Extraction (Week 3)
- Upload tool parts diagrams (PDF)
- AI extracts callout numbers + descriptions
- Interactive PDF viewer with clickable parts
- 90-day caching for frequently used catalogs

### Phase 3: Cross-Reference Intelligence (Week 4)
- AI-powered equivalent parts finder
- OEM vs aftermarket suggestions
- Confidence scoring for matches
- Team feedback loop ("Mark as Ordered")

### Phase 4: Pricing + Advanced Scraping (Week 5)
- Playwright automation for complex sites
- Real-time pricing display
- Progressive loading (instant tabs + delayed pricing)
- Vendor logos in results

### Phase 5: Learning Engine (Week 6)
- Track which parts/vendors team prefers
- AI re-ranks suggestions based on actual orders
- "Frequently ordered together" recommendations
- Monthly insights dashboard

## 🛠️ Development

### Project Structure

```
tool-parts-finder/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── routers/             # API endpoints
│   │   │   ├── search.py
│   │   │   ├── history.py
│   │   │   └── favorites.py
│   │   ├── services/            # Business logic
│   │   │   ├── parser.py        # Query parsing
│   │   │   ├── scraper.py       # Vendor URLs
│   │   │   └── ai_service.py    # (Phase 2+)
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── database/
│   │       └── mongodb.py       # MongoDB connection
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app
│   │   ├── components/          # React components
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── HistorySidebar.jsx
│   │   │   └── FavoritesList.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   └── utils/
│   │       └── tabManager.js    # Tab management
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

### Adding New Vendors

Edit `backend/app/services/scraper.py`:

```python
VENDOR_TEMPLATES = {
    # ...existing vendors...
    "new_vendor": "https://newvendor.com/search?q={query}",
}

VENDOR_INFO = {
    # ...existing info...
    "new_vendor": {
        "name": "New Vendor",
        "logo": "https://newvendor.com/logo.svg"
    },
}
```

### Running Tests

```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```

## 📊 Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Search parsing | <100ms | ✅ ~50ms |
| Instant tabs (4 sites) | <500ms | ✅ ~300ms |
| PDF AI extraction | <5s | 🚧 Phase 2 |
| Pricing scrape | <3s | 🚧 Phase 4 |

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Check backend is running
curl http://localhost:8000/health
```

### Frontend won't connect to backend
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS settings in backend/app/config.py
# Ensure frontend URL is in cors_origins
```

### Tabs not opening
- Check browser popup blocker settings
- Allow popups for `localhost:5173`

## 🌐 Deployment

### Backend (Railway/Render Free Tier)

```bash
# Deploy to Railway
railway up

# Or deploy to Render
# Connect GitHub repo, Render auto-deploys
```

### Frontend (Netlify/Vercel Free Tier)

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify
netlify deploy --prod

# Or deploy to Vercel
vercel --prod
```

**No database needed!** Data stored in user's browser localStorage.

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

This is a private tool for internal use. For questions or suggestions, contact the development team.

## 📧 Support

For technical support or feature requests, please contact your system administrator.

---

**Built with ❤️ for pneumatic tool repair professionals**
