import {Router} from 'express';
import express from 'express';
import Listing from '../models/listing.js';
var router = express.Router();

function extractAsinFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const u = new URL(url);
    const hostname = u.hostname || '';

    // Only treat as Amazon if hostname contains 'amazon.'
    if (!/amazon\./i.test(hostname)) return null;

    // Common ASIN-containing paths (order matters)
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
      /\/gp\/aw\/d\/.+\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /\/gp\/offer-listing\/([A-Z0-9]{10})/i,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
      /\/product-reviews\/([A-Z0-9]{10})/i,
    ];

    for (const re of patterns) {
      const m = u.pathname.match(re);
      if (m) return String(m[1]).toUpperCase();
    }

    // Sometimes ASIN is provided as a query param
    const qAsin = u.searchParams.get('ASIN') || u.searchParams.get('asin');
    if (qAsin && /^[A-Z0-9]{10}$/i.test(qAsin)) return String(qAsin).toUpperCase();

    // Fallback: any 10-char alphanumeric token in the URL path or entire URL
    const fallback = url.match(/([A-Z0-9]{10})(?:[/?#]|$)/i);
    if (fallback) return String(fallback[1]).toUpperCase();

    return null;
  } catch (e) {
    // fallback regex on raw string
    const fallback = url.match(/([A-Z0-9]{10})/i);
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
  const asin = extractAsinFromUrl(url);
  console.log(`Extracted ASIN: ${asin}`);

  if (!asin) {
    return res.status(400).json({ error: "Invalid or missing Amazon listing URL" });
  }

  // If we have a DB connection configured, check for cached listing first
  if (process.env.MONGO_URI) {
    try {
      const existing = await Listing.findOne({ listingId: asin }).lean();
      if (existing) {
        // Return cached copy (avoid re-running Rainforest)
        return res.json({
          itemId: asin,
          rainforestData: existing.raw,
          analysis: existing.analysis,
          saved: { id: existing._id },
          cached: true
        });
      }
    } catch (dbErr) {
      console.error('DB lookup failed, will continue to fetch:', dbErr && dbErr.message ? dbErr.message : dbErr);
      // fall through to fetch
    }
  }

  // Rainforest API call
  const apiKey = process.env.RAINFOREST_API_KEY || (req.body && req.body.rainforestApiKey);
  if (!apiKey) {
    console.error('Missing RAINFOREST_API_KEY in environment');
    return res.status(500).json({ error: 'Server not configured: missing RAINFOREST_API_KEY' });
  }

  // Determine amazon domain to pass to Rainforest (e.g., amazon.com)
  let amazonDomain = 'amazon.com';
  try {
    const u = new URL(url);
    amazonDomain = u.hostname.replace(/^www\./i, '');
  } catch (e) {
    
  }
  if (req.body && req.body.amazon_domain) amazonDomain = req.body.amazon_domain;

  const rainforestUrl = `https://api.rainforestapi.com/request?api_key=${encodeURIComponent(apiKey)}&type=product&amazon_domain=${encodeURIComponent(amazonDomain)}&asin=${encodeURIComponent(asin)}`;

  let rainforestData = null;
  try {
    const resp = await fetch(rainforestUrl, { method: 'GET' });
    const text = await resp.text();
    if (!resp.ok) {
      console.error('Rainforest API returned non-200 status:', resp.status, text);
      rainforestData = null;
    } else {
      rainforestData = JSON.parse(text);
    }
  } catch (err) {
    console.error('Failed to fetch Rainforest API:', err && err.message ? err.message : err);
    rainforestData = null;
  }

  // Analyze returned JSON for UI display
  let analysis = null;
  try {
    const analyze = (await import('../services/analyze.js')).default;
    analysis = analyze(rainforestData);
  } catch (err) {
    console.error('Analysis failed:', err && err.message ? err.message : err);
  }

  // Attempt to persist the fetched data if DB connected. Use upsert to
  // avoid duplicate documents for the same listingId and update the
  // fetchedAt timestamp on each analyze.
  let saved = null;
  if (process.env.MONGO_URI) {
    try {
      saved = await Listing.findOneAndUpdate(
        { listingId: asin },
        { $set: { raw: rainforestData, analysis, fetchedAt: new Date() } },
        { upsert: true, new: true }
      ).lean();
    } catch (err) {
      console.error('Failed to save/update listing to DB:', err && err.message ? err.message : err);
    }
  }

  // Return item ID + raw Rainforest data + analysis + saved record id
  return res.json({ itemId: asin, rainforestData, analysis, saved: saved ? { id: saved._id } : null });
 

});

export default router;
