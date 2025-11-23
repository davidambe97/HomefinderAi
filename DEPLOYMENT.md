# Deployment Guide - HomeFinder AI SaaS

Complete guide for deploying the HomeFinder AI SaaS application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [Testing Deployment](#testing-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- Accounts for hosting platforms:
  - **Frontend**: Vercel (recommended) or Netlify
  - **Backend**: Render, Railway, or Fly.io

---

## Backend Deployment

### Step 1: Prepare Backend

The backend is located in `/server` directory and uses Express.js.

#### Install Dependencies

```bash
cd server
npm install
```

#### Required Dependencies

The backend needs these packages (already in `server/package.json`):
- `express` - Web server
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens

### Step 2: Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Optional: Email Configuration
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

### Step 3: Build Backend

```bash
cd server
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 4: Test Locally

```bash
cd server
npm start
```

Server should start on `http://localhost:3001`

### Step 5: Deploy to Hosting Platform

#### Option A: Render.com

1. Connect your GitHub repository
2. Create a new "Web Service"
3. Configure:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
   - **Root Directory**: (leave empty, or set to project root)
4. Add environment variables in Render dashboard
5. Deploy

#### Option B: Railway

1. Connect GitHub repository
2. Create new project
3. Add service → Deploy from GitHub
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

#### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Initialize: `fly launch` (in server directory)
4. Set environment variables: `fly secrets set JWT_SECRET=...`
5. Deploy: `fly deploy`

### Step 6: Verify Backend

After deployment, test the health endpoint:

```bash
curl https://your-backend-domain.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

---

## Frontend Deployment

### Step 1: Update API URL

Create a `.env` file in the project root (or set in Vercel dashboard):

```env
VITE_API_URL=https://your-backend-domain.com
```

### Step 2: Build Frontend

```bash
npm run build
```

This creates a `dist/` directory with production-ready files.

### Step 3: Test Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` and verify it works.

### Step 4: Deploy to Vercel

#### Option A: Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-domain.com`
5. Deploy

### Step 5: Verify Frontend

After deployment, visit your Vercel URL and test:
- Homepage loads
- Search form works
- Can navigate to login
- API calls work (check browser console)

---

## Environment Variables

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3001` |
| `NODE_ENV` | No | Environment | `production` |
| `FRONTEND_URL` | Yes | Frontend domain for CORS | `https://app.vercel.app` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `your-secret-key` |
| `EMAIL_USER` | No | Email for notifications | `user@gmail.com` |
| `EMAIL_PASS` | No | Email password | `app-password` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://api.example.com` |

---

## Testing Deployment

### 1. Test Backend Endpoints

```bash
# Health check
curl https://your-backend.com/health

# Register user
curl -X POST https://your-backend.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST https://your-backend.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 2. Test Frontend

1. Visit your frontend URL
2. Test homepage search
3. Test login/registration
4. Test client management
5. Test dashboard
6. Check browser console for errors

### 3. Test Authentication Flow

1. Register a new agent account
2. Login and verify JWT token is stored
3. Access protected routes (dashboard, clients)
4. Verify API calls include Authorization header

---

## Troubleshooting

### Backend Issues

**Server won't start:**
- Check Node.js version: `node --version` (needs 18+)
- Verify all dependencies installed: `cd server && npm install`
- Check environment variables are set
- Check port is not already in use

**CORS errors:**
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Check CORS middleware is configured correctly

**Database errors:**
- Ensure `/server/db` directory exists and is writable
- Check file permissions

### Frontend Issues

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Verify backend is running and accessible

**Build fails:**
- Check for TypeScript errors: `npm run type-check`
- Verify all dependencies installed: `npm install`
- Check for missing environment variables

**404 errors:**
- Ensure Vite router is configured correctly
- Check `vite.config.ts` settings
- Verify build output includes all files

---

## Deployment Checklist

### Pre-Deployment

- [ ] Backend builds successfully (`cd server && npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All environment variables documented
- [ ] JWT_SECRET is strong and secure
- [ ] CORS configured correctly
- [ ] Database directory exists and is writable

### Backend Deployment

- [ ] Backend deployed to hosting platform
- [ ] Environment variables set in hosting dashboard
- [ ] Health endpoint accessible: `/health`
- [ ] All API endpoints respond correctly
- [ ] CORS allows frontend domain
- [ ] Logs are visible in hosting platform

### Frontend Deployment

- [ ] Frontend deployed to Vercel/Netlify
- [ ] `VITE_API_URL` environment variable set
- [ ] Frontend loads correctly
- [ ] API calls work (check browser console)
- [ ] Authentication flow works
- [ ] All pages load without errors

### Post-Deployment Testing

- [ ] Register new user account
- [ ] Login with credentials
- [ ] Create a client
- [ ] View dashboard with listings
- [ ] Check alerts functionality
- [ ] Verify scrapers are working
- [ ] Test error handling

### Security

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS restricted to frontend domain only
- [ ] Environment variables not exposed in code
- [ ] API routes protected with authMiddleware

---

## Monitoring & Logging

### Backend Logs

The Express server logs:
- All incoming requests with timestamp
- API errors with stack traces
- Scraper operations
- Authentication attempts

View logs in your hosting platform's dashboard.

### Frontend Logs

Frontend logs to browser console:
- API calls and responses
- Authentication state changes
- Error messages

Use browser DevTools → Console to view.

---

## Next Steps

1. ✅ Deploy backend to hosting platform
2. ✅ Deploy frontend to Vercel
3. ✅ Set environment variables
4. ✅ Test all functionality
5. ✅ Monitor logs for errors
6. ✅ Set up error tracking (optional: Sentry)
7. ✅ Configure domain names (optional)
8. ✅ Set up SSL certificates (usually automatic)

---

## Support

For issues or questions:
1. Check logs in hosting platform
2. Verify environment variables
3. Test endpoints with curl/Postman
4. Check browser console for frontend errors
5. Review deployment logs

---

**Last Updated**: MVP3 Deployment Preparation
**Status**: ✅ Ready for Deployment

