LemonAid

LemonAid analyzes Amazon product listings using the Rainforest API, computes a heuristic "Lemon Score," caches results in MongoDB, and displays the results in a simple React frontend.

Features

Fetch product data from the Rainforest product endpoint

Compute a rule-based Lemon Score (reviews, seller, price, listing quality, age)

Cache results in MongoDB with a TTL index

Return cached analysis if the ASIN already exists

React UI (Vite + React) with optional raw JSON view and score breakdown

API Used

Rainforest API (Amazon Product API).
Primary endpoint: product data lookup for an ASIN.
Backend extracts ASIN from URLs containing /dp/, /gp/product/, or query parameters.

Database

MongoDB (Atlas or local).
Stores: listingId, raw Rainforest response, computed analysis, fetchedAt timestamp.
Caching: TTL index expires entries after 7 days.
Upsert logic ensures listings are inserted or updated on each analysis.

Backend

Node.js and Express.
Main route: POST /api/url-post
Body example: {"url": "https://www.amazon.com/dp/B012345678"}

Response includes itemId, analysis, raw Rainforest data, cached flag, and saved record ID.

Running the Project

Backend:
cd backend
npm install
npm run dev

Frontend:
cd frontend
npm install
npm run dev

Environment Variables

Create backend/.env:

MONGO_URI=...
RAINFOREST_API_KEY=...
PORT=3000

If MONGO_URI is omitted, caching is disabled but the backend still runs.

Build (Production)

Frontend:
npm run build

Backend:
NODE_ENV=production node ./bin/www
