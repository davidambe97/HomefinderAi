# 🚀 Deploy to Vercel - Quick Guide

## Prerequisites

1. ✅ Code pushed to GitHub
2. ✅ Backend deployed (Render/Railway/Fly.io)
3. ✅ Backend URL ready

## Deploy in 3 Steps

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository

### Step 2: Configure

Vercel will auto-detect Vite. Verify these settings:

- **Framework Preset**: `Vite` ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

### Step 3: Add Environment Variable

**Before deploying**, add this environment variable:

1. Click **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com` (your backend URL)
   - **Environments**: Select all (Production, Preview, Development)
3. Click **"Save"**

### Step 4: Deploy

Click **"Deploy"** and wait ~2 minutes! 🎉

---

## Or Use CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_API_URL production

# Deploy to production
vercel --prod
```

---

## After Deployment

1. ✅ Visit your Vercel URL
2. ✅ Test the homepage
3. ✅ Test login/registration
4. ✅ Check browser console for errors
5. ✅ Verify API calls work

---

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Test locally: `npm run build`

**API calls fail?**
- Verify `VITE_API_URL` is set correctly
- Check backend is running
- Check CORS on backend allows Vercel domain

**404 on routes?**
- `vercel.json` is configured correctly ✅
- Should work automatically

---

## Next: Deploy Backend

The backend (`/server`) needs to be deployed separately:

- **Render.com**: [See DEPLOYMENT.md](./DEPLOYMENT.md)
- **Railway**: [See DEPLOYMENT.md](./DEPLOYMENT.md)
- **Fly.io**: [See DEPLOYMENT.md](./DEPLOYMENT.md)

Then update `VITE_API_URL` in Vercel with your backend URL.

---

**Ready?** Go to [vercel.com](https://vercel.com) and deploy! 🚀

