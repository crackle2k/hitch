<div align="center">

# Hitch

**Real-time carpooling for York Region District School Board students.**

[![License](https://img.shields.io/github/license/Crackle2K/Hitch)](LICENSE)
[![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/flask-python-black?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Supabase](https://img.shields.io/badge/supabase-postgresql-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?logo=vercel&logoColor=white)](https://hitch-seven.vercel.app)

</div>

---

## Overview

Hitch is a web app built to help YRDSB students coordinate rides to school. York Region is a large suburban area north of Toronto where most secondary schools are poorly served by public transit. Students either drive themselves, rely on parents, or miss out. Hitch gives them a shared space to post pickup requests, find nearby riders, and message each other before committing to a carpool.

It is intentionally lightweight. There is no payment system, no routing engine, and no driver/passenger distinction. It is purely a coordination layer: put yourself on the map, post where you are going, and connect with someone heading the same way.

**Live site:** [hitch-seven.vercel.app](https://hitch-seven.vercel.app)

---

## Features

**Live Map**
- Interactive Mapbox map centred on the user's GPS location on load
- All 10 YRDSB secondary schools plotted as markers
- Clicking a school in the sidebar flies the map to that location with a popup
- Other online users appear as avatar bubbles on the map, updating every 15 seconds

**Carpool Requests**
- Post a pickup request with a destination school and an optional message (e.g. "leaving at 8:15am")
- Your pickup pin appears on the map at your current GPS location
- See all open requests from other students in the sidebar
- Cancel your own request at any time
- Badge on the tab shows how many open requests exist

**Friends and Messaging**
- Search for other users by name
- Send and accept friend requests
- Open a direct message thread with any friend
- Unread message counts shown on friend cards, refreshed every 10 seconds

**Auth**
- Email and password registration and login
- JWT tokens stored in localStorage, validated on every page load
- Expired sessions log out automatically

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, Vite 8 | Static site, deployed to Vercel CDN |
| Styling | Tailwind CSS v4, Radix UI | Radix handles accessibility primitives |
| Map | Mapbox GL, react-map-gl | Lazy-loaded to isolate init failures |
| Backend | Python, Flask | Runs as Vercel serverless functions |
| Database | Supabase (PostgreSQL) | Stores users, friendships, messages, carpool requests |
| Auth | PyJWT, bcrypt | JWT issued on login, verified on each API request |

---

## Project Structure

```
/
├── src/
│   ├── App.jsx               # Main app: auth gate, layout, sidebar tabs
│   ├── main.jsx              # React root with top-level error boundary
│   ├── components/
│   │   ├── MapComponent.jsx  # Mapbox map with markers and popups
│   │   ├── ChatPanel.jsx     # Direct message thread panel
│   │   └── ui/               # Radix-based component primitives
│   └── lib/
│       ├── supabase.js       # Supabase client (unused at runtime, kept for future use)
│       └── utils.js          # cn() class name helper
├── api/
│   ├── app.py                # Flask API: auth, locations, carpools, friends, messages
│   └── requirements.txt
├── vercel.json               # Build config and /api/* rewrite rules
└── vite.config.js            # Vite config with Tailwind plugin and path aliases
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- Python 3.10 or later

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Set up the Python environment

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r api/requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SECRET_KEY=a_random_string_used_to_sign_jwts
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` come from your Supabase project settings under API.
- `SECRET_KEY` can be any long random string. Used server-side only.
- `VITE_MAPBOX_TOKEN` is your Mapbox public access token. The map will not load without it.

### 4. Run the development servers

Start the Flask API (port 5000):

```bash
npm run api
```

In a separate terminal, start the Vite frontend (port 5173):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests to `/api/*` are proxied to Flask automatically.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 5173 |
| `npm run build` | Production build, output to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the source |
| `npm run api` | Start the Flask API on port 5000 |

---

## Deployment

The app is deployed on Vercel. The frontend is built as a static site and served from Vercel's CDN. The Flask API runs as a Python serverless function via the `api/app.py` entry point. Routing is handled by `vercel.json`, which rewrites all `/api/*` requests to the serverless function.

To deploy your own copy, import the repository into Vercel and add the four environment variables listed above in the Vercel project settings. No additional configuration is needed.

---

## License

MIT. See [LICENSE](LICENSE) for details.
