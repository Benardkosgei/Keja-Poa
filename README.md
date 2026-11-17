# Keja Poa — Real Estate Platform with 3D Virtual Tours

Keja Poa (Swahili: "Good House") is a full-stack Kenyan real estate platform featuring Matterport-style 3D virtual tours, built with React, Django REST Framework, and React Native (Expo).

---

## Project Structure

```
Keja Poa/
├── src/                    # React web frontend (Vite + TypeScript + Tailwind)
├── backend/                # Django REST API
│   ├── accounts/           # Custom user model, auth (login/register/profile)
│   ├── properties/         # Properties, agents, inquiries, favorites
│   ├── tours/              # 3D tour scenes, hotspots, tags
│   └── core/               # Shared permissions
├── mobile/                 # React Native app (Expo Router)
└── .env                    # Frontend environment variables
```

---

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Web      | React 18, Vite 6, TypeScript, Tailwind CSS v3           |
| UI       | Radix UI, shadcn/ui, Lucide icons                       |
| Routing  | React Router v6                                         |
| Backend  | Django 4.2, Django REST Framework, simplejwt            |
| Database | MySQL                                                   |
| Mobile   | React Native, Expo SDK 54, Expo Router v6               |

---

## Quick Start

### 1. Backend (Django)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create MySQL database
# In MySQL: CREATE DATABASE kejapoa_db; CREATE USER 'kejapoa_user'@'localhost' IDENTIFIED BY 'kejapoa_password'; GRANT ALL ON kejapoa_db.* TO 'kejapoa_user'@'localhost';

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`  
Admin panel: `http://localhost:8000/admin/`

### 2. Web Frontend (React)

```bash
# From project root
pnpm install

# Copy env (already created, edit if needed)
# .env contains: VITE_API_URL=http://localhost:8000/api/v1

pnpm dev
```

Frontend runs at: `http://localhost:5173`

### 3. Mobile (Expo)

```bash
cd mobile
npm install

# Start Expo
npx expo start

# For Android emulator, the API URL in services/api.ts uses http://10.0.2.2:8000
# For iOS simulator, change to http://localhost:8000
# For physical device, use your machine's local IP
```

---

## API Endpoints

### Auth
| Method | Endpoint                  | Description              | Auth     |
|--------|---------------------------|--------------------------|----------|
| POST   | `/api/v1/auth/login/`     | Login → `{user, tokens}` | Public   |
| POST   | `/api/v1/auth/register/`  | Register → `{user, tokens}` | Public |
| POST   | `/api/v1/auth/refresh/`   | Refresh access token     | Public   |
| GET    | `/api/v1/auth/profile/`   | Get current user         | Required |
| PATCH  | `/api/v1/auth/profile/`   | Update current user      | Required |

### Properties
| Method | Endpoint                          | Description                    | Auth          |
|--------|-----------------------------------|--------------------------------|---------------|
| GET    | `/api/v1/properties/`             | List (filterable, paginated)   | Public        |
| POST   | `/api/v1/properties/`             | Create listing                 | Agent/Admin   |
| GET    | `/api/v1/properties/featured/`    | Featured listings              | Public        |
| GET    | `/api/v1/properties/<id>/`        | Property detail                | Public        |
| PATCH  | `/api/v1/properties/<id>/`        | Update listing                 | Owner/Admin   |
| DELETE | `/api/v1/properties/<id>/`        | Delete listing                 | Owner/Admin   |
| POST   | `/api/v1/properties/<id>/approve/`| Approve listing                | Admin         |
| POST   | `/api/v1/properties/<id>/reject/` | Reject listing                 | Admin         |
| POST   | `/api/v1/properties/<id>/images/` | Upload images                  | Agent/Admin   |

