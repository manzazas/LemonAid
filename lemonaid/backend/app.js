import createError from 'http-errors';
import express, { json, urlencoded, static as expressStatic } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB only if MONGO_URI is set (optional for Lambda)
if (process.env.MONGO_URI) {
  connectDB().catch(err => {
    console.error('MongoDB connection failed:', err.message);
    // Continue without DB - API will still work without caching
  });
}

import indexRouter from './routes/index.js';
import externalRouter from './routes/external.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressStatic(join(__dirname, 'public')));

app.use('/', indexRouter);
// eBay API proxy routes
// eBay routes removed — using Rainforest API via main route

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // If the request accepts JSON or targets an API route, return JSON
  if (req.accepts('json') || req.path.startsWith('/api')) {
    return res.json({
      success: false,
      message: err.message,
      error: req.app.get('env') === 'development' ? err : undefined
    });
  }

  // Try to render the view; if the view is missing, fall back to plain text
  res.render('error', (renderErr, html) => {
    if (renderErr) {
      res.type('txt').send(`${err.status || 500} - ${err.message}`);
    } else {
      res.send(html);
    }
  });
});

export default app;