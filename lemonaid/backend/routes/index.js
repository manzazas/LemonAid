import {Router} from 'express';
import express from 'express';
import Listing from '../models/listing.js';
var router = express.Router();

function extractItemIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const u = new URL(url);
    const pathname = u.pathname || '';
    const etsyMatch = pathname.match(/\/listing\/(\d+)/);
    if (etsyMatch) return etsyMatch[1];
    return null;
  } catch (e) {
    const fallback = url.match(/\/listing\/(\d+)/);
    if (fallback) return fallback[1];
    return null;
  }
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/test-get', function(req, res, next) {
  res.json({message: 'Hello from dddthe backend!'});
});

router.post('/api/url-post', async function(req, res, next) {
  const url = req.body && req.body.url;
  const itemId = extractItemIdFromUrl(url);
  console.log(`Extracted item ID: ${itemId}`);
  if (!itemId) {
    return res.status(400).json({ error: "Invalid or missing Etsy listing URL" });
  } else {
    // bails early if no key (so we don't call Etsy)
    if (!process.env.ETSY_API_KEY) {
      console.warn('ETSY_API_KEY missing — skipping Etsy fetch');
      const analyze = (await import('../services/analyze.js')).default;
      const analysis = analyze(null);
      return res.json({ itemId, etsyData: null, analysis });
    }

    // --- construct Etsy API URL ---
    const params = new URLSearchParams({
      listing_ids: itemId,
      includes: "Images,Shop"
    });
    const etsyUrl = `https://openapi.etsy.com/v3/application/listings/batch?${params.toString()}`;

    // --- fetch Etsy API ---
    const etsyResponse = await fetch(etsyUrl, {
      method: "GET",
      headers: {
        "x-api-key": process.env.ETSY_API_KEY,
        "Accept": "application/json"
      }
    });
    
    if (!etsyResponse.ok) {
      console.error("Etsy API error status:", etsyResponse.status);
      return res.status(502).json({ error: "Etsy API error" });
    }
    const etsyData = await etsyResponse.json();

    // Analyze returned JSON for UI display
    let analysis = null;
    try {
      const analyze = (await import('../services/analyze.js')).default;
      analysis = analyze(etsyData);
    } catch (err) {
      console.error('Analysis failed:', err && err.message ? err.message : err);
    }

    // Attempt to persist the fetched data (if DB connected)
    let saved = null;
    if (process.env.MONGO_URI) {
      try {
        saved = await Listing.create({ listingId: itemId, raw: etsyData, analysis });
      } catch (err) {
        console.error('Failed to save listing to DB:', err && err.message ? err.message : err);
        // do not fail the request on DB errors
      }
    }

    // Return item ID + raw Etsy data + analysis + saved record id (if any)
    return res.json({ itemId, etsyData, analysis, saved: saved ? { id: saved._id } : null });
  } 
 

});

export default router;