### Tours
| Method | Endpoint                              | Description           | Auth        |
|--------|---------------------------------------|-----------------------|-------------|
| GET    | `/api/v1/tours/property/<id>/`        | Get tour for property | Public      |
| POST   | `/api/v1/tours/`                      | Create tour           | Agent/Admin |
| GET    | `/api/v1/tours/<id>/`                 | Tour detail           | Agent/Admin |
| POST   | `/api/v1/tours/<id>/scenes/`          | Upload panorama scene | Agent/Admin |

### Agents, Inquiries, Favorites
| Method | Endpoint                    | Description              | Auth        |
|--------|-----------------------------|--------------------------|-------------|
| GET    | `/api/v1/agents/`           | List agents              | Public      |
| GET    | `/api/v1/agents/<id>/`      | Agent profile            | Public      |
| POST   | `/api/v1/inquiries/`        | Send inquiry             | Public      |
| GET    | `/api/v1/inquiries/received/` | Agent's received inquiries | Agent/Admin |
| GET    | `/api/v1/favorites/`        | User's saved properties  | Required    |
| POST   | `/api/v1/favorites/`        | Save a property          | Required    |
| DELETE | `/api/v1/favorites/<id>/`   | Remove saved property    | Required    |

### Query Parameters (Properties list)
- `search` — full-text search on title, address, city
- `city`, `listing_type`, `property_type`, `status`, `featured`
- `price_min`, `price_max`, `bedrooms_min`, `bathrooms_min`
- `ordering` — `price`, `-price`, `created_at`, `-created_at`
- `page`, `page_size`

---

## User Roles

| Role         | Permissions                                              |
|--------------|----------------------------------------------------------|
| `client`     | Browse, save favorites, send inquiries                   |
| `tenant`     | Same as client                                           |
| `agent`      | All client permissions + create/manage own listings + tours |
| `landlord`   | All client permissions + manage own properties + tenants |
| `admin`      | All agent permissions + approve/reject listings + manage users |
| `super_admin`| Full platform access                                     |

---

## Environment Variables

**Web frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000/api/v1
```

**Mobile** (`mobile/services/api.ts`):
```
API_BASE_URL = 'http://10.0.2.2:8000/api/v1'   # Android emulator
# or
API_BASE_URL = 'http://localhost:8000/api/v1'   # iOS simulator
# or
API_BASE_URL = 'http://192.168.x.x:8000/api/v1' # Physical device
```

**Backend** — for production, replace in `settings.py`:
```python
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']
```

---

cd "C:\wamp64\www\Keja Poa\backend"

& "C:\wamp64\bin\mysql\mysql8.3.0\bin\mysqldump.exe" `
  -h 127.0.0.1 -P 3307 -u root `
  --column-statistics=0 `
  --result-file=kejapoa_full.sql `
  kejapoa_db



  & "C:\wamp64\bin\mysql\mysql8.3.0\bin\mysql.exe" `
  -h 127.0.0.1 -P 3306 -u root `
  -e "DROP DATABASE IF EXISTS kejapoa_db; CREATE DATABASE kejapoa_db;"




  cmd /c ""C:\wamp64\bin\mysql\mysql8.3.0\bin\mysql.exe" --binary-mode=1 -h 127.0.0.1 -P 3306 -u root kejapoa_db < kejapoa_full.sql"

## Features

- **Landing page** — Hero, featured properties, How It Works, Testimonials, CTA
- **Property listings** — Grid/list view, filters (type, price, beds, city), pagination
- **Property detail** — Image gallery with lightbox, 3D tour viewer, inquiry form, agent card, similar properties
- **3D Tour Viewer** — Drag-to-look panorama, hotspot navigation, info tags, mini-map, fullscreen
- **Agent pages** — Agent listing with search, agent profile with tabs (listings/about)
- **Role-based dashboards** — Client, Agent, Landlord, Admin dashboards
- **Authentication** — JWT login/register with role selection, protected routes
- **Favorites** — Save/unsave properties (persisted to backend when authenticated)
- **Inquiries** — Contact agent form with real API submission
- **Mobile app** — Properties, Search, 3D Tours, Profile tabs with full auth flow
