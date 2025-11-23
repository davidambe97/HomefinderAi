# Manual Testing Guide for HomeFinder AI SaaS MVP3

This guide provides step-by-step instructions for manually testing all features of the application.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser console to view debug logs

3. Have a test email ready for registration

---

## 1. Authentication & User Management

### 1.1 Register New Agent

**Steps:**
1. Navigate to `/login`
2. Fill in the registration form:
   - Name: "Test Agent"
   - Email: `test-agent-${timestamp}@example.com`
   - Password: "TestPassword123!"
3. Click "Register" or submit form

**Expected Results:**
- ✅ Success message appears
- ✅ Redirected to `/dashboard`
- ✅ JWT token stored in localStorage (check DevTools → Application → Local Storage)
- ✅ Console shows: `[API] Registration successful, token stored`
- ✅ User object stored in auth store

**Console Verification:**
```
[API] Register request: test-agent-xxx@example.com
[Users] Registration attempt for email: test-agent-xxx@example.com
[Users] User registered successfully: user_xxx test-agent-xxx@example.com
[API] Registration successful, token stored
```

### 1.2 Login with Agent Account

**Steps:**
1. Navigate to `/login`
2. Enter registered email and password
3. Click "Sign In"

**Expected Results:**
- ✅ Success message appears
- ✅ Redirected to `/dashboard`
- ✅ Token stored in localStorage
- ✅ Console shows login success

**Console Verification:**
```
[API] Login request: test-agent-xxx@example.com
[Users] Login attempt for email: test-agent-xxx@example.com
[Users] User logged in successfully: user_xxx test-agent-xxx@example.com
[API] Login successful, token stored
```

### 1.3 Verify JWT Token

**Steps:**
1. Open DevTools → Application → Local Storage
2. Check `auth_token` value
3. Decode JWT at https://jwt.io (optional)

**Expected Results:**
- ✅ Token exists in localStorage
- ✅ Token has 3 parts (header.payload.signature)
- ✅ Payload contains: id, email, name, exp (expiration)

### 1.4 Test Protected Routes (401 Error)

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `/dashboard` or `/clients`
3. Check browser console and network tab

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ Network request shows 401 status
- ✅ Console shows: `[API] Unauthorized` or similar

**Console Verification:**
```
[Users] Auth middleware: No Authorization header
[API] GET /api/dashboard - Status: 401
```

---

## 2. Client Management

### 2.1 Add New Client

**Steps:**
1. Navigate to `/clients` (must be logged in)
2. Click "Add Client" button
3. Fill in form:
   - Name: "John Smith"
   - Email: `john.smith@example.com`
   - Location: "London"
   - Property Type: "house"
   - Min Price: 200000
   - Max Price: 500000
   - Bedrooms: 3
4. Click "Add Client"

**Expected Results:**
- ✅ Success toast notification
- ✅ Client appears in table
- ✅ Form dialog closes
- ✅ Console shows client added

**Console Verification:**
```
[API] Adding client: John Smith
[Clients] Add client attempt for agent: user_xxx email: john.smith@example.com
[Clients] Client added successfully: client_xxx john.smith@example.com
[API] Client added: client_xxx
```

### 2.2 List Clients

**Steps:**
1. Navigate to `/clients`
2. View the clients table

**Expected Results:**
- ✅ All clients for logged-in agent displayed
- ✅ Table shows: Name, Email, Location, Property Type, Price Range, Bedrooms
- ✅ Actions column with Edit/Delete buttons

**Console Verification:**
```
[API] Fetching clients
[Clients] List clients for agent: user_xxx
[Clients] Found X clients for agent: user_xxx
[API] Clients fetched: X
```

### 2.3 Update Client

**Steps:**
1. Navigate to `/clients`
2. Click Edit icon (pencil) on a client row
3. Modify fields (e.g., change location to "Manchester")
4. Click "Update Client"

**Expected Results:**
- ✅ Success toast notification
- ✅ Client data updated in table
- ✅ Console shows update success

**Console Verification:**
```
[API] Updating client: client_xxx
[Clients] Update client attempt: client_xxx for agent: user_xxx
[Clients] Client updated successfully: client_xxx
[API] Client updated: client_xxx
```

### 2.4 Delete Client

**Steps:**
1. Navigate to `/clients`
2. Click Delete icon (trash) on a client row
3. Confirm deletion in dialog

**Expected Results:**
- ✅ Success toast notification
- ✅ Client removed from table
- ✅ Console shows deletion success

