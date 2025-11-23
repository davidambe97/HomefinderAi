# Render Environment Variables - Complete List

## ✅ REQUIRED Environment Variables

These **must** be set in Render for the backend to work:

### 1. `NODE_ENV`
```
NODE_ENV=production
```
**Purpose:** Sets the environment mode  
**Required:** Yes

### 2. `JWT_SECRET`
```
JWT_SECRET=ZnPwnxb7i4NJxpKI5c1vaWcerOX1CV+XI7N/b07YfklpQs1vyXMsyHa3clhIzBXQ2t3UYDc34Id/G0my
```
**Purpose:** Secret key for JWT token encryption/decryption  
**Required:** Yes  
**Security:** Use a strong, random string (64+ characters)

### 3. `FRONTEND_URL`
```
FRONTEND_URL=https://your-app-name.vercel.app
```
**Purpose:** Frontend URL for CORS configuration  
**Required:** Yes  
**Note:** Replace with your actual Vercel frontend URL

### 4. `PORT`
```
PORT=10000
```
**Purpose:** Server port (Render auto-assigns this)  
**Required:** No (Render provides automatically)  
**Note:** You can leave this unset - Render will assign it automatically

---

## ⚙️ OPTIONAL Environment Variables

These are optional but recommended for better scraping performance:

### 5. `SCRAPER_TIMEOUT`
```
SCRAPER_TIMEOUT=30000
```
**Purpose:** Timeout in milliseconds for scraper HTTP requests  
**Default:** 30000 (30 seconds)  
**Recommended:** 30000-60000 for production

### 6. `SCRAPER_RETRIES`
```
SCRAPER_RETRIES=3
```
**Purpose:** Number of retry attempts for failed scraper requests  
**Default:** 3  
**Recommended:** 3-5 for production

---

## 📋 Complete Render Environment Variables Setup

Copy and paste these into Render's Environment Variables section:

```bash
# Required
NODE_ENV=production
JWT_SECRET=ZnPwnxb7i4NJxpKI5c1vaWcerOX1CV+XI7N/b07YfklpQs1vyXMsyHa3clhIzBXQ2t3UYDc34Id/G0my
FRONTEND_URL=https://your-app-name.vercel.app

# Optional (but recommended)
SCRAPER_TIMEOUT=30000
SCRAPER_RETRIES=3
```

---

## 🔍 What's NOT Needed

These are **hardcoded** in the code and don't need environment variables:

- ✅ **User Agents** - Rotating user agents are hardcoded in `server/utils/http.ts`
- ✅ **Scraper URLs** - Site URLs are hardcoded in `server/config.ts`
- ✅ **HTTP Headers** - Default headers are hardcoded in `server/config.ts`

---

## 📝 Notes

1. **PORT**: Render automatically assigns a port, so you don't need to set this manually
2. **JWT_SECRET**: Use the generated secret above or create your own (64+ characters)
3. **FRONTEND_URL**: Must match your Vercel frontend URL exactly (include `https://`)
4. **Scraper Variables**: The optional scraper variables have sensible defaults, but you can tune them if you experience timeout issues

---

## 🚨 Important Security Note

**Never commit your JWT_SECRET to Git!** It's already in `.gitignore`, but make sure you:
- Use a different secret in production than in development
- Keep your Render environment variables secure
- Don't share your JWT_SECRET publicly

