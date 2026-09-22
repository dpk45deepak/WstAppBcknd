const BASE_URL = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runIntegrationTests() {
  console.log('=== STARTING WSTAPP BACKEND INTEGRATION TESTS ===\n');
  let failures = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      failures++;
      console.error(`❌ FAIL: ${name}`);
      console.error('   Details:', err.message);
    }
  }

  const timestamp = Date.now();
  const userEmail = `user_${timestamp}@example.com`;
  const driverEmail = `driver_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;
  const password = 'password123';

  let userToken = '';
  let userId = '';
  let driverToken = '';
  let driverId = '';
  let adminToken = '';
  let adminId = '';
  let pickupId = '';

  // 1. Health Check
  await test('GET /health and GET /api', async () => {
    const res1 = await request('http://localhost:3000/health');
    if (res1.status !== 200) throw new Error('Health check returned ' + res1.status);
    const res2 = await request('');
    if (res2.status !== 200) throw new Error('Root API returned ' + res2.status);
  });

  // 2. Auth: Register User
  await test('POST /auth/register (user)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice User',
        email: userEmail,
        password,
        role: 'user'
      }
    });
    if (!res.ok || !res.data.token) throw new Error(JSON.stringify(res.data));
    userToken = res.data.token;
    userId = res.data.user.id;
  });

  // 3. Auth: Register Driver
  await test('POST /auth/register (driver)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Driver',
        email: driverEmail,
        password,
        role: 'driver'
      }
    });
    if (!res.ok || !res.data.token) throw new Error(JSON.stringify(res.data));
    driverToken = res.data.token;
    driverId = res.data.user.id;
  });

  // 4. Auth: Register Admin
  await test('POST /auth/register (admin)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Charlie Admin',
        email: adminEmail,
        password,
        role: 'admin'
      }
    });
    if (!res.ok || !res.data.token) throw new Error(JSON.stringify(res.data));
    adminToken = res.data.token;
    adminId = res.data.user.id;
  });

  // 5. Auth: Login
  await test('POST /auth/login', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: userEmail,
        password
      }
    });
    if (!res.ok || !res.data.token) throw new Error(JSON.stringify(res.data));
  });

  // 6. User Profile Retrieval
  await test('GET /users/profile', async () => {
    const res = await request('/users/profile', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!res.ok || !res.data.name || res.data.email !== userEmail) {
      throw new Error(`Profile missing name or email. Got: ${JSON.stringify(res.data)}`);
    }
  });

  // 7. Update Profile
  await test('PUT /users/profile', async () => {
    const res = await request('/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        phone: '+1-555-0199',
        address: '742 Evergreen Terrace'
      }
    });
    if (!res.ok || res.data.phone !== '+1-555-0199') throw new Error(JSON.stringify(res.data));
  });

  // 8. Create Pickup
  await test('POST /pickups (schedule pickup)', async () => {
    const res = await request('/pickups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        wasteType: 'recyclable',
        quantity: 2,
        address: '742 Evergreen Terrace, Springfield',
        specialInstructions: 'Leave by the front porch'
      }
    });
    if (!res.ok || !res.data.data?.id) throw new Error(JSON.stringify(res.data));
    pickupId = res.data.data.id;
  });

  // 9. Get User's Pickups
  await test('GET /pickups/my', async () => {
    const res = await request('/pickups/my', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!res.ok || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error(JSON.stringify(res.data));
    }
  });

  // 10. Driver viewing available pickups
  await test('GET /pickups?status=pending (Driver available pickups)', async () => {
    const res = await request('/pickups?status=pending', {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    if (!res.ok || !Array.isArray(res.data.data)) {
      throw new Error(JSON.stringify(res.data));
    }
    const found = res.data.data.find(p => p.id === pickupId);
    if (!found) throw new Error('Created pickup not found in available pickups list');
  });

  // 11. Driver claiming pickup
  await test('PUT /pickups/:id/assign (Driver claims pickup)', async () => {
    const res = await request(`/pickups/${pickupId}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: {}
    });
    if (!res.ok || res.data.data?.status !== 'scheduled') {
      throw new Error(JSON.stringify(res.data));
    }
  });

  // 12. Driver starting pickup
  await test('PUT /pickups/:id/start (Driver starts pickup)', async () => {
    const res = await request(`/pickups/${pickupId}/start`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    if (!res.ok || res.data.data?.status !== 'in_progress') {
      throw new Error(JSON.stringify(res.data));
    }
  });

  // 13. Driver completing pickup
  await test('PUT /pickups/:id/complete (Driver completes pickup)', async () => {
    const res = await request(`/pickups/${pickupId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    if (!res.ok || res.data.data?.status !== 'completed') {
      throw new Error(JSON.stringify(res.data));
    }
  });

  // 14. Rate pickup
  await test('POST /pickups/:id/rate', async () => {
    const res = await request(`/pickups/${pickupId}/rate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        rating: 5,
        feedback: 'Great and timely pickup!'
      }
    });
    if (!res.ok || res.data.data?.rating !== 5) throw new Error(JSON.stringify(res.data));
  });

  // 15. Upload photo
  await test('POST /pickups/:id/photo', async () => {
    const res = await request(`/pickups/${pickupId}/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {}
    });
    if (!res.ok || !res.data.data?.photoUrl) throw new Error(JSON.stringify(res.data));
  });

  // 16. Driver earnings
  await test('GET /driver/earnings', async () => {
    const res = await request('/driver/earnings', {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    if (!res.ok || typeof res.data.data?.totalEarnings !== 'number') {
      throw new Error(JSON.stringify(res.data));
    }
  });

  // 17. Payment creation
  await test('POST /payments/create', async () => {
    const res = await request('/payments/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        amount: 25.0,
        pickupId
      }
    });
    if (!res.ok || !res.data.data?.transactionId) throw new Error(JSON.stringify(res.data));
  });

  // 18. Admin stats & activities
  await test('GET /admin/stats and GET /admin/activities', async () => {
    const statsRes = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!statsRes.ok || typeof statsRes.data.data?.totalUsers !== 'number') {
      throw new Error(JSON.stringify(statsRes.data));
    }
    const actRes = await request('/admin/activities', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!actRes.ok || !Array.isArray(actRes.data.data)) {
      throw new Error(JSON.stringify(actRes.data));
    }
  });

  // 19. Admin pickups & drivers management
  await test('GET /admin/pickups and GET /admin/drivers', async () => {
    const pRes = await request('/admin/pickups', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!pRes.ok || !Array.isArray(pRes.data.data?.pickups)) {
      throw new Error(JSON.stringify(pRes.data));
    }
    const dRes = await request('/admin/drivers', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!dRes.ok || !Array.isArray(dRes.data.data?.drivers)) {
      throw new Error(JSON.stringify(dRes.data));
    }
  });

  // 20. Admin users management
  await test('GET /admin/users and PUT /admin/users/:id/activate', async () => {
    const uRes = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!uRes.ok || !Array.isArray(uRes.data.data?.users)) {
      throw new Error(JSON.stringify(uRes.data));
    }
    const actRes = await request(`/admin/users/${userId}/activate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!actRes.ok) throw new Error(JSON.stringify(actRes.data));
  });

  console.log(`\n=== TEST SUMMARY: ${20 - failures} PASSED, ${failures} FAILED ===\n`);
  if (failures > 0) process.exit(1);
}

runIntegrationTests();
