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

