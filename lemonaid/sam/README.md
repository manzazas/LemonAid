# AWS SAM Deployment Setup

## What This Does

This SAM template deploys your Express backend to AWS Lambda with HTTP API Gateway.

**Key Differences from Frontend:**
- **Frontend**: Static files → S3 + CloudFront (already deployed)
- **Backend**: Express app → Lambda + HTTP API Gateway (needs deployment)

## File Structure

```
lemonaid/
├── backend/              # Your Express app (ES modules)
│   ├── app.js           # Main Express app
│   ├── lambda.js        # Lambda handler wrapper (NEW)
│   ├── routes/          # Your API routes
│   └── package.json     # Dependencies
└── sam/                 # SAM deployment files
    ├── template.yaml    # CloudFormation template
    ├── samconfig.toml   # SAM configuration
    └── DEPLOYMENT.md    # Detailed deployment guide
```

## Quick Start

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set environment variables** (see DEPLOYMENT.md for options)

3. **Build and deploy:**
   ```bash
   cd sam
   sam build
   sam deploy
   ```

4. **Get your API URL** from the output and update your frontend

## Important Notes

### Lambda Handler (`backend/lambda.js`)
- Wraps your Express app to work with Lambda
- Converts HTTP API v2 events to Express-compatible format
- Handles CORS automatically
- Works with ES modules (your backend uses `type: "module"`)

### Template Configuration
- **Runtime**: Node.js 22.x
- **Timeout**: 30 seconds (adjust if needed)
- **Memory**: 512 MB
- **CodeUri**: Points to `../backend/` (relative to template.yaml)

### Environment Variables
You need to set:
- `RAINFOREST_API_KEY` - Your Rainforest API key
- `MONGO_URI` - MongoDB connection string (if using database)

See `DEPLOYMENT.md` for how to set these securely.

## What SAM Build Does

When you run `sam build`:
1. Reads `template.yaml`
2. Finds `CodeUri: ../backend/`
3. Installs dependencies from `backend/package.json`
4. Bundles everything into `.aws-sam/build/`
5. Prepares the Lambda deployment package

## After Deployment

1. You'll get an API endpoint like:
   ```
   https://abc123xyz.execute-api.us-west-2.amazonaws.com
   ```

2. Your routes will be available at:
   ```
   https://abc123xyz.execute-api.us-west-2.amazonaws.com/api/url-post
   ```

3. Update your frontend to use this URL instead of `/api/...`

## Troubleshooting

See `DEPLOYMENT.md` for detailed troubleshooting steps.

Common issues:
- **Timeout errors**: Increase timeout in template.yaml
- **CORS errors**: Check AllowOrigins in template.yaml
- **Environment variables**: Check CloudWatch logs

## Next Steps

1. Read `DEPLOYMENT.md` for detailed instructions
2. Set your environment variables
3. Deploy with `sam build && sam deploy`
4. Update frontend API URLs
5. Test your deployed backend!




