# Deploy to Vercel - Step by Step Guide

## Quick Deploy (Recommended)

### Option 1: Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"

3. **Import Repository**
   - Select your GitHub repository
   - Vercel will auto-detect Vite

4. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

5. **Set Environment Variables**
   - Click "Environment Variables"
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: Your backend URL (e.g., `https://your-backend.onrender.com`)
     - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live! 🎉

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts:
     - Link to existing project? No
     - Project name: (press enter for default)
     - Directory: `./` (press enter)
     - Override settings? No

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   ```
   - Enter your backend URL when prompted
   - Select environments: production, preview, development

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Backend Deployment

⚠️ **The backend Express server (`/server`) should be deployed separately!**

Vercel is for the frontend. Deploy the backend to:
- **Render.com** (recommended)
- **Railway**
- **Fly.io**

Then set `VITE_API_URL` to your backend URL.

### Environment Variables

**Required:**
- `VITE_API_URL` - Your backend API URL

**Example:**
```
VITE_API_URL=https://homefinder-api.onrender.com
```

### Routing

The `vercel.json` file is configured to handle React Router's client-side routing. All routes will redirect to `index.html` for proper SPA behavior.

### Build Output

- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test locally**: `npm run build`
3. **Check for TypeScript errors**: `npm run type-check`

### 404 Errors on Routes

- Verify `vercel.json` has the rewrite rule
- Check that React Router is configured correctly

### API Calls Fail

1. **Check `VITE_API_URL`** is set correctly
2. **Verify backend is running** and accessible
3. **Check CORS** on backend allows your Vercel domain
4. **Check browser console** for errors

### Environment Variables Not Working

1. **Redeploy** after adding environment variables
2. **Check variable name** starts with `VITE_`
3. **Verify** in Vercel dashboard → Settings → Environment Variables

## Post-Deployment

1. ✅ Test homepage loads
2. ✅ Test search functionality
3. ✅ Test login/registration
4. ✅ Test client management
5. ✅ Test dashboard
6. ✅ Check browser console for errors
7. ✅ Verify API calls work

## Custom Domain

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Monitoring

- **Deployments**: View in Vercel dashboard
- **Logs**: Available in Vercel dashboard → Deployments → View Function Logs
- **Analytics**: Enable in Vercel dashboard → Analytics

---

**Ready to deploy?** Follow Option 1 above for the easiest experience! 🚀

