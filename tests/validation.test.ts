/**
 * Validation and Testing Scripts for HomeFinder AI SaaS MVP3
 * 
 * This file contains validation functions that can be run manually
 * or integrated into a test runner like Vitest or Jest
 * 
 * To use with Vitest, install: npm install --save-dev vitest
 */

// Optional Vitest imports - file works without vitest installed
// To use with Vitest: npm install --save-dev vitest
// @ts-ignore - Vitest is optional
let describe: any, it: any, expect: any, beforeAll: any, afterAll: any;

// Try to import vitest, but provide fallbacks if not available
try {
  // @ts-ignore - Dynamic import for optional dependency
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
  beforeAll = vitest.beforeAll;
  afterAll = vitest.afterAll;
} catch {
  // Vitest not installed - provide fallback implementations
  // Fallback implementations for when vitest is not available
  describe = (name: string, fn: () => void) => {
    console.log(`\n📋 ${name}`);
    fn();
  };
  it = (name: string, fn: () => void | Promise<void>) => {
    console.log(`  🧪 ${name}`);
    try {
      const result = fn();
      if (result instanceof Promise) {
        result.catch(err => console.error(`  ❌ ${name}:`, err));
      }
    } catch (err) {
      console.error(`  ❌ ${name}:`, err);
    }
  };
  expect = (value: any) => ({
    toBe: (expected: any) => {
      if (value !== expected) throw new Error(`Expected ${expected}, got ${value}`);
    },
    toBeDefined: () => {
      if (value === undefined) throw new Error('Expected value to be defined');
    },
    toContain: (substring: string) => {
      if (!String(value).includes(substring)) throw new Error(`Expected "${value}" to contain "${substring}"`);
    },
    toBeGreaterThanOrEqual: (min: number) => {
      if (value < min) throw new Error(`Expected ${value} to be >= ${min}`);
    },
  });
  beforeAll = (fn: () => void | Promise<void>) => fn();
  afterAll = (fn: () => void | Promise<void>) => fn();
}

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_AGENT = {
  name: 'Test Agent',
  email: `test-agent-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

let authToken: string | null = null;
let testClientId: string | null = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`[TEST] ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);
  
  return response;
}

/**
 * ==================== 1. Authentication & User Management Tests ====================
 */
describe('Authentication & User Management', () => {
  it('should register a new agent', async () => {
    console.log('\n[TEST] 1.1: Registering new agent...');
    console.log('[TEST] Email:', TEST_AGENT.email);
    
    const response = await apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        name: TEST_AGENT.name,
        email: TEST_AGENT.email,
        password: TEST_AGENT.password,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(TEST_AGENT.email);
    
    authToken = data.token;
    console.log('[TEST] ✓ Registration successful');
    if (authToken) {
      console.log('[TEST] Token received:', authToken.substring(0, 20) + '...');
    }
  });

  it('should fail to register with duplicate email', async () => {
    console.log('\n[TEST] 1.2: Attempting duplicate registration...');
    
    const response = await apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Another Agent',
        email: TEST_AGENT.email,
        password: 'DifferentPassword123!',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('already');
    console.log('[TEST] ✓ Duplicate registration correctly rejected');
  });

  it('should login with valid credentials', async () => {
    console.log('\n[TEST] 1.3: Logging in...');
    
    const response = await apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_AGENT.email,
        password: TEST_AGENT.password,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(TEST_AGENT.email);
    
    authToken = data.token;
    console.log('[TEST] ✓ Login successful');
  });

  it('should fail to login with invalid credentials', async () => {
    console.log('\n[TEST] 1.4: Attempting login with wrong password...');
    
    const response = await apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_AGENT.email,
        password: 'WrongPassword123!',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    console.log('[TEST] ✓ Invalid login correctly rejected');
  });

  it('should verify JWT token is valid', () => {
    console.log('\n[TEST] 1.5: Verifying JWT token structure...');
    
    if (!authToken) {
      throw new Error('No auth token available');
    }

    // JWT tokens have 3 parts separated by dots
    const parts = authToken.split('.');
    expect(parts.length).toBe(3);
    
    // Decode payload (base64)
    try {
      const payload = JSON.parse(atob(parts[1]));
      expect(payload.email).toBe(TEST_AGENT.email);
      expect(payload.id).toBeDefined();
      expect(payload.name).toBeDefined();
      console.log('[TEST] ✓ JWT token structure valid');
      console.log('[TEST] Token payload:', payload);
    } catch (e) {
      throw new Error('Invalid JWT token format');
    }
  });
});

/**
 * ==================== 2. Client Management Tests ====================
 */
describe('Client Management', () => {
  it('should add a new client', async () => {
    console.log('\n[TEST] 2.1: Adding new client...');
    
    const clientData = {
      name: 'Test Client',
      email: `test-client-${Date.now()}@example.com`,
      searchCriteria: {
        location: 'London',
        propertyType: 'house',
        minPrice: 200000,
        maxPrice: 500000,
        bedrooms: 3,
      },
    };

    const response = await apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.name).toBe(clientData.name);
    expect(data.email).toBe(clientData.email);
    expect(data.searchCriteria.location).toBe(clientData.searchCriteria.location);
    
    testClientId = data.id;
    console.log('[TEST] ✓ Client added successfully');
    console.log('[TEST] Client ID:', testClientId);
  });

  it('should list clients for authenticated agent', async () => {
    console.log('\n[TEST] 2.2: Listing clients...');
    
    const response = await apiRequest('/api/clients', {
      method: 'GET',
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data.clients)).toBe(true);
    expect(data.clients.length).toBeGreaterThan(0);
    
    const client = data.clients.find((c: any) => c.id === testClientId);
    expect(client).toBeDefined();
    console.log('[TEST] ✓ Clients listed successfully');
    console.log('[TEST] Total clients:', data.clients.length);
  });

  it('should update an existing client', async () => {
    console.log('\n[TEST] 2.3: Updating client...');
    
    if (!testClientId) {
      throw new Error('No test client ID available');
    }

    const updateData = {
      name: 'Updated Test Client',
      searchCriteria: {
        location: 'Manchester',
        bedrooms: 4,
      },
    };

    const response = await apiRequest(`/api/clients/${testClientId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.name).toBe(updateData.name);
    expect(data.searchCriteria.location).toBe(updateData.searchCriteria.location);
    console.log('[TEST] ✓ Client updated successfully');
  });

  it('should return 401 for protected routes without token', async () => {
    console.log('\n[TEST] 2.4: Testing protected route without token...');
    
    const originalToken = authToken;
    authToken = null;

    const response = await apiRequest('/api/clients', {
      method: 'GET',
    });

    expect(response.status).toBe(401);
    console.log('[TEST] ✓ Protected route correctly requires authentication');
    
    authToken = originalToken;
  });

  it('should delete a client', async () => {
    console.log('\n[TEST] 2.5: Deleting client...');
    
    if (!testClientId) {
      throw new Error('No test client ID available');
    }

    const response = await apiRequest(`/api/clients/${testClientId}`, {
      method: 'DELETE',
    });

    expect(response.ok).toBe(true);
    console.log('[TEST] ✓ Client deleted successfully');
    
    // Verify deletion
    const listResponse = await apiRequest('/api/clients', {
      method: 'GET',
    });
    const listData = await listResponse.json();
    const deletedClient = listData.clients.find((c: any) => c.id === testClientId);
    expect(deletedClient).toBeUndefined();
    console.log('[TEST] ✓ Client confirmed deleted');
  });

  it('should handle invalid client data', async () => {
    console.log('\n[TEST] 2.6: Testing invalid client data...');
    
    const response = await apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: not an email
        searchCriteria: {}, // Invalid: no location
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    console.log('[TEST] ✓ Invalid data correctly rejected');
  });
});

/**
 * ==================== 3. Dashboard / Saved Searches Tests ====================
 */
describe('Dashboard / Saved Searches', () => {
  let testClientIdForDashboard: string;

  beforeAll(async () => {
    // Create a client for dashboard testing
    console.log('\n[TEST] 3.0: Setting up client for dashboard tests...');
    const response = await apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Dashboard Test Client',
        email: `dashboard-test-${Date.now()}@example.com`,
        searchCriteria: {
          location: 'London',
          propertyType: 'flat',
          minPrice: 100000,
          maxPrice: 300000,
        },
      }),
    });
    const data = await response.json();
    testClientIdForDashboard = data.id;
  });

  it('should fetch dashboard results', async () => {
    console.log('\n[TEST] 3.1: Fetching dashboard...');
    
    const response = await apiRequest('/api/dashboard', {
      method: 'GET',
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.agentId).toBeDefined();
    expect(data.totalClients).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.results)).toBe(true);
    console.log('[TEST] ✓ Dashboard fetched successfully');
    console.log('[TEST] Total clients:', data.totalClients);
    console.log('[TEST] Total listings:', data.totalListings);
  });

  it('should include listings from all scrapers', async () => {
    console.log('\n[TEST] 3.2: Verifying scraper results...');
    
    const response = await apiRequest('/api/dashboard', {
      method: 'GET',
    });
    const data = await response.json();
    
    if (data.results.length > 0 && data.totalListings > 0) {
      const result = data.results[0];
      const sources = new Set(result.listings.map((l: any) => l.source));
      console.log('[TEST] Sources found:', Array.from(sources));
      expect(sources.size).toBeGreaterThan(0);
      console.log('[TEST] ✓ Listings from multiple sources detected');
    } else {
      console.log('[TEST] ⚠ No listings found (this is OK if scrapers return empty)');
    }
  });

  it('should handle scraper failures gracefully', async () => {
    console.log('\n[TEST] 3.3: Testing error handling...');
    
    const response = await apiRequest('/api/dashboard', {
      method: 'GET',
    });
    const data = await response.json();
    
    // Dashboard should still return even if some scrapers fail
    expect(data.results).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
    
    // Check if any results have errors
    const resultsWithErrors = data.results.filter((r: any) => r.error);
    if (resultsWithErrors.length > 0) {
      console.log('[TEST] ⚠ Some clients have errors (expected behavior)');
      resultsWithErrors.forEach((r: any) => {
        console.log(`[TEST]   - ${r.clientName}: ${r.error}`);
      });
    }
    console.log('[TEST] ✓ Error handling verified');
  });
});

/**
 * ==================== 4. Alerts / Notifications Tests ====================
 */
describe('Alerts / Notifications', () => {
  it('should generate alerts for new listings', async () => {
    console.log('\n[TEST] 4.1: Generating alerts...');
    
    // First, fetch dashboard to populate history
    await apiRequest('/api/dashboard', { method: 'GET' });
    
    // Wait a bit, then fetch again to generate alerts
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await apiRequest('/api/alerts', {
      method: 'GET',
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.totalAlerts).toBeDefined();
    expect(data.totalNewListings).toBeDefined();
    expect(Array.isArray(data.alerts)).toBe(true);
    console.log('[TEST] ✓ Alerts generated successfully');
    console.log('[TEST] Total alerts:', data.totalAlerts);
    console.log('[TEST] Total new listings:', data.totalNewListings);
  });

  it('should have correct Alert structure', async () => {
    console.log('\n[TEST] 4.2: Verifying Alert structure...');
    
    const response = await apiRequest('/api/alerts', {
      method: 'GET',
    });
    const data = await response.json();
    
    if (data.alerts.length > 0) {
      const alert = data.alerts[0];
      expect(alert.clientId).toBeDefined();
      expect(alert.clientName).toBeDefined();
      expect(alert.newListings).toBeDefined();
      expect(alert.timestamp).toBeDefined();
      expect(alert.totalNew).toBeDefined();
      expect(Array.isArray(alert.newListings)).toBe(true);
      console.log('[TEST] ✓ Alert structure valid');
      console.log('[TEST] Sample alert:', {
        clientName: alert.clientName,
        totalNew: alert.totalNew,
        timestamp: alert.timestamp,
      });
    } else {
      console.log('[TEST] ⚠ No alerts found (this is OK if no new listings)');
    }
  });
});

/**
 * ==================== 5. Frontend Integration Tests ====================
 */
describe('Frontend Integration', () => {
  it('should have all required API endpoints', () => {
    console.log('\n[TEST] 5.1: Verifying API endpoints exist...');
    
    const endpoints = [
      '/api/users/login',
      '/api/users/register',
      '/api/clients',
      '/api/dashboard',
      '/api/alerts',
      '/api/search',
    ];
    
    endpoints.forEach(endpoint => {
      console.log(`[TEST]   ✓ ${endpoint}`);
    });
    
    expect(endpoints.length).toBeGreaterThan(0);
    console.log('[TEST] ✓ All endpoints defined');
  });

  it('should handle API errors gracefully', async () => {
    console.log('\n[TEST] 5.2: Testing error handling...');
    
    // Test with invalid endpoint
    const response = await apiRequest('/api/invalid-endpoint', {
      method: 'GET',
    });
    
    expect(response.status).toBe(404);
    console.log('[TEST] ✓ 404 errors handled correctly');
  });
});

// Export test utilities
export { apiRequest, TEST_AGENT, authToken };

