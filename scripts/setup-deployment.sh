#!/bin/bash

# Setup script for deployment preparation
# This script helps prepare the project for deployment

echo "🚀 HomeFinder AI SaaS - Deployment Setup"
echo "=========================================="

# Check Node.js version
echo ""
echo "1. Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo "✅ Node.js version is 18+"
else
    echo "❌ Node.js 18+ required. Current: $(node --version)"
    exit 1
fi

# Install backend dependencies
echo ""
echo "2. Installing backend dependencies..."
cd server
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "❌ server/package.json not found"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "3. Installing frontend dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check for environment files
echo ""
echo "4. Checking environment files..."

if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found"
    echo "   Creating from server/env.example..."
    if [ -f "server/env.example" ]; then
        cp server/env.example server/.env
        echo "   ✅ Created server/.env (please update with your values)"
    else
        echo "   ⚠️  server/env.example not found"
    fi
else
    echo "✅ server/.env exists"
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo "   Creating .env.local..."
    echo "VITE_API_URL=http://localhost:3001" > .env.local
    echo "   ✅ Created .env.local"
else
    echo "✅ .env.local exists"
fi

# Verify TypeScript compilation
echo ""
echo "5. Verifying TypeScript compilation..."

echo "   Backend..."
cd server
if npm run build 2>&1 | grep -q "error"; then
    echo "   ❌ Backend TypeScript errors found"
    npm run build
    exit 1
else
    echo "   ✅ Backend compiles successfully"
fi
cd ..

echo "   Frontend..."
if npm run type-check 2>&1 | grep -q "error"; then
    echo "   ❌ Frontend TypeScript errors found"
    npm run type-check
    exit 1
else
    echo "   ✅ Frontend type checks pass"
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your configuration"
echo "2. Update .env.local with your backend URL"
echo "3. Start backend: cd server && npm run start:dev"
echo "4. Start frontend: npm run dev"
echo "5. Test the application"
echo ""
echo "For deployment, see DEPLOYMENT.md"

