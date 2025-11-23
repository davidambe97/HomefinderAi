/**
 * Validation Runner Script
 * 
 * Run this script to validate all backend APIs
 * Usage: npx tsx tests/validation-runner.ts
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const startTime = Date.now();
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    const duration = Date.now() - startTime;
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    throw { error, duration };
  }
}

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    console.log(`✅ PASSED: ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error?.message || String(error);
    results.push({ name, passed: false, error: errorMessage, duration });
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${errorMessage}`);
  }
}

async function main() {
  console.log('🚀 Starting HomeFinder AI SaaS Validation Tests');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(60));

  let authToken: string | null = null;
  let testClientId: string | null = null;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // ==================== 1. Authentication Tests ====================
  console.log('\n📋 Section 1: Authentication & User Management');

  await runTest('Register new agent', async () => {
    const { ok, status, data } = await apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Agent',
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!ok || status !== 200) {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }

    if (!data.token || !data.user) {
      throw new Error('Missing token or user in response');
    }

    authToken = data.token;
    if (authToken) {
      console.log(`   ✓ Token received: ${authToken.substring(0, 20)}...`);
    }
  });

  await runTest('Login with credentials', async () => {
    const { ok, status, data } = await apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!ok || status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }

    if (!data.token) {
      throw new Error('Missing token in response');
    }

    authToken = data.token;
    console.log(`   ✓ Login successful`);
  });

  await runTest('Reject invalid login', async () => {
    const { ok, status } = await apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    });

    if (ok || status !== 400) {
      throw new Error('Should reject invalid password');
    }
    console.log(`   ✓ Invalid login correctly rejected`);
  });

  // ==================== 2. Client Management Tests ====================
  console.log('\n📋 Section 2: Client Management');

  await runTest('Add new client', async () => {
    if (!authToken) throw new Error('No auth token');

    const { ok, status, data } = await apiRequest(
      '/api/clients',
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Client',
          email: `client-${Date.now()}@example.com`,
          searchCriteria: {
            location: 'London',
            propertyType: 'house',
            minPrice: 200000,
            maxPrice: 500000,
            bedrooms: 3,
          },
        }),
      },
      authToken
    );

    if (!ok || status !== 201) {
      throw new Error(`Add client failed: ${JSON.stringify(data)}`);
    }

    if (!data.id) {
      throw new Error('Missing client ID in response');
    }

    testClientId = data.id;
    console.log(`   ✓ Client created: ${testClientId}`);
  });

  await runTest('List clients', async () => {
    if (!authToken) throw new Error('No auth token');

    const { ok, status, data } = await apiRequest(
      '/api/clients',
      { method: 'GET' },
      authToken
    );

    if (!ok || status !== 200) {
      throw new Error(`List clients failed: ${JSON.stringify(data)}`);
    }

    if (!Array.isArray(data.clients)) {
      throw new Error('Clients should be an array');
    }

    console.log(`   ✓ Found ${data.clients.length} clients`);
  });

  await runTest('Update client', async () => {
    if (!authToken || !testClientId) throw new Error('Missing token or client ID');

    const { ok, status, data } = await apiRequest(
      `/api/clients/${testClientId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Test Client',
        }),
      },
      authToken
    );

    if (!ok || status !== 200) {
      throw new Error(`Update client failed: ${JSON.stringify(data)}`);
    }

    if (data.name !== 'Updated Test Client') {
      throw new Error('Client name not updated');
    }

    console.log(`   ✓ Client updated successfully`);
  });

  await runTest('Protected route without token', async () => {
    const { ok, status } = await apiRequest('/api/clients', {
      method: 'GET',
    });

    if (ok || status !== 401) {
      throw new Error('Should return 401 without token');
    }
    console.log(`   ✓ Protected route correctly requires auth`);
  });

  await runTest('Delete client', async () => {
    if (!authToken || !testClientId) throw new Error('Missing token or client ID');

    const { ok, status } = await apiRequest(
      `/api/clients/${testClientId}`,
      { method: 'DELETE' },
      authToken
    );

    if (!ok || status !== 200) {
      throw new Error('Delete client failed');
    }

    console.log(`   ✓ Client deleted successfully`);
  });

  // ==================== 3. Dashboard Tests ====================
  console.log('\n📋 Section 3: Dashboard / Saved Searches');

  await runTest('Fetch dashboard', async () => {
    if (!authToken) throw new Error('No auth token');

    const { ok, status, data } = await apiRequest(
      '/api/dashboard',
      { method: 'GET' },
      authToken
    );

    if (!ok || status !== 200) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(data)}`);
    }

    if (typeof data.totalClients !== 'number') {
      throw new Error('Missing totalClients in response');
    }

    if (!Array.isArray(data.results)) {
      throw new Error('Results should be an array');
    }

    console.log(`   ✓ Dashboard fetched: ${data.totalClients} clients, ${data.totalListings} listings`);
  });

  // ==================== 4. Alerts Tests ====================
  console.log('\n📋 Section 4: Alerts / Notifications');

  await runTest('Generate alerts', async () => {
    if (!authToken) throw new Error('No auth token');

    // First fetch dashboard to establish baseline
    await apiRequest('/api/dashboard', { method: 'GET' }, authToken);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { ok, status, data } = await apiRequest(
      '/api/alerts',
      { method: 'GET' },
      authToken
    );

    if (!ok || status !== 200) {
      throw new Error(`Alerts fetch failed: ${JSON.stringify(data)}`);
    }

    if (typeof data.totalAlerts !== 'number') {
      throw new Error('Missing totalAlerts in response');
    }

    if (!Array.isArray(data.alerts)) {
      throw new Error('Alerts should be an array');
    }

    console.log(`   ✓ Alerts generated: ${data.totalAlerts} alerts, ${data.totalNewListings} new listings`);
  });

  // ==================== Summary ====================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  // Save results to file
  const resultsFile = join(process.cwd(), 'tests', 'validation-results.json');
  await writeFile(
    resultsFile,
    JSON.stringify({ results, summary: { passed, failed, total: results.length, totalDuration } }, null, 2)
  );
  console.log(`\n💾 Results saved to: ${resultsFile}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

