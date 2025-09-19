@echo off
echo 🚀 Starting Payout Project Development Environment
echo ==================================================

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  pnpm not found. Using npm...
    set PACKAGE_MANAGER=npm
) else (
    echo ✅ Using pnpm for package management
    set PACKAGE_MANAGER=pnpm
)

REM Install dependencies if node_modules don't exist
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend && %PACKAGE_MANAGER% install && cd ..
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend && %PACKAGE_MANAGER% install && cd ..
)

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Copying from .env.example...
    copy "backend\.env.example" "backend\.env"
    echo 📝 Please update backend\.env with your Coinbase API keys
)

echo.
echo 🎯 Configuration Summary:
echo - Network: Base
echo - Currency: USDC
echo - Destination: 0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd
echo.
echo 🌐 Server URLs:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001
echo - Health:   http://localhost:3001/health
echo.
echo 🚀 Starting development servers...
echo.
echo Run these commands in separate terminals:
echo 1. cd backend ^&^& %PACKAGE_MANAGER% run dev
echo 2. cd frontend ^&^& %PACKAGE_MANAGER% run dev
echo.
pause