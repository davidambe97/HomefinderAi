# Deployment Checklist - HomeFinder AI SaaS

Use this checklist to ensure a successful deployment.

## Pre-Deployment

### Backend Preparation

- [ ] **Install backend dependencies**
  ```bash
  cd server && npm install
  ```

- [ ] **Verify TypeScript compiles**
  ```bash
  cd server && npm run build
  ```

- [ ] **Test backend locally**
  ```bash
  cd server && npm start
  ```
  - [ ] Health endpoint works: `http://localhost:3001/health`
  - [ ] All API routes accessible
  - [ ] Console logs appear correctly

- [ ] **Create `.env` file in `/server`**
  - [ ] `PORT=3001`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` set to frontend domain
  - [ ] `JWT_SECRET` set (strong, 32+ characters)

- [ ] **Verify database directory exists**
  - [ ] `/server/db` directory exists
  - [ ] Directory is writable

### Frontend Preparation

- [ ] **Install frontend dependencies**
  ```bash
  npm install
  ```

- [ ] **Verify frontend builds**
  ```bash
  npm run build
  ```

- [ ] **Test build locally**
  ```bash
  npm run preview
  ```
  - [ ] Frontend loads correctly
  - [ ] No console errors
  - [ ] All pages accessible

- [ ] **Create `.env` file in root**
  - [ ] `VITE_API_URL` set to backend URL

- [ ] **Verify TypeScript types**
  ```bash
  npm run type-check
  ```

---

## Backend Deployment

### Platform Setup

- [ ] **Choose hosting platform** (Render/Railway/Fly.io)
- [ ] **Connect GitHub repository**
- [ ] **Configure build settings:**
  - [ ] Build command: `cd server && npm install && npm run build`
  - [ ] Start command: `cd server && npm start`
  - [ ] Node version: 18+

### Environment Variables

- [ ] **Set `PORT`** (usually auto-set by platform)
- [ ] **Set `NODE_ENV=production`**
- [ ] **Set `FRONTEND_URL`** to your frontend domain
- [ ] **Set `JWT_SECRET`** (strong, unique value)
- [ ] **Optional: Set email variables** if using email alerts

### Verification

- [ ] **Backend deploys successfully**
- [ ] **Health check works:**
  ```bash
  curl https://your-backend.com/health
  ```
- [ ] **Test registration endpoint:**
  ```bash
  curl -X POST https://your-backend.com/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'
  ```
- [ ] **Check backend logs** for errors
- [ ] **Verify CORS** allows frontend domain

---

## Frontend Deployment

### Vercel Setup

- [ ] **Connect GitHub repository to Vercel**
- [ ] **Configure build settings:**
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`

### Environment Variables

- [ ] **Set `VITE_API_URL`** to backend URL
  - Example: `https://your-backend.onrender.com`

### Verification

- [ ] **Frontend deploys successfully**
- [ ] **Frontend URL accessible**
- [ ] **Homepage loads correctly**
- [ ] **No console errors** (check browser DevTools)
- [ ] **API calls work** (check Network tab)

---

## Integration Testing

### Authentication Flow

- [ ] **Register new agent**
  - [ ] Navigate to `/login`
  - [ ] Fill registration form
  - [ ] Submit and verify success
  - [ ] Redirected to dashboard

- [ ] **Login with credentials**
  - [ ] Enter email and password
  - [ ] Submit and verify success
  - [ ] JWT token stored in localStorage
  - [ ] Redirected to dashboard

- [ ] **Protected routes**
  - [ ] Access `/dashboard` without login → redirects to `/login`
  - [ ] Access `/clients` without login → redirects to `/login`
  - [ ] Access `/alerts` without login → redirects to `/login`

### Client Management

- [ ] **Add client**
  - [ ] Navigate to `/clients`
  - [ ] Click "Add Client"
  - [ ] Fill form with search criteria
  - [ ] Submit and verify client appears in table

- [ ] **List clients**
  - [ ] View all clients in table
  - [ ] Verify only your clients shown (agent isolation)

- [ ] **Update client**
  - [ ] Click edit icon
  - [ ] Modify fields
  - [ ] Submit and verify changes saved

- [ ] **Delete client**
  - [ ] Click delete icon
  - [ ] Confirm deletion
  - [ ] Verify client removed

### Dashboard

- [ ] **Fetch dashboard**
  - [ ] Navigate to `/dashboard`
  - [ ] Loading state appears
  - [ ] Dashboard loads with client data
  - [ ] Summary cards show correct counts

- [ ] **View listings**
  - [ ] Client tabs appear
  - [ ] Listings display in grid
  - [ ] Listings from multiple sources visible
  - [ ] Click listing opens detail page (if implemented)

- [ ] **Refresh functionality**
  - [ ] Click refresh button
  - [ ] Data reloads
  - [ ] Loading state appears during refresh

### Search Functionality

