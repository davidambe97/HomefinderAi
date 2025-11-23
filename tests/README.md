# Testing & Validation for HomeFinder AI SaaS MVP3

This directory contains comprehensive testing and validation tools for the HomeFinder AI SaaS application.

## Test Files

- `validation.test.ts` - Vitest/Jest compatible test suite
- `validation-runner.ts` - Standalone Node.js validation script
- `manual-testing.md` - Step-by-step manual testing guide

## Quick Start

### Option 1: Automated Tests (Vitest)

1. Install Vitest (if not already installed):
   ```bash
   npm install --save-dev vitest @vitest/ui
   ```

2. Add test script to `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui"
     }
   }
   ```

3. Run tests:
   ```bash
   npm test
   ```

### Option 2: Standalone Validation Script

1. Install tsx (TypeScript executor):
   ```bash
   npm install --save-dev tsx
   ```

2. Run validation:
   ```bash
   npx tsx tests/validation-runner.ts
   ```

3. Set custom API URL (optional):
   ```bash
   API_BASE_URL=http://localhost:8080 npx tsx tests/validation-runner.ts
   ```

### Option 3: Manual Testing

Follow the step-by-step guide in `manual-testing.md` to test all features manually.

## Test Coverage

### ✅ Authentication & User Management
- [x] User registration
- [x] User login
- [x] JWT token validation
- [x] Protected route authentication (401 errors)
- [x] Duplicate email prevention
- [x] Invalid credential rejection

### ✅ Client Management
- [x] Add new client
- [x] List clients
- [x] Update client
- [x] Delete client
- [x] Error handling for invalid data
- [x] Agent isolation (clients linked to correct agent)

### ✅ Dashboard / Saved Searches
- [x] Fetch dashboard results
- [x] Listings from all scrapers (Rightmove, Zoopla, OpenRent, SpareRoom)
- [x] Error handling for scraper failures
- [x] Total counts and statistics
- [x] Client-specific listings

### ✅ Alerts / Notifications
- [x] Alert generation
- [x] New listing detection
- [x] Alert structure validation
- [x] Listing comparison logic
- [x] Console logging

### ✅ Frontend Integration
- [x] All pages load correctly
- [x] API calls work with JWT authentication
- [x] Loading states
- [x] Error states
- [x] Success notifications

### ✅ TypeScript Type Safety
- [x] No type errors
- [x] Type definitions match between frontend and backend
- [x] Proper type exports

## Console Logging Verification

All operations include detailed console logging:

### Backend Logs
- `[Users]` - User management operations
- `[Clients]` - Client management operations
- `[Dashboard]` - Dashboard operations
- `[Alerts]` - Alert generation
- `[Rightmove]`, `[Zoopla]`, `[OpenRent]`, `[SpareRoom]` - Scraper operations
- `[API]` - API route handlers

### Frontend Logs
- `[API]` - API service calls
- `[Login]` - Login page operations
- `[Clients]` - Client management page
- `[Dashboard]` - Dashboard page
- `[Alerts]` - Alerts page

## Running Tests

### Development Server
Make sure the development server is running:
```bash
npm run dev
```

### Run All Tests
```bash
# Using Vitest
npm test

# Using standalone script
npx tsx tests/validation-runner.ts
```

### Run Specific Test Section
Edit the test file to comment out sections you don't want to run, or use Vitest's filtering:
```bash
npm test -- --grep "Authentication"
```

## Expected Results

### Successful Test Run
```
🚀 Starting HomeFinder AI SaaS Validation Tests
📍 API Base URL: http://localhost:3000
============================================================

📋 Section 1: Authentication & User Management
🧪 Testing: Register new agent
✅ PASSED: Register new agent (234ms)
...

📊 Test Summary
============================================================
✅ Passed: 15
❌ Failed: 0
⏱️  Total Duration: 3456ms
📈 Success Rate: 100.0%
```

### Failed Test
```
❌ FAILED: Add new client
   Error: Missing auth token
```

## Troubleshooting

### Tests Fail with Connection Error
- Ensure development server is running
- Check API_BASE_URL is correct
- Verify port matches server configuration

### 401 Unauthorized Errors
- Check if registration/login tests passed
- Verify token is being stored correctly
- Check token expiration (24 hours)

### No Listings in Dashboard
- This is expected if scrapers return empty results
- Check scraper logs in console
- Verify search criteria is valid

### Type Errors
- Run `npx tsc --noEmit` to check TypeScript
- Verify all imports are correct
- Check type definitions match

## Continuous Integration

To integrate into CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm run dev &
    sleep 5
    npx tsx tests/validation-runner.ts
```

## Test Results

Results are saved to `tests/validation-results.json` after running the validation script.

## Next Steps

1. ✅ Run manual tests following `manual-testing.md`
2. ✅ Run automated tests using `validation-runner.ts`
3. ✅ Verify all console logs appear correctly
4. ✅ Check TypeScript compilation: `npx tsc --noEmit`
5. ✅ Test in different browsers
6. ✅ Test with different network conditions

## Success Criteria

All tests should pass:
- ✅ Authentication flows work
- ✅ Client CRUD operations function
- ✅ Dashboard displays listings
- ✅ Alerts detect new listings
- ✅ All pages load correctly
- ✅ Error handling works
- ✅ TypeScript types are correct
- ✅ Console logging provides debug info

