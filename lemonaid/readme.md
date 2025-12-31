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