**Console Verification:**
```
[API] Deleting client: client_xxx
[Clients] Delete client attempt: client_xxx for agent: user_xxx
[Clients] Client deleted successfully: client_xxx
[API] Client deleted: client_xxx
```

### 2.5 Test Error Handling

**Steps:**
1. Try to add client with:
   - Empty name
   - Invalid email format
   - No location in search criteria
2. Submit form

**Expected Results:**
- ✅ Form validation prevents submission OR
- ✅ Error message displayed
- ✅ Console shows validation error

---

## 3. Dashboard / Saved Searches

### 3.1 Fetch Dashboard Results

**Steps:**
1. Navigate to `/dashboard`
2. Wait for data to load
3. Check summary cards and client tabs

**Expected Results:**
- ✅ Loading skeleton appears initially
- ✅ Summary cards show: Total Clients, Total Listings, Active Searches
- ✅ Client tabs appear at top
- ✅ Listings displayed in grid below
- ✅ Console shows dashboard fetch

**Console Verification:**
```
[API] Fetching dashboard
[Dashboard] Fetching dashboard results for agent: user_xxx
[Dashboard] Found X clients for agent: user_xxx
[Dashboard] Fetching listings for client: Client Name (client_xxx)
[Dashboard] Search criteria: { location: 'London', ... }
[Rightmove] Fetching: https://www.rightmove.co.uk/...
[Zoopla] Fetching: https://www.zoopla.co.uk/...
[OpenRent] Fetching: https://www.openrent.co.uk/...
[SpareRoom] Fetching: https://www.spareroom.co.uk/...
[Dashboard] Found X listings for client: Client Name
[Dashboard] Dashboard results complete:
  - Total clients: X
  - Total listings: X
  - Clients with listings: X
  - Clients with errors: X
[API] Dashboard fetched: { totalClients: X, totalListings: X }
```

### 3.2 Verify Listings from All Scrapers

**Steps:**
1. Navigate to `/dashboard`
2. Check listings in each client tab
3. Look at listing sources

**Expected Results:**
- ✅ Listings from multiple sources (Rightmove, Zoopla, OpenRent, SpareRoom)
- ✅ Each listing shows source badge
- ✅ Listings are deduplicated (no exact duplicates)

**Console Verification:**
```
[Rightmove] Found X properties
[Zoopla] Found X properties
[OpenRent] Found X properties
[SpareRoom] Found X properties
[searchProperties] Deduplicated listings: X unique properties
```

### 3.3 Test Error Handling

**Steps:**
1. Create a client with invalid search criteria
2. Navigate to `/dashboard`
3. Check if dashboard still loads

**Expected Results:**
- ✅ Dashboard loads even if some clients have errors
- ✅ Error message shown for failed clients
- ✅ Other clients' listings still displayed

**Console Verification:**
```
[Dashboard] Error fetching listings for client Client Name (client_xxx): Error message
[Dashboard] Dashboard results complete:
  - Clients with errors: X
```

### 3.4 Test Refresh Functionality

**Steps:**
1. Navigate to `/dashboard`
2. Click "Refresh" button
3. Wait for data to reload

**Expected Results:**
- ✅ Refresh spinner appears
- ✅ Data reloads
- ✅ Console shows new fetch

---

## 4. Alerts / Notifications

### 4.1 Generate Alerts

**Steps:**
1. Navigate to `/dashboard` (first time to establish baseline)
2. Wait a few seconds
3. Navigate to `/alerts`
4. Check for new listings

**Expected Results:**
- ✅ Alerts page loads
- ✅ Shows summary: Total alerts, Total new listings
- ✅ Alerts grouped by client
- ✅ Each alert shows timestamp and new listings count

**Console Verification:**
```
[API] Fetching alerts
[Alerts] Generating alerts...
[Alerts] Previous listings for X clients
[Alerts] Current listings for X clients
[Alerts] Comparing listings for client: Client Name (client_xxx)
[Alerts] ⚠️  NEW LISTINGS DETECTED for Client Name: X new properties
[Alerts] Sample new listing: { id: '...', title: '...', ... }
[Alerts] 📧 NOTIFICATION: Client Name has X new property listing(s)
[Alerts] Alert generation complete:
  - Total alerts: X
  - Total new listings: X
[API] Alerts fetched: { totalAlerts: X, totalNewListings: X }
```

### 4.2 Verify Alert Structure

**Steps:**
1. Navigate to `/alerts`
2. Check browser console
3. Inspect alert objects

