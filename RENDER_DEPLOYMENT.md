# Render Deployment Checklist

## ✅ What's Ready (Will Work)

1. **Backend Structure** ✅
   - `/server` folder with all necessary files
   - `package.json` with build and start scripts
   - TypeScript configuration (`tsconfig.json`)
   - Main entry point: `server/index.ts`

2. **Build Configuration** ✅
   - `npm run build` compiles TypeScript to `dist/`
   - `npm start` runs `node dist/index.js`
   - Node.js version specified: `>=18.0.0`

3. **Server Setup** ✅
   - Express server configured
   - CORS enabled
   - Health check endpoint: `/health`
   - All API routes defined
   - Error handling middleware

4. **Environment Variables** ✅
   - `env.example` file with all required variables
   - Uses `dotenv` for configuration
   - PORT uses environment variable (Render auto-assigns)

## ⚠️ What You Need to Configure on Render

### 1. Render Service Settings

**Service Type:** Web Service

**Build Command:**
```bash
cd server && npm install && npm run build
```

**Start Command:**
```bash
cd server && npm start
```

**Root Directory:** Leave empty (Render will detect the repo root)

### 2. Environment Variables (Set in Render Dashboard)

**Required:**
- `PORT` - Render auto-assigns this, but you can set it manually
- `NODE_ENV=production`
- `JWT_SECRET` - **Generate a strong random string** (e.g., use `openssl rand -base64 32`)
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Optional:**
- `SCRAPER_TIMEOUT=30000`
- `SCRAPER_RETRIES=3`

### 3. Auto-Deploy Settings

- **Branch:** `main`
- **Auto-Deploy:** Enabled (recommended)

## 🔍 Potential Issues & Solutions

### Issue 1: Build Path
**Problem:** Render might not find the server folder
**Solution:** Use the build command above with `cd server`

### Issue 2: Module Resolution
**Status:** ✅ Already fixed - imports use `.js` extensions (required for ES modules)

### Issue 3: Database Files
**Status:** ✅ Uses JSON files in `/server/db/` - will work on Render

### Issue 4: Port Binding
**Status:** ✅ Server uses `process.env.PORT` which Render provides automatically

## 📋 Render Deployment Steps

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository:** Select `davidambe97/HomefinderAi`
4. **Configure Service:**
   - **Name:** `homefinder-ai-backend` (or your choice)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** Node
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`
5. **Add Environment Variables:**
   - `NODE_ENV=production`
   - `JWT_SECRET=<your-secret-key>`
   - `FRONTEND_URL=<your-vercel-url>`
6. **Click "Create Web Service"**
7. **Wait for deployment** (usually 2-5 minutes)

## ✅ Verification After Deployment

Once deployed, test these endpoints:

1. **Health Check:**
   ```
   GET https://your-service.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

2. **Register User:**
   ```
   POST https://your-service.onrender.com/api/users/register
   Body: {"name":"Test","email":"test@example.com","password":"test123"}
   ```

3. **Login:**
   ```
   POST https://your-service.onrender.com/api/users/login
   Body: {"email":"test@example.com","password":"test123"}
   ```

## 🚨 If Deployment Fails

### Common Errors:

1. **"Cannot find module"**
   - Check that build command includes `cd server`
   - Verify all dependencies are in `server/package.json`

2. **"Port already in use"**
   - Make sure you're using `process.env.PORT` (already done ✅)

3. **"Build failed"**
   - Check Render build logs
   - Verify TypeScript compiles locally: `cd server && npm run build`

4. **"Module not found"**
   - Verify imports use `.js` extensions (already done ✅)

## 📝 Notes

- Render provides a free tier with automatic sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds (cold start)
- Consider upgrading to paid tier for always-on service
- Database files (`users.json`, `clients.json`) persist in Render's filesystem
- For production, consider migrating to a proper database (PostgreSQL, MongoDB)

