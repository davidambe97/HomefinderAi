# Testing & Validation Guide - HomeFinder AI SaaS MVP3

Complete testing and validation documentation for the HomeFinder AI SaaS application.

## Quick Start

### 1. Install Test Dependencies (Optional)

For automated testing with Vitest:
```bash
npm install --save-dev vitest @vitest/ui
```

For standalone validation script:
```bash
npm install --save-dev tsx
```

### 2. Run Tests

**Option A: Automated Tests (Vitest)**
```bash
npm test
```

**Option B: Standalone Validation**
```bash
npm run test:run
```

**Option C: Type Checking**
```bash
npm run type-check
```

**Option D: Manual Testing**
Follow the guide in `tests/manual-testing.md`

## Test Coverage

### ✅ 1. Authentication & User Management

**Tests:**
- User registration with valid data
- Login with valid credentials
- JWT token generation and validation
- Protected route authentication (401 errors)
- Duplicate email prevention
- Invalid credential rejection

**Console Logs to Verify:**
```
[Users] Registration attempt for email: ...
[Users] User registered successfully: ...
[Users] Login attempt for email: ...
[Users] User logged in successfully: ...
[Users] Auth middleware: ...
```

### ✅ 2. Client Management

**Tests:**
- Add new client with search criteria
- List all clients for authenticated agent
- Update existing client
- Delete client
- Error handling for invalid data
- Agent isolation (clients linked to correct agent)

**Console Logs to Verify:**
```
[Clients] Add client attempt for agent: ...
[Clients] Client added successfully: ...
[Clients] List clients for agent: ...
[Clients] Update client attempt: ...
[Clients] Client updated successfully: ...
[Clients] Delete client attempt: ...
[Clients] Client deleted successfully: ...
```

### ✅ 3. Dashboard / Saved Searches

**Tests:**
- Fetch dashboard results per client
- Verify listings from all four scrapers
- Confirm total counts and statistics
- Validate error handling if scraper fails
- Test refresh functionality

**Console Logs to Verify:**
```
[Dashboard] Fetching dashboard results for agent: ...
[Dashboard] Found X clients for agent: ...
[Rightmove] Fetching: ...
[Rightmove] Found X properties
[Zoopla] Fetching: ...
[Zoopla] Found X properties
[OpenRent] Fetching: ...
[OpenRent] Found X properties
[SpareRoom] Fetching: ...
[SpareRoom] Found X properties
[Dashboard] Dashboard results complete: ...
```

### ✅ 4. Alerts / Notifications

**Tests:**
- Generate alerts for new listings
- Verify Alert structure per client
- Confirm listing comparison logic
- Test with new vs. previous listing comparison

**Console Logs to Verify:**
```
[Alerts] Generating alerts...
[Alerts] Comparing listings for client: ...
[Alerts] ⚠️  NEW LISTINGS DETECTED for ...: X new properties
[Alerts] 📧 NOTIFICATION: ... has X new property listing(s)
[Alerts] Alert generation complete: ...
```

### ✅ 5. Frontend Integration

**Tests:**
- All pages load correctly
- API calls work with JWT authentication
- Loading states display correctly
- Error states handle gracefully
- Success notifications appear

**Console Logs to Verify:**
```
[API] Login request: ...
[API] Fetching clients
[API] Fetching dashboard
[API] Fetching alerts
```

### ✅ 6. TypeScript Type Safety

**Tests:**
- No type errors in compilation
- Types match between frontend and backend
- All exports properly typed
- No unnecessary `any` types

**Run:**
```bash
npm run type-check
```

## Test Files

### Automated Tests

- **`tests/validation.test.ts`** - Vitest/Jest compatible test suite
  - Full test coverage for all features
  - Can be run with `npm test`

### Standalone Scripts

- **`tests/validation-runner.ts`** - Node.js validation script
  - Runs without test framework
  - Generates JSON results file
  - Run with `npm run test:run`

- **`tests/type-check.ts`** - TypeScript type validation
  - Checks type definitions
  - Validates type consistency
  - Run with `npx tsx tests/type-check.ts`

### Documentation

- **`tests/manual-testing.md`** - Step-by-step manual testing guide
  - Detailed instructions for each feature
  - Expected results and console logs
  - Troubleshooting tips

- **`tests/README.md`** - Testing overview and quick reference