- [ ] **Homepage search**
  - [ ] Enter location in search box
  - [ ] Click "Search"
  - [ ] Redirected to `/results`
  - [ ] Properties displayed

- [ ] **Search results**
  - [ ] Properties load correctly
  - [ ] Listings from scrapers appear
  - [ ] Error handling works if search fails

### Alerts

- [ ] **Generate alerts**
  - [ ] Navigate to `/dashboard` (establish baseline)
  - [ ] Wait a few seconds
  - [ ] Navigate to `/alerts`
  - [ ] Alerts page loads
  - [ ] New listings detected (if any)

- [ ] **Alert structure**
  - [ ] Alerts grouped by client
  - [ ] Timestamp displayed
  - [ ] New listings count shown
  - [ ] Listings displayed correctly

### Settings

- [ ] **Settings page**
  - [ ] Navigate to `/settings`
  - [ ] Account info displayed
  - [ ] Preferences can be changed
  - [ ] Logout works correctly

---

## Security Verification

- [ ] **JWT tokens**
  - [ ] Tokens expire after 24 hours
  - [ ] Invalid tokens rejected (401)
  - [ ] Tokens not exposed in logs

- [ ] **CORS**
  - [ ] Only frontend domain allowed
  - [ ] Other domains blocked

- [ ] **Protected routes**
  - [ ] All client routes require auth
  - [ ] Dashboard requires auth
  - [ ] Alerts require auth

- [ ] **Agent isolation**
  - [ ] Agents can only see their own clients
  - [ ] Cannot access other agents' data

---

## Performance

- [ ] **Backend response times**
  - [ ] Health check: < 100ms
  - [ ] API endpoints: < 2s
  - [ ] Dashboard: < 5s (with scrapers)

- [ ] **Frontend load times**
  - [ ] Initial load: < 3s
  - [ ] Page navigation: < 1s
  - [ ] API calls: < 2s

- [ ] **Scraper performance**
  - [ ] All scrapers run in parallel
  - [ ] Timeout handling works
  - [ ] Retry logic functions

---

## Error Handling

- [ ] **Backend errors**
  - [ ] Invalid requests return 400
  - [ ] Unauthorized requests return 401
  - [ ] Server errors return 500
  - [ ] Error messages are user-friendly

- [ ] **Frontend errors**
  - [ ] Network errors displayed
  - [ ] Loading states shown
  - [ ] Error messages user-friendly
  - [ ] Retry options available

- [ ] **Scraper errors**
  - [ ] Failed scrapers don't break dashboard
  - [ ] Error messages logged
  - [ ] Partial results still displayed

---

## Data Persistence

- [ ] **User data**
  - [ ] Users saved to `/server/db/users.json`
  - [ ] Passwords hashed correctly
  - [ ] User data persists after restart

- [ ] **Client data**
  - [ ] Clients saved to `/server/db/clients.json`
  - [ ] Client data persists after restart
  - [ ] Agent association maintained

- [ ] **Listing history**
  - [ ] History stored in memory (for alerts)
  - [ ] History persists during session
  - [ ] Alerts work correctly

---

## Monitoring

- [ ] **Backend logs**
  - [ ] Logs visible in hosting platform
  - [ ] Request logs appear
  - [ ] Error logs appear
  - [ ] Scraper logs appear

- [ ] **Frontend logs**
  - [ ] Console logs in browser
  - [ ] API call logs visible
  - [ ] Error logs visible

- [ ] **Uptime monitoring**
  - [ ] Health check endpoint monitored
  - [ ] Alerts set up for downtime (optional)

---

## Final Verification

- [ ] **End-to-end test**
  1. Register new account
  2. Login
  3. Add client
  4. View dashboard
  5. Check alerts
  6. Update settings
  7. Logout

- [ ] **Cross-browser testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Mobile testing**
  - [ ] Responsive design works
  - [ ] Touch interactions work
  - [ ] Forms work on mobile

- [ ] **Documentation**
  - [ ] README updated
  - [ ] Deployment guide complete
  - [ ] Environment variables documented

---

## Post-Deployment

- [ ] **Monitor for 24 hours**
  - [ ] Check error rates
  - [ ] Monitor response times
  - [ ] Verify scrapers working
  - [ ] Check user registrations

- [ ] **Set up backups** (optional)
  - [ ] Database backups
  - [ ] User data backups

- [ ] **Set up monitoring** (optional)
  - [ ] Error tracking (Sentry)
  - [ ] Analytics (Google Analytics)
  - [ ] Uptime monitoring

---

## Success Criteria

✅ All checklist items completed  
✅ Backend accessible and responding  
✅ Frontend loads and functions correctly  
✅ Authentication works end-to-end  
✅ All features tested and working  
✅ No critical errors in logs  
✅ Performance acceptable  
✅ Security measures in place  

---

**Status**: Ready for Production Launch 🚀

