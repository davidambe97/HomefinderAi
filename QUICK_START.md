# Quick Start Guide - HomeFinder AI SaaS

Get the application running locally in minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
# From project root
npm install
```

## Step 2: Set Up Environment Variables

### Backend (`/server/.env`)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=dev-secret-key-change-in-production
```

### Frontend (`.env.local` in root)
```env
VITE_API_URL=http://localhost:3001
```

## Step 3: Start Servers

### Terminal 1 - Backend
```bash
cd server
npm run start:dev
```

You should see:
```
🚀 HomeFinder AI SaaS Backend Server
📍 Environment: development
🌐 Server running on port 3001
```

### Terminal 2 - Frontend
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

## Step 4: Test the Application

1. **Open browser**: http://localhost:8080
2. **Test search**: Enter a location and click "Search"
3. **Register account**: Go to `/login` and create an account
4. **Add client**: Go to `/clients` and add a client
5. **View dashboard**: Go to `/dashboard` to see listings

## Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (needs 18+)
- Verify dependencies: `cd server && npm install`
- Check port 3001 is available

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Search doesn't work
- Check backend logs for scraper errors
- Verify location is provided
- Check browser console for API errors

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- See [TESTING.md](./TESTING.md) for testing guide
- See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment checklist

