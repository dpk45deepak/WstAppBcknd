import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

async function testSocketRealtime() {
  console.log('=== VERIFYING REAL-TIME SOCKET.IO INTEGRATION ===\n');

  let socket = null;
  try {
    // 1. Connect socket
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
      socket.on('connect', () => {
        clearTimeout(timer);
        console.log('✅ Socket connected successfully! ID:', socket.id);
        resolve();
      });
      socket.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    // 2. Register user & get token
    const timestamp = Date.now();
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Socket Test User',
        email: `socket_user_${timestamp}@example.com`,
        password: 'password123',
        role: 'user'
      })
    });
    const authData = await registerRes.json();
    const token = authData.token;
    if (!token) throw new Error('Failed to register user for socket test');
    console.log('✅ User registered for socket test');

    // 3. Set up listener for pickup:update
    let receivedUpdate = null;
    const updatePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timed out waiting for pickup:update event')), 5000);
      socket.on('pickup:update', (data) => {
        clearTimeout(timer);
        console.log('✅ Received real-time pickup:update event! Status:', data.status, 'ID:', data.id || data._id);
        receivedUpdate = data;
        resolve(data);
      });
    });

    // 4. Create pickup via REST API
    const createRes = await fetch(`${BASE_URL}/pickups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        pickupDate: new Date().toISOString(),
        wasteType: 'general',
        quantity: 2,
        address: '456 Socket Test Way'
      })
    });
    const createData = await createRes.json();
    console.log('✅ Pickup created via REST API, waiting for broadcast...');

    // Wait for the websocket event
    await updatePromise;

    if (!receivedUpdate) {
      throw new Error('Did not receive broadcasted pickup data');
    }

    console.log('\n🎉 Real-time WebSocket verification SUCCESSFUL!\n');
    socket.close();
  } catch (error) {
    console.error('\n❌ Socket verification failed:', error.message);
    if (socket) socket.close();
    process.exit(1);
  }
}

testSocketRealtime();
