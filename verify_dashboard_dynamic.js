import axios from 'axios';

const baseUrl = 'http://localhost:3000/api';

// Simplified test for the API responses (requires user to provide a valid token)
async function test() {
    const token = 'YOUR_ADMIN_TOKEN_HERE'; // In a real environment, I would try to get this from a safe place or ask the user
    if (token === 'YOUR_ADMIN_TOKEN_HERE') {
        console.log('Skipping automated test: Please provide a valid Admin token to run this script.');
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Testing Dashboard Stats...');
        const statsRes = await axios.get(`${baseUrl}/dashboard/stats`, config);
        console.log('Dashboard Stats:', JSON.stringify(statsRes.data.data.overview, null, 2));
        console.log('Popular Services:', JSON.stringify(statsRes.data.data.popularServices, null, 2));

        console.log('\nTesting Order History...');
        const ordersRes = await axios.get(`${baseUrl}/orders/OrderHistory`, config);
        console.log('Total Orders from /OrderHistory:', ordersRes.data.data.length);

        if (statsRes.data.data.overview.orders === ordersRes.data.data.length) {
            console.log('\nSUCCESS: Dashboard count matches Order history count!');
        } else {
            console.log('\nFAILURE: Count mismatch. Dashboard:', statsRes.data.data.overview.orders, 'History:', ordersRes.data.data.length);
        }

    } catch (err) {
        console.error('Test failed:', err.response ? err.response.data : err.message);
    }
}

test();
