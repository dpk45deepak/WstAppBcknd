import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testBackend() {
    try {
        console.log('Testing Backend...');

        // 1. Health Check
        try {
            const health = await axios.get(`${BASE_URL}`);
            console.log('✅ Health Check:', health.data.message);
        } catch (e) {
            console.error('❌ Health Check Failed:', e.message);
            return;
        }

        // 2. Register User
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        let userId = '';

        try {
            const register = await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test User',
                email,
                password,
                role: 'user'
            });
            console.log('✅ Register User:', register.data.message);
            token = register.data.data.token;
            userId = register.data.data.user.id;
        } catch (e) {
            console.error('❌ Register User Failed:', e.response?.data || e.message);
            return;
        }

        // 3. Create Pickup
        let pickupId = '';
        try {
            const pickup = await axios.post(`${BASE_URL}/pickup`, {
                pickupDate: new Date().toISOString(),
                wasteType: 'general',
                quantity: 5,
                pickupAddress: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'TS',
                    zipCode: '12345',
                    coordinates: { lat: 10, lng: 10 }
                },
                notes: 'Test pickup'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Create Pickup:', pickup.data.message);
            pickupId = pickup.data.data._id;
        } catch (e) {
            console.error('❌ Create Pickup Failed:', e.response?.data || e.message);
        }

        // 4. Get My Pickups
        try {
            const myPickups = await axios.get(`${BASE_URL}/pickups/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Get My Pickups:', myPickups.data.data.length > 0 ? 'Found' : 'Empty');
        } catch (e) {
            console.error('❌ Get My Pickups Failed:', e.response?.data || e.message);
        }

        // 5. Estimate Price
        try {
            const estimate = await axios.post(`${BASE_URL}/pickups/estimate`, {
                quantity: 10
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Estimate Price:', estimate.data.data.price);
        } catch (e) {
            console.error('❌ Estimate Price Failed:', e.response?.data || e.message);
        }

        console.log('Backend Verification Complete.');

    } catch (error) {
        console.error('Unexpected Error:', error);
    }
}

testBackend();
