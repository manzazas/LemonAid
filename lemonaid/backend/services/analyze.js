// Analyzer for Rainforest `product` responses.
// Implements a deterministic, rule-based "lemon score" using
// the product fields returned by the Rainforest Product API.

function safeNumber(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function reviewScore(p) {
  if (!p || typeof p !== 'object') {
    console.warn('reviewScore: Invalid product object');
    return 0;
  }
  
  const rating = safeNumber(p.rating);
  const ratings_total = safeNumber(p.ratings_total) || safeNumber(p.reviews_total) || 0;
  
  // Debug logging
  if (ratings_total === 0 && rating === null) {
    console.warn('reviewScore: No rating or ratings_total found. Product keys:', Object.keys(p));
  }
  
  let score = 0;
  if (ratings_total < 20) score += 20; // not much data
  if (rating !== null && rating < 3.5) score += 40; // consistently bad
  if (rating !== null && rating >= 4.8 && ratings_total < 30) score += 25; // suspiciously perfect
  return Math.max(0, Math.min(60, Math.round(score)));
}                         

function sellerScore(p) {
  let score = 0;
  const f = p.buybox_winner && p.buybox_winner.fulfillment;
  if (!f) return 20; // we know nothing → slightly risky

  if (!f.is_fulfilled_by_amazon) score += 20; // not FBA
  if (f.is_sold_by_third_party && !f.is_sold_by_amazon) score += 10;
  return Math.max(0, Math.min(30, score));
}

function priceScore(p) {
  const basePrice = safeNumber(p.buybox_winner && p.buybox_winner.price && p.buybox_winner.price.value);
  const also = Array.isArray(p.also_viewed) ? p.also_viewed : (Array.isArray(p.frequently_bought_together && p.frequently_bought_together.products) ? p.frequently_bought_together.products : []);
  if (!basePrice || !also || also.length === 0) return 0;

  const prices = also
    .map(a => safeNumber(a.price && a.price.value))
    .filter(v => typeof v === 'number');

  if (!prices || prices.length === 0) return 0;
  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;

  let score = 0;
  if (basePrice < 0.6 * avg) score += 30; // too good to be true
  if (basePrice > 2.0 * avg) score += 20; // over-priced
  return Math.max(0, Math.min(50, Math.round(score)));
}

function listingScore(p) {
  let score = 0;
  const title = (p.title || '').toLowerCase();
  const bullets = (Array.isArray(p.feature_bullets) ? p.feature_bullets.join(' ') : (p.feature_bullets || '')).toLowerCase();
  const text = (title + ' ' + bullets).toLowerCase();

  if (!Array.isArray(p.images) || p.images.length < 3) score += 10; // weak visuals
  if (/[🔥💥⭐]/.test(text)) score += 5; // spammy emojis
  if (/100% satisfaction|best quality|guaranteed|money back/.test(text)) score += 5;
  if (/free gift|freebie|click here/.test(text)) score += 5;
  return Math.max(0, Math.min(25, score));
}

function ageScore(p) {
  const first = p.first_available && (p.first_available.utc || p.first_available.raw);
  if (!first) return 0;
  const firstDate = new Date(first);
  if (!firstDate || Number.isNaN(firstDate.getTime())) return 0;
  const ageDays = (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  let score = 0;
  const ratings_total = safeNumber(p.ratings_total) || safeNumber(p.reviews_total) || 0;
  if (ageDays < 30 && ratings_total > 200) score += 30; // new listing, many reviews → suspicious
  return Math.max(0, Math.min(30, Math.round(score)));
}

function computeLemonScore(product) {
  const breakdown = {
    reviews: reviewScore(product),
    seller: sellerScore(product),
    price: priceScore(product),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    listing: listingScore(product),
    age: ageScore(product),
  };

  const raw = Object.values(breakdown).reduce((s, v) => s + (v || 0), 0);
  const lemonScore = Math.min(100, Math.round(raw));

  let label;
  if (lemonScore < 20) label = 'Low risk';
  else if (lemonScore < 50) label = 'Medium risk';
  else label = 'High risk';

  // generate short reasons for UI
  const reasons = [];
  if (breakdown.reviews >= 40) reasons.push('Poor or suspicious review stats');
  if (breakdown.seller >= 20) reasons.push('Not fulfilled by Amazon or third-party seller');
  if (breakdown.price >= 20) reasons.push('Price is unusual vs similar items');
  if (breakdown.listing >= 10) reasons.push('Weak listing quality (few images or spammy text)');
  if (breakdown.age >= 20) reasons.push('New listing with many reviews (possible manipulation)');

  return { lemonScore, label, breakdown, reasons };
}

export default function analyze(raw) {
  // raw is expected to be the full Rainforest response (object)
  // Handle nested structure: raw.product or raw.rainforestData?.product or raw itself
  let product = null;
  if (raw) {
    product = raw.product || raw.product_data || (raw.rainforestData && raw.rainforestData.product) || raw;
  }
  
  if (!product || typeof product !== 'object') {
    console.warn('Analyze: No product data found in:', Object.keys(raw || {}));
    return {
      score: null,
      lemonScore: null,
      label: 'Unknown',
      breakdown: {},
      reasons: [],
      note: 'No product data'
    };
  }

  const lemon = computeLemonScore(product);

  return {
    listings: [],
    count: 1,
    score: lemon.lemonScore,
    lemon: lemon,
    note: 'analysis complete',
    productSummary: {
      title: product.title || null,
      asin: product.asin || null,
      rating: safeNumber(product.rating) || null,
      ratings_total: safeNumber(product.ratings_total) || safeNumber(product.reviews_total) || null,
      price: product.buybox_winner && product.buybox_winner.price ? product.buybox_winner.price : null
    }
  };
}
