// import createError from 'http-errors';
// import express, { json, urlencoded, static as expressStatic } from 'express';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// import cookieParser from 'cookie-parser';
// import logger from 'morgan';
// import { connectDB } from "./config/db.js";
// import dotenv from "dotenv";
// import cors from 'cors';

// dotenv.config();
// connectDB(); // <<< connects to Mongo

// import indexRouter from './routes/index.js';
// import externalRouter from './routes/external.js';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// app.use(cors());

// // view engine setup
// app.set('views', join(__dirname, 'views'));
// app.set('view engine', 'hbs');

// app.use(logger('dev'));
// app.use(json());
// app.use(urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(expressStatic(join(__dirname, 'public')));

// app.use('/', indexRouter);
// // eBay API proxy routes
// // eBay routes removed — using Rainforest API via main route

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   // If the request accepts JSON or targets an API route, return JSON
//   if (req.accepts('json') || req.path.startsWith('/api')) {
//     return res.json({
//       success: false,
//       message: err.message,
//       error: req.app.get('env') === 'development' ? err : undefined
//     });
//   }

//   // Try to render the view; if the view is missing, fall back to plain text
//   res.render('error', (renderErr, html) => {
//     if (renderErr) {
//       res.type('txt').send(`${err.status || 500} - ${err.message}`);
//     } else {
//       res.send(html);
//     }
//   });
// });

// export default app;

// app.js - AWS Lambda compatible Express app
import express, { json } from 'express';

const app = express();

// function calculateHealthScore({ calories, protein, fat, sugar, fiber }) {
//   let score = 50;

//   if (protein != null) {
//     score += Math.min(protein * 1.5, 15);
//   }

//   if (fiber != null) {
//     score += Math.min(fiber * 3, 15);
//   }

//   if (sugar != null) {
//     score -= Math.min(sugar * 1.0, 25);
//   }

//   if (fat != null) {
//     score -= Math.min(fat * 0.8, 20);
//   }

//   if (calories != null && calories > 250) {
//     score -= Math.min((calories - 250) / 10, 15);
//   }

//   score = Math.max(0, Math.min(100, score));
//   return Math.round(score);
// }

// function extractKeyNutrients(detailData) {
//   const nutrients = detailData.foodNutrients || [];

//   const get = (num) => {
//     const item = nutrients.find(
//       (n) => String(n.nutrient.number) === String(num)
//     );
//     return item ? item.amount : null;
//   };

//   const calories = get("208");
//   const protein = get("203");
//   const fat = get("204");
//   const carbs = get("205");
//   const sugar = get("269");
//   const fiber = get("291");

//   const healthScore = calculateHealthScore({
//     calories,
//     protein,
//     fat,
//     sugar,
//     fiber,
//   });

//   return {
//     name: detailData.description,
//     portion: 100,
//     portionUnit: "g",
//     calories,
//     protein,
//     fat,
//     carbs,
//     sugar,
//     fiber,
//     healthScore,
//   };
// }

// async function safeFetchJSON(url) {
//   const resp = await fetch(url, {
//     headers: {
//       "User-Agent": "NutriTrackApp",
//       "Accept": "application/json",
//     },
//   });

//   const text = await resp.text();

//   if (text.startsWith("<")) {
//     return { htmlError: true, text };
//   }

//   try {
//     return JSON.parse(text);
//   } catch (err) {
//     return { parseError: true, raw: text };
//   }
// }


/**
 * 1. API routes FIRST
 *    These should respond and then stop; they must come before static/catch-all.
 */
app.use(json());

// Health / smoke endpoint (when mounted under /api/external this will be /api/external/test)
app.get('/test', (req, res) => {
  res.json({ message: 'Hello from the external route!' });
});

// Example: GET /api/external/item/:id -> proxy to service.fetchItem(id)
app.get('/item/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // TODO: replace with actual service call, e.g.:
    // const data = await fetchExternalItem(id);
    const data = null; // placeholder
    res.json({ success: true, id, data });
  } catch (err) {
    res.status(502).json({ success: false, message: 'External API error', error: err.message });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API' });
});

app.get("/api/usda", async (req, res) => {
  console.log(">>> USDA ROUTE HIT <<<");

  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const searchUrl =
      `https://api.nal.usda.gov/fdc/v1/foods/search?` +
      `api_key=${process.env.USDA_KEY}` +
      `&query=${encodeURIComponent(query)}` +
      `&pageSize=10` +
      `&dataType=Foundation&dataType=SR%20Legacy`;

    console.log("Search URL:", searchUrl);

    let searchData = await safeFetchJSON(searchUrl);

    if (searchData.htmlError) {
      console.log("HTML error on first try — retrying...");
      searchData = await safeFetchJSON(searchUrl);
    }

    if (!searchData || !searchData.foods || searchData.foods.length === 0) {
      return res.json({ error: "Food not found" });
    }

    const foods = searchData.foods;

    const foundationMatch = foods.find((f) => f.dataType === "Foundation");
    const legacyMatch = foods.find((f) => f.dataType === "SR Legacy");
    const bestMatch = foundationMatch || legacyMatch || foods[0];

    console.log("BEST MATCH:", bestMatch.description);
    console.log("dataType:", bestMatch.dataType);
    console.log("FDC ID:", bestMatch.fdcId);

    const detailUrl =
      `https://api.nal.usda.gov/fdc/v1/food/${bestMatch.fdcId}?api_key=${process.env.USDA_KEY}`;

    let detailData = await safeFetchJSON(detailUrl);

    if (detailData.htmlError || detailData.parseError) {
      return res.status(503).json({
        error: "USDA temporarily unavailable. Try again.",
      });
    }

    const simplified = extractKeyNutrients(detailData);

    return res.json(simplified);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// Export the app for Lambda handler (do NOT call app.listen() in Lambda)
export default app;

