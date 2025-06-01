// Simple script to update user to admin status
// This will directly update the database through the API

// const fetch = require('node-fetch'); // Используем встроенный fetch

async function updateUserToAdmin() {
    const baseURL = 'http://localhost:3001/api';
    
    try {
        // First, login with the created admin user
        console.log('1. Logging in as admin...');
        const loginResponse = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@himkaplastic.ru',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        const userId = loginData.user.id;
        
        console.log('✅ Logged in successfully');
        console.log('User ID:', userId);
        console.log('Current admin status:', loginData.user.isAdmin);        // Test admin access instead of profile update
        console.log('\n2. Testing admin analytics access...');
        const analyticsResponse = await fetch(`${baseURL}/admin/analytics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log('✅ Admin analytics access successful');
            console.log('Analytics data:', JSON.stringify(analyticsData, null, 2));
        } else {
            console.log('❌ Admin analytics access failed:', analyticsResponse.status);
        }

        // Test admin stats
        console.log('\n3. Testing admin stats access...');
        const statsResponse = await fetch(`${baseURL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Admin stats access successful');
            console.log('Stats data:', JSON.stringify(statsData, null, 2));
        } else {
            console.log('❌ Admin stats access failed:', statsResponse.status);
        }        // Test market rates (public endpoint)
        console.log('\n4. Testing market rates access...');
        const marketRatesResponse = await fetch(`${baseURL}/market-rates`);

        if (marketRatesResponse.ok) {
            const ratesData = await marketRatesResponse.json();
            console.log('✅ Market rates access successful');
            console.log('Market rates:', JSON.stringify(ratesData, null, 2));
        } else {
            console.log('❌ Market rates access failed:', marketRatesResponse.status);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
updateUserToAdmin();