**Expected Results:**
- ✅ Each alert has: clientId, clientName, newListings[], timestamp, totalNew
- ✅ newListings array contains PropertyListing objects
- ✅ Timestamp is ISO format

### 4.3 Test Alert Comparison

**Steps:**
1. Navigate to `/dashboard` (establish baseline)
2. Wait 5 seconds
3. Navigate to `/dashboard` again (trigger new search)
4. Navigate to `/alerts`

**Expected Results:**
- ✅ First alert fetch may show many new listings
- ✅ Subsequent fetches show only truly new listings
- ✅ Console shows comparison logic

**Console Verification:**
```
[Alerts] Comparing listings for client: Client Name
[Alerts] - Previous: X listings
[Alerts] - Current: Y listings
[Alerts] ⚠️  NEW LISTINGS DETECTED: Z new properties
```

---

## 5. Frontend Integration

### 5.1 Test All Pages Load

**Pages to Test:**
- `/login` - Login page
- `/dashboard` - Dashboard page
- `/clients` - Client management
- `/alerts` - Alerts page
- `/settings` - Settings page

**Expected Results:**
- ✅ All pages load without errors
- ✅ Navigation works
- ✅ Protected pages redirect to login if not authenticated

### 5.2 Test API Calls

**Steps:**
1. Open DevTools → Network tab
2. Navigate through pages
3. Check API requests

**Expected Results:**
- ✅ All API calls include `Authorization: Bearer <token>` header
- ✅ Responses are JSON
- ✅ Status codes: 200 (success), 401 (unauthorized), 400 (bad request)

### 5.3 Test Loading States

**Steps:**
1. Navigate to `/dashboard`
2. Observe loading skeleton
3. Check when data appears

**Expected Results:**
- ✅ Skeleton loaders appear during fetch
- ✅ Loading spinners on buttons during operations
- ✅ Smooth transition to content

### 5.4 Test Error States

**Steps:**
1. Disconnect internet
2. Try to fetch dashboard
3. Check error message

**Expected Results:**
- ✅ Error message displayed
- ✅ User-friendly error text
- ✅ Retry option available

---

## 6. TypeScript Type Safety

### 6.1 Check Type Errors

**Steps:**
1. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

**Expected Results:**
- ✅ No type errors
- ✅ All imports resolve correctly
- ✅ All API responses typed correctly

### 6.2 Verify Type Definitions

**Check Files:**
- `src/lib/api/api.ts` - API types
- `server/types.ts` - Backend types
- `server/api/*.ts` - API function types

**Expected Results:**
- ✅ All types exported correctly
- ✅ Types match between frontend and backend
- ✅ No `any` types (except where necessary)

---

## 7. Console Logging Verification

### Backend Console Logs

**Check for:**
- `[Users]` - User management logs
- `[Clients]` - Client management logs
- `[Dashboard]` - Dashboard logs
- `[Alerts]` - Alert generation logs
- `[Rightmove]`, `[Zoopla]`, etc. - Scraper logs
- `[API]` - API route logs

### Frontend Console Logs

**Check for:**
- `[API]` - API call logs
- `[Login]` - Login page logs
- `[Clients]` - Client page logs
- `[Dashboard]` - Dashboard page logs
- `[Alerts]` - Alerts page logs

---

## Test Checklist

- [ ] Authentication: Register, Login, Logout
- [ ] Protected Routes: 401 errors, redirects
- [ ] Client Management: Add, Update, Delete, List
- [ ] Dashboard: Fetch, Display, Refresh
- [ ] Alerts: Generate, Display, Compare
- [ ] Settings: Load, Save preferences
- [ ] Error Handling: Invalid data, network errors
- [ ] Loading States: Skeletons, spinners
- [ ] Type Safety: No TypeScript errors
- [ ] Console Logging: All operations logged

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Check token in localStorage
   - Verify token hasn't expired
   - Re-login if needed

2. **No Listings Appearing**
   - Check scraper logs in console
   - Verify search criteria is valid
   - Check network requests for errors

3. **Alerts Not Showing**
   - Ensure dashboard was fetched first (to establish baseline)
   - Check alert generation logs
   - Verify listing history is being stored

4. **Type Errors**
   - Run `npx tsc --noEmit` to check
   - Verify all imports are correct
   - Check type definitions match

---

## Success Criteria

✅ All authentication flows work  
✅ Client CRUD operations function correctly  
✅ Dashboard displays listings from all scrapers  
✅ Alerts detect and display new listings  
✅ All pages load and function correctly  
✅ Error handling works as expected  
✅ TypeScript types are correct  
✅ Console logging provides useful debug information  

