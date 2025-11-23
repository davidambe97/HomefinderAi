# Render Build Command Fix

## ❌ Current Error
```
bash: line 1: cd: server: No such file or directory
```

## ✅ Solution: Use `--prefix` instead of `cd`

Render might be running from a different directory context. Use npm's `--prefix` flag instead of `cd`.

### Update Render Build Command

Go to Render Dashboard → Your Service → Settings → Build & Deploy

**Change Build Command from:**
```bash
cd server && npm install && npm run build
```

**To:**
```bash
npm install --prefix server && npm run build --prefix server
```

**Change Start Command from:**
```bash
cd server && npm start
```

**To:**
```bash
npm start --prefix server
```

**Root Directory:** Leave empty (or set to `.`)

## Alternative: Set Root Directory

If the above doesn't work, try:

**Root Directory:** Set to `.` (repo root)

**Build Command:**
```bash
cd server && npm install && npm run build
```

**Start Command:**
```bash
cd server && npm start
```

## Why This Happens

Render clones the repo and might run build commands from a different working directory. Using `--prefix` tells npm to run commands in a specific directory without changing the current directory.

