# LemonAid

LemonAid is a small full-stack app that analyzes Amazon product listings and flags potentially low-quality or suspicious products. It fetches listing data from the Rainforest API, computes a heuristic "Lemon Score," caches results in MongoDB, and shows everything in a simple React UI.

## Features

- Analyze Amazon product pages by pasting a URL
- Extract ASINs from common Amazon URL formats (`/dp/`, `/gp/product/`, query params)
- Fetch product data from the Rainforest Product API
- Compute a rule-based Lemon Score (reviews, seller, listing quality, pricing, age)
- Cache analysis results in MongoDB with a TTL index to save API calls
- Return cached results instantly when the same ASIN is requested again
- React frontend with score, label, breakdown, reasons, and optional raw JSON

## API Used

LemonAid uses the Rainforest Amazon Product API.

- Endpoint: Rainforest Product endpoint (ASIN-based lookup)
- Usage: backend calls Rainforest with the extracted ASIN, then passes the response into a custom analyzer that computes the Lemon Score and flags

You must provide your own `RAINFOREST_API_KEY` via environment variables.

## Database & Caching

LemonAid uses MongoDB for persistence and caching.

- Database: MongoDB (Atlas or local)
- Stored fields (per listing): `listingId` (ASIN), `raw` Rainforest data, `analysis` (Lemon Score, breakdown, reasons), `fetchedAt`
- Caching:
  - On each request, the backend checks MongoDB for an existing document with the same `listingId`
  - If found and not expired, it returns the cached analysis instead of calling Rainforest again
  - A TTL index on `fetchedAt` automatically expires old entries after a configured number of days (default ~7 days)

## Future Scaling

We are aware of other potential online shopping sites such as Etsy and Ebay, however we need to wait some time before getting approved to use their API. That is why we opted for Amazon

 
## Getting Started

Follow these steps to run both the backend API (Express) and the frontend (Vite + React).

### 1) Clone and install
- Clone: `git clone <repo-url> && cd lemonaid`
- Backend deps: `cd backend && npm install`
- Frontend deps: in a second shell, `cd frontend && npm install`

### 2) Configure environment
- Copy the example env: `copy backend\.env.example backend\.env` (PowerShell: `cp backend/.env.example backend/.env`)
- Edit `backend/.env` and set:
  - `RAINFOREST_API_KEY` (required to fetch Amazon product data)
  - `MONGO_URI` (optional; enables caching to MongoDB, defaults to local Mongo on 27017)
  - `PORT` (optional; defaults to 3000)

### 3) Run the apps
- Backend (port 3000): from `backend`, run `npm start`
- Frontend (Vite dev server, port 5173): from `frontend`, run `npm run dev`
- Open the app at `http://localhost:5173`

### 4) Quick API checks
- Health/test: `GET http://localhost:3000/api/test-get`
- Main analyze endpoint: `POST http://localhost:3000/api/url-post` with JSON body `{ "url": "https://www.amazon.com/dp/<ASIN>" }`

### Notes
- The frontend proxies API calls to the backend (see `frontend/package.json` `proxy`), so the dev servers can run side by side.
- If `MONGO_URI` is unset, the app still runs but skips caching results in MongoDB.


