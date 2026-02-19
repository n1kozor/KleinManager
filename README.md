# KleinManager

Order management system for Kleinanzeigen purchases. Track orders, monitor prices, follow packages, and analyze spending - all in one place.

<img width="2540" height="1290" alt="Screenshot 2025-09-04 170731" src="https://github.com/user-attachments/assets/7dde9388-3d46-4b14-9c08-108ac20fc129" />

## Features

- **Order Management** - Add orders by URL, auto-extract product details, track status (Ordered/Shipped/Delivered), color-code, add notes
- **Order Detail Panel** - Slide-in side panel to edit all order fields in one place: status, tracking, color, notes
- **Package Tracking** - DHL & Hermes tracking with real-time status updates and delivery notifications
- **Price Watcher** - Monitor price changes on listings with history charts and drop alerts
- **My Listings** - Sync and monitor your own Kleinanzeigen listings (visitors, favorites)
- **Statistics** - Spending analytics, category breakdowns, seller analysis, monthly trends
- **Notifications** - Real-time alerts for price changes, tracking updates, deliveries
- **Bilingual UI** - Full English/German support, saved to localStorage
- **Background Monitoring** - Auto-check prices and tracking at configurable intervals
- **3 View Modes** - Grid, list, and table views for orders

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, asyncio background tasks
**Frontend:** Vanilla JS (class-based modules), Tailwind CSS (CDN), Chart.js
**Tracking:** DHL API, Hermes API with auto-carrier detection

## Installation

### Docker (recommended)

```bash
docker compose up -d
```

The app will be available at `http://localhost:8000`. Data is persisted in a Docker volume.

To rebuild after updates:

```bash
docker compose up -d --build
```

### Manual

```bash
# Clone
git clone https://github.com/n1kozor/KleinManager.git
cd KleinManager

# Virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install & run
pip install -r requirements.txt
python main.py
```

Opens automatically at `http://localhost:8000`.
API docs: `http://localhost:8000/docs`

### Build Executable

```bash
pip install pyinstaller
pyinstaller main.spec
cp -r static/ dist/KleinManager/static/
./dist/KleinManager/KleinManager.exe
```

## Project Structure

```
KleinManager/
├── app/
│   ├── core/
│   │   ├── config.py            # Settings (env-aware)
│   │   └── database.py          # SQLAlchemy setup
│   ├── api/
│   │   ├── routes.py            # All API endpoints
│   │   └── tracking_service.py  # DHL/Hermes tracking
│   ├── models/
│   │   ├── order.py             # DB models (Order, WatchedItem, MyListing, AppSettings)
│   │   └── schemas.py           # Pydantic schemas
│   └── services/
│       ├── scraper.py           # Kleinanzeigen data extraction
│       ├── tracking_service.py  # Unified tracking service
│       ├── watcher.py           # Price monitoring
│       ├── notification_service.py
│       ├── background_tasks.py  # Auto-monitoring scheduler
│       ├── dhl_tracker.py       # DHL-specific logic
│       └── listings_scraper.py  # My listings sync
├── static/
│   ├── css/style.css            # Custom styles + panel CSS
│   └── js/
│       ├── core.js              # Base class, API, i18n (~220 keys EN/DE)
│       ├── app.js               # Main app, manager delegation
│       ├── dashboard.js         # Dashboard charts & stats
│       ├── orders.js            # Orders + detail panel
│       ├── watcher.js           # Price watcher
│       ├── tracking.js          # Tracking page
│       ├── statistics.js        # Analytics & charts
│       ├── settings.js          # Settings management
│       ├── listings.js          # My listings
│       └── notifications.js     # Notification system
├── templates/index.html         # SPA template
├── main.py                      # Entry point (uvicorn)
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## API Endpoints

| Group | Endpoints |
|---|---|
| Orders | `GET/POST /api/v1/orders`, `GET/PUT/DELETE /api/v1/orders/{id}`, `POST /api/v1/orders/{id}/tracking` |
| Tracking | `GET /api/v1/orders/tracking`, `POST /api/v1/tracking/update-all` |
| Watcher | `GET/POST /api/v1/watched-items`, `PUT/DELETE /api/v1/watched-items/{id}`, `POST /api/v1/watched-items/check-all` |
| Listings | `GET /api/v1/my-listings`, `POST /api/v1/my-listings/sync` |
| Stats | `GET /api/v1/stats`, `GET /api/v1/stats/detail`, `GET /api/v1/stats/trends`, `GET /api/v1/stats/price-analysis` |
| Settings | `GET/PUT /api/v1/settings` |
| Notifications | `GET /api/v1/notifications`, `POST /api/v1/notifications/{id}/read`, `DELETE /api/v1/notifications` |
| Tasks | `POST /api/v1/background-tasks/start`, `POST /api/v1/background-tasks/stop`, `GET /api/v1/background-tasks/status` |

## Configuration

Environment variables (for Docker or `.env`):

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///kleinmanager.db` | Database connection string |
| `IMAGE_STORAGE_PATH` | `images` | Directory for downloaded images |

## License

MIT - see [LICENSE](LICENSE)
