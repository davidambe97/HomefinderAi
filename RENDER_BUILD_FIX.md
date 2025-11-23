# Render Build Fix - Verify Build Command

## ✅ Correct Render Build Command

Make sure your Render service has this **exact** build command:

```bash
cd server && npm install && npm run build
```

## 🔍 How to Verify in Render

1. Go to Render Dashboard
2. Click on your backend service
3. Go to **Settings** tab
4. Scroll to **Build & Deploy**
5. Verify **Build Command** is:
   ```
   cd server && npm install && npm run build
   ```

## ⚠️ Common Issues

### Issue 1: Build Command Missing `cd server`
**Wrong:**
```bash
npm install && npm run build
```

**Correct:**
```bash
cd server && npm install && npm run build
```

### Issue 2: Start Command Missing `cd server`
**Wrong:**
```bash
npm start
```

**Correct:**
```bash
cd server && npm start
```

### Issue 3: Root Directory Set Incorrectly
**Root Directory:** Should be **empty** (not `/server`)

Render needs to start from the repo root, then `cd server` in the build command.

## 📋 Complete Render Configuration

**Service Type:** Web Service

**Build Command:**
```
cd server && npm install && npm run build
```

**Start Command:**
```
cd server && npm start
```

**Root Directory:** (Leave empty)

**Environment Variables:**
- `NODE_ENV=production`
- `JWT_SECRET=<your-secret>`
- `FRONTEND_URL=<your-vercel-url>`
- `SCRAPER_TIMEOUT=30000` (optional)
- `SCRAPER_RETRIES=3` (optional)

## ✅ Verification

After updating, Render should:
1. ✅ Install dependencies in `/server/node_modules`
2. ✅ Compile TypeScript to `/server/dist`
3. ✅ Start server from `/server/dist/index.js`

