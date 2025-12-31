@echo off
echo ====================================
echo Deploying LemonAid Backend to AWS
echo ====================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b %errorlevel%
)
cd ..

echo.
echo Step 2: Building SAM application...
cd sam
call sam build
if %errorlevel% neq 0 (
    echo ERROR: sam build failed
    exit /b %errorlevel%
)

echo.
echo Step 3: Deploying to AWS...
call sam deploy
if %errorlevel% neq 0 (
    echo ERROR: sam deploy failed
    exit /b %errorlevel%
)

echo.
echo ====================================
echo Deployment Complete!
echo ====================================
echo.
echo Check the outputs above for your API URL
