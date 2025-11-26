LemonAid
Project Overview

LemonAid analyzes Amazon product listings (via the Rainforest API), computes a heuristic "Lemon Score," caches the results in MongoDB, and displays them through a small React frontend.

Features

Fetch product data from Rainforest (product endpoint).

Compute a rule-based Lemon Score (reviews, seller, price, listing quality, age).

Cache results in MongoDB with a TTL index.

React interface (Vite + React) with client-side routing.

JSON viewer, score breakdown, and human-readable reasons.

Repository Layout
backend/                 Express server
  index.js               Main POST /api/url-post endpoint
  services/analyze.js    Lemon score logic
  models/listing.js      Mongoose schema + TTL index

frontend/                Vite + React app
  App.jsx                Main UI and API calls
  Header.jsx             Navbar
  Features.jsx           Features page
  App.css, Features.css  Styles

Prerequisites

Node.js v18+ (project used Node v22)

npm / yarn / pnpm

Rainforest API key

MongoDB instance (Atlas or local)

Environment Variables

Create backend/.env:

MONGO_URI=...
RAINFOREST_API_KEY=...
PORT=3000


If MONGO_URI is omitted, caching is disabled and the server runs without persistence.

Installation

Backend:

cd backend
npm install


Frontend:

cd frontend
npm install

Running (Development)

Backend:

cd backend
npm run dev


Frontend:

cd frontend
npm run dev


The frontend proxies API requests to http://localhost:3000.

Build (Production)

Frontend:

cd frontend
npm run build


Serve the built assets with any static host, or configure the backend to serve them.
Backend:

NODE_ENV=production node ./bin/www

How It Works

User submits an Amazon URL in the frontend.

Backend extracts the ASIN from /dp/, /gp/product/, or query parameters.

Backend checks MongoDB for a cached listing.

If cached, returns saved analysis.

If not, calls Rainforest, computes the Lemon Score, saves result, and returns full analysis + raw data.

The frontend displays:

Lemon score (0–100)

Risk label

Breakdown of sub-scores

Reasons list

Optional raw JSON

API

POST /api/url-post
Body:

{ "url": "https://www.amazon.com/dp/B012345678" }


Optional:

{ "rainforestApiKey": "...", "amazon_domain": "amazon.com" }


Response:

{
  itemId: "ASIN",
  rainforestData: {...},
  analysis: {...},
  saved: { id: "..." },
  cached: true | false
}

Analyzer Notes

Located in backend/services/analyze.js.

Sub-scores include:

reviews (count, average rating)

seller (FBA, fulfillment signals)

price (relative to similar items)

listing quality (title, images, bullet clarity)

age of listing vs review history

Final Lemon Score is clamped to 0–100 and includes a label, breakdown, and reasons.

Database

listing.js schema:

listingId

raw

analysis

fetchedAt

TTL index expires cached entries after seven days.
Upsert is performed with findOneAndUpdate(..., { upsert: true }).

Troubleshooting

If MongoDB Atlas fails to connect, whitelist your IP in Network Access.

If running without DB caching, remove MONGO_URI from your environment.

Ensure Rainforest API key is valid and the product endpoint returns expected fields.

Testing

Curl:

curl -X POST http://localhost:3000/api/url-post \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.amazon.com/dp/B012345678"}'


Mongo verification:

db.listings.find().pretty()

Contributing

Fork the repository, create a branch, and submit a pull request.
Update this README if you add new environment variables or modify the analysis pipeline.

License

MIT recommended. Add a LICENSE file if needed.
