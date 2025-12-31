# AWS SAM Deployment Guide for LemonAid Backend

## Prerequisites

1. **AWS SAM CLI installed** (`sam --version`) - You already have this! ✅
   - This is what you use for `sam build` and `sam deploy`
2. **Node.js 22.x** (matches Lambda runtime)
3. **AWS credentials configured** (SAM CLI uses these automatically)
4. **AWS CLI** (optional - only needed for Option A in Step 2)
   - **Windows**: Download from [AWS CLI Installer](https://awscli.amazonaws.com/AWSCLIV2.msi) or use `winget install Amazon.AWSCLI`
   - Verify installation: `aws --version`
   - **Note:** You can skip this if you use Option B (direct in template.yaml)

## Setup Steps

### 1. Install Dependencies

From the `backend` directory:
```bash
cd backend
npm install
```

### 2. Set Environment Variables

You need to set environment variables for your Lambda function. You have two options:

#### Option B: Direct in template.yaml (Easiest - No AWS CLI Required) ⭐

**This is the simplest way and doesn't require installing AWS CLI!**

Edit `sam/template.yaml` and add your environment variables directly in the `Environment.Variables` section:

```yaml
Environment:
  Variables:
    NODE_ENV: production
    RAINFOREST_API_KEY: "your-actual-api-key-here"  # Replace with your real key
    # MONGO_URI: "your-mongo-uri-here"  # Optional - only if using MongoDB
```

**Note:** This stores the API key in the template file. For production, consider Option A for better security.

#### Option A: AWS Systems Manager Parameter Store (More Secure for Production)

**Requires AWS CLI installed** (separate from SAM CLI). If you don't have it, use Option B above.

Store sensitive values in Parameter Store:

**Linux/Mac (bash):**
```bash
# Store your Rainforest API key
aws ssm put-parameter \
  --name "/lemonaid/rainforest-api-key" \
  --value "YOUR_API_KEY" \
  --type "SecureString"

# Store MongoDB URI (if using)
aws ssm put-parameter \
  --name "/lemonaid/mongo-uri" \
  --value "YOUR_MONGO_URI" \
  --type "SecureString"
```

**Windows (PowerShell):**
```powershell
# Store your Rainforest API key (one line)
aws ssm put-parameter --name "/lemonaid/rainforest-api-key" --value "YOUR_API_KEY" --type "SecureString"

# Or multi-line using backtick (PowerShell line continuation)
aws ssm put-parameter `
  --name "/lemonaid/rainforest-api-key" `
  --value "YOUR_API_KEY" `
  --type "SecureString"

# Store MongoDB URI (if using)
aws ssm put-parameter --name "/lemonaid/mongo-uri" --value "YOUR_MONGO_URI" --type "SecureString"
```

Then update `template.yaml` to read from Parameter Store (add IAM permissions).

### 3. Build the SAM Application

From the `sam` directory:
```bash
cd sam
sam build
```

This will:
- Install dependencies from `backend/package.json`
- Bundle everything into `.aws-sam/build/`
- Prepare the Lambda deployment package

### 4. Deploy to AWS

```bash
sam deploy
```

Or with guided mode (first time):
```bash
sam deploy --guided
```

This will:
- Create/update the CloudFormation stack
- Deploy the Lambda function
- Create the HTTP API Gateway
- Output the API endpoint URL

### 5. Get Your API Endpoint

After deployment, you'll see output like:
```
ApiBaseUrl: https://abc123xyz.execute-api.us-west-2.amazonaws.com
```

Copy this URL - you'll need it for your frontend.

## Updating Your Frontend

After deployment, update your frontend to use the AWS API endpoint:

### Step 1: Set Environment Variables

The frontend uses `VITE_API_URL` from `.env.production`. Create this file in the frontend folder:

**File: `frontend/.env.production`**
```
VITE_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com
```

Replace `your-api-id` with the actual ID from your deployment output.

### Step 2: Build for Production
```bash
cd frontend
npm run build
```

The build will automatically use the `VITE_API_URL` from `.env.production`.

### Step 3: Deploy Frontend
You can deploy the built `frontend/dist/` folder to:
- AWS S3 + CloudFront
- AWS Amplify
- Netlify
- Vercel
- Any static hosting service

### Local Development
For local testing against AWS backend:
```bash
cd frontend
VITE_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com npm run dev
```

Or update `.env.local`:
```
VITE_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com
```

Then run `npm run dev` normally.

## Troubleshooting

### CORS Issues (Most Common)
If you get: `Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
1. The template.yaml has CORS configured at the API Gateway level
2. Make sure your frontend is using the correct API URL:
   - Create `.env.production` in frontend folder with: `VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com`
   - Or set environment variable during build: `VITE_API_URL=https://... npm run build`
3. Re-deploy with: `sam build && sam deploy`
4. Clear browser cache (CORS preflight requests can be cached)

**If still failing:**
- Check CloudWatch logs: `sam logs -n ExpressFunction --stack-name lemon-aid --tail`
- Verify the preflight OPTIONS request returns 200 status
- Ensure AllowOrigins in template.yaml includes your frontend domain

### Lambda Timeout
If your API calls are timing out, increase the timeout in `template.yaml`:
```yaml
Timeout: 60  # seconds
```

### Environment Variables Not Working
1. Check CloudWatch Logs for the Lambda function
2. Verify the variables are set in the template or Parameter Store
3. Make sure IAM permissions allow reading from Parameter Store (if using)

### View Logs
```bash
sam logs -n ExpressFunction --stack-name lemon-aid --tail
```

## Updating After Changes

1. Make your code changes
2. Run `sam build`
3. Run `sam deploy`
4. The stack will be updated with your changes

## Cleanup

To delete everything:
```bash
sam delete
```

This removes:
- Lambda function
- API Gateway
- CloudFormation stack
- All associated resources



