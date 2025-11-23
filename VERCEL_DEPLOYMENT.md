# Vercel Deployment Guide - HomeFinder AI Frontend

## ✅ Pre-Deployment Checklist

Before deploying, make sure:
- [x] Backend is deployed on Render (or have the backend URL ready)
- [x] GitHub repository is connected
- [x] `vercel.json` is configured
- [x] Build script exists in `package.json`

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:**
   - Select **GitHub**
   - Find and select: `davidambe97/HomefinderAi`
   - Click **"Import"**

### Step 2: Configure Project

Vercel will auto-detect the framework (Vite), but verify these settings:

**Framework Preset:** Vite (auto-detected)

**Root Directory:** Leave empty (project root)

**Build Command:** `npm run build` (auto-detected)

**Output Directory:** `dist` (auto-detected)

**Install Command:** `npm install` (auto-detected)

### Step 3: Environment Variables

**CRITICAL:** Add this environment variable:

```
VITE_API_URL=https://your-backend-service.onrender.com
```

**How to add:**
1. In the project configuration, scroll to **"Environment Variables"**
2. Click **"Add"**
3. **Key:** `VITE_API_URL`
4. **Value:** Your Render backend URL (e.g., `https://homefinder-ai-backend.onrender.com`)
5. **Environment:** Select all (Production, Preview, Development)
6. Click **"Save"**

**Important Notes:**
- Replace `your-backend-service.onrender.com` with your actual Render backend URL
- Make sure the URL includes `https://`
- No trailing slash at the end

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## 🔧 Post-Deployment Configuration

### Update Backend CORS

After getting your Vercel URL, update your Render backend environment variable:

1. Go to Render Dashboard
2. Find your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
5. Save and redeploy backend

## 📋 Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend-service.onrender.com
```

### Render (Backend) - Update after Vercel deployment
```
FRONTEND_URL=https://your-project-name.vercel.app
```

## ✅ Verification

After deployment, test these:

1. **Homepage loads:** `https://your-project.vercel.app`
2. **Search works:** Try searching for properties
3. **Login works:** Register/login functionality
4. **API calls:** Check browser console for API requests

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Make sure all dependencies are in `package.json`
- Try: `npm install` locally to verify

**Error: "VITE_API_URL is not defined"**
- Add `VITE_API_URL` environment variable in Vercel
- Redeploy after adding

### API Calls Fail

**Error: "CORS error"**
- Check that `FRONTEND_URL` in Render matches your Vercel URL exactly
- Make sure backend is running on Render

**Error: "Network error"**
- Verify `VITE_API_URL` is correct in Vercel
- Check that backend URL is accessible (visit it in browser)

### 404 Errors on Routes

**Problem:** React Router routes return 404
**Solution:** Already configured in `vercel.json` with rewrites - should work automatically

## 📝 Quick Deploy Checklist

- [ ] Connect GitHub repo to Vercel
- [ ] Set `VITE_API_URL` environment variable (your Render backend URL)
- [ ] Deploy
- [ ] Update Render `FRONTEND_URL` with your Vercel URL
- [ ] Test the application

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

