// Lambda handler for AWS HTTP API (API Gateway v2)
// This wraps the Express app to work with Lambda using serverless-http

import serverlessHttp from 'serverless-http';
import app from './app.js';

// Wrap Express app with serverless-http
export const handler = serverlessHttp(app, {
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
  request: (request, event, context) => {
    // Add Lambda event and context to request if needed
    request.event = event;
    request.context = context;
  }
});
