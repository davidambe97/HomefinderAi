#!/bin/bash

# Local Testing Script for HomeFinder AI SaaS
# Tests both backend and frontend locally

echo "🧪 Testing HomeFinder AI SaaS Locally"
echo "======================================"

# Check if backend is running
echo ""
echo "1. Checking backend server..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
    echo "   Start it with: cd server && npm run start:dev"
    exit 1
fi

# Test backend endpoints
echo ""
echo "2. Testing backend endpoints..."

# Health check
echo "   Testing /health..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
fi

# Test registration
echo "   Testing /api/users/register..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test'$(date +%s)'@example.com","password":"Test123!"}')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo "   ✅ Registration works"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token received: ${TOKEN:0:20}..."
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
fi

echo ""
echo "3. Testing frontend..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not running"
    echo "   Start it with: npm run dev"
fi

echo ""
echo "======================================"
echo "✅ Local testing complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8080 in your browser"
echo "2. Test the search functionality"
echo "3. Test login/registration"
echo "4. Test client management"