## Running Tests

### Development Server

Always start the dev server before running tests:
```bash
npm run dev
```

### Test Commands

```bash
# Run Vitest tests
npm test

# Run Vitest with UI
npm test:ui

# Run standalone validation
npm run test:run

# Type check only
npm run type-check

# All checks
npm run type-check && npm run test:run
```

## Expected Console Output

### Successful Test Run

```
🚀 Starting HomeFinder AI SaaS Validation Tests
📍 API Base URL: http://localhost:3000
============================================================

📋 Section 1: Authentication & User Management
🧪 Testing: Register new agent
✅ PASSED: Register new agent (234ms)
   ✓ Token received: eyJhbGciOiJIUzI1NiIs...

🧪 Testing: Login with credentials
✅ PASSED: Login with credentials (156ms)
   ✓ Login successful

📋 Section 2: Client Management
🧪 Testing: Add new client
✅ PASSED: Add new client (345ms)
   ✓ Client created: client_abc123

...

📊 Test Summary
============================================================
✅ Passed: 15
❌ Failed: 0
⏱️  Total Duration: 3456ms
📈 Success Rate: 100.0%
```

## Validation Checklist

### Pre-Testing Setup
- [ ] Development server running (`npm run dev`)
- [ ] Browser console open for frontend logs
- [ ] Terminal console open for backend logs
- [ ] Test dependencies installed (if using automated tests)

### Authentication
- [ ] Register new agent account
- [ ] Login with credentials
- [ ] Verify JWT token in localStorage
- [ ] Test protected routes (should redirect to login)
- [ ] Test invalid credentials (should fail)

### Client Management
- [ ] Add client with search criteria
- [ ] List all clients
- [ ] Update client information
- [ ] Delete client
- [ ] Verify agent isolation (only see own clients)

### Dashboard
- [ ] Fetch dashboard data
- [ ] View listings per client
- [ ] Verify listings from all scrapers
- [ ] Test refresh functionality
- [ ] Verify error handling

### Alerts
- [ ] Generate alerts (fetch dashboard first)
- [ ] View new listings
- [ ] Verify alert structure
- [ ] Test comparison logic

### Frontend
- [ ] All pages load
- [ ] Navigation works
- [ ] Loading states appear
- [ ] Error messages display
- [ ] Success notifications show

### Type Safety
- [ ] TypeScript compiles without errors
- [ ] No `any` types (except where necessary)
- [ ] Types match between frontend/backend

## Troubleshooting

### Tests Fail with Connection Error
- Ensure dev server is running on correct port
- Check `API_BASE_URL` environment variable
- Verify network connectivity

### 401 Unauthorized Errors
- Check token in localStorage
- Verify token hasn't expired (24 hours)
- Re-login if needed

### No Listings in Dashboard
- This is expected if scrapers return empty results
- Check scraper console logs
- Verify search criteria is valid

### Type Errors
- Run `npm run type-check`
- Check import paths
- Verify type definitions

## Success Criteria

All of the following should pass:

✅ **Authentication**
- Registration works
- Login works
- JWT tokens valid
- Protected routes secured

✅ **Client Management**
- CRUD operations work
- Agent isolation enforced
- Error handling works

✅ **Dashboard**
- Fetches data correctly
- Displays listings
- Handles errors gracefully

✅ **Alerts**
- Generates correctly
- Detects new listings
- Structure is valid

✅ **Frontend**
- All pages load
- API calls work
- States handled correctly

✅ **Type Safety**
- No TypeScript errors
- Types consistent
- Proper exports

## Next Steps

1. ✅ Run manual tests following `tests/manual-testing.md`
2. ✅ Run automated tests: `npm test` or `npm run test:run`
3. ✅ Verify console logs match expected output
4. ✅ Check TypeScript: `npm run type-check`
5. ✅ Test in different browsers
6. ✅ Test with different network conditions
7. ✅ Performance testing (optional)
8. ✅ Security testing (optional)

## Additional Resources

- **Manual Testing Guide**: `tests/manual-testing.md`
- **Test README**: `tests/README.md`
- **Validation Script**: `tests/validation-runner.ts`
- **Type Check Script**: `tests/type-check.ts`

---

**Last Updated**: MVP3 Implementation
**Status**: ✅ Ready for Testing

