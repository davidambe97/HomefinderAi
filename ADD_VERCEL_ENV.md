# Add VITE_API_URL to Vercel

## Your Vercel Frontend URL:
**https://homefinder-ai-frontend-main-9mvx9fo1d.vercel.app**

## Step 1: Get Your Render Backend URL

1. Go to your Render Dashboard
2. Find your backend service
3. Copy the service URL (e.g., `https://homefinder-ai-backend.onrender.com`)

## Step 2: Add Environment Variable

### Option A: Via Vercel CLI (Recommended)

```bash
cd /Users/ambe/Downloads/homefinder-ai-frontend-main
vercel env add VITE_API_URL production
```

When prompted:
- **Value:** Paste your Render backend URL (e.g., `https://homefinder-ai-backend.onrender.com`)
- Press Enter

Then add for preview and development:
```bash
vercel env add VITE_API_URL preview
vercel env add VITE_API_URL development
```

### Option B: Via Vercel Dashboard

1. Go to: https://vercel.com/davidambe15-gmailcoms-projects/homefinder-ai-frontend-main/settings/environment-variables
2. Click **"Add New"**
3. **Key:** `VITE_API_URL`
4. **Value:** Your Render backend URL
5. **Environment:** Select all (Production, Preview, Development)
6. Click **"Save"**

## Step 3: Redeploy

After adding the environment variable, redeploy:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Step 4: Update Backend CORS

Update your Render backend `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://homefinder-ai-frontend-main-9mvx9fo1d.vercel.app
```

Then redeploy your Render backend.

## ✅ Verification

After redeploying, test:
1. Visit: https://homefinder-ai-frontend-main-9mvx9fo1d.vercel.app
2. Open browser console (F12)
3. Check for API calls - they should go to your Render backend
4. Try searching for properties

