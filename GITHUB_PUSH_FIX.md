# Fix GitHub Authentication Issue

There's an authentication issue. Here are solutions:

## Solution 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: "HomeFinder AI"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push -u origin main
   ```
   - When prompted for username: enter `davidambe97`
   - When prompted for password: **paste your token** (not your GitHub password)

## Solution 2: Update Remote URL with Token

```bash
# Replace YOUR_TOKEN with your personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/davidambe97/HomefinderAi.git
git push -u origin main
```

## Solution 3: Use GitHub CLI

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Push
git push -u origin main
```

## Solution 4: Clear Credentials and Re-authenticate

```bash
# Clear cached credentials
git credential-osxkeychain erase
# Then enter:
# host=github.com
# protocol=https
# (Press Enter twice)

# Try pushing again
git push -u origin main
```

## Quick Fix (Try This First)

Run this command and enter your GitHub credentials when prompted:

```bash
cd /Users/ambe/Downloads/homefinder-ai-frontend-main
git push -u origin main
```

If it asks for credentials:
- **Username**: `davidambe97`
- **Password**: Use a Personal Access Token (not your GitHub password)

---

**Need help?** The easiest solution is Solution 1 (Personal Access Token).

