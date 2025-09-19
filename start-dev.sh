#!/bin/bash

echo "🚀 Starting Payout Project Development Environment"
echo "=================================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing dependencies with npm..."
    PACKAGE_MANAGER="npm"
else
    echo "✅ Using pnpm for package management"
    PACKAGE_MANAGER="pnpm"
fi

# Install dependencies if node_modules don't exist
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && $PACKAGE_MANAGER install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && $PACKAGE_MANAGER install && cd ..
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "📝 Please update backend/.env with your Coinbase API keys"
fi

echo ""
echo "🎯 Configuration Summary:"
echo "- Network: Base"
echo "- Currency: USDC" 
echo "- Destination: 0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd"
echo ""
echo "🌐 Starting servers..."
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:3001"
echo "- Health:   http://localhost:3001/health"
echo ""

# Start both servers in parallel
if command -v concurrently &> /dev/null; then
    concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "blue,green" \
        "cd backend && $PACKAGE_MANAGER run dev" \
        "cd frontend && $PACKAGE_MANAGER run dev"
else
    echo "⚠️  concurrently not found. Starting servers manually..."
    echo "Run these commands in separate terminals:"
    echo "1. cd backend && $PACKAGE_MANAGER run dev"
    echo "2. cd frontend && $PACKAGE_MANAGER run dev"
fi