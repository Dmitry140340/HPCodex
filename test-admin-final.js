/**
 * Simple admin user test script for HimkaPlastic EcoTrack
 * Tests admin user creation and login functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAdminUser() {
  console.log('🧪 Testing HimkaPlastic EcoTrack Admin Functionality...\n');

  try {
    // Test 1: Check server status
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running on port 3001');
      console.log('   Please start the backend server first');
      return;
    }

    // Test 2: Create admin user
    console.log('\n2. Creating admin user...');
    const adminData = {
      email: 'admin@himkaplastic.ru',
      password: 'admin123',
      name: 'Administrator',
      companyName: 'HimkaPlastic LLC'
    };

    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, adminData);
      console.log('✅ Admin user created successfully');
      console.log(`   User ID: ${signupResponse.data.user?.id}`);
      console.log(`   Is Admin: ${signupResponse.data.user?.isAdmin}`);
      console.log(`   Role: ${signupResponse.data.user?.role}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Admin user already exists');
      } else {
        console.log('❌ Failed to create admin user:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Login as admin
    console.log('\n3. Testing admin login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@himkaplastic.ru',
        password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      
      console.log('✅ Admin login successful');
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`   Admin Status: ${user.isAdmin}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Token: ${token ? 'Generated' : 'Not generated'}`);

      // Test 4: Access admin endpoints
      console.log('\n4. Testing admin endpoints access...');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const analyticsResponse = await axios.get(`${BASE_URL}/admin/analytics`, { headers });
        console.log('✅ Admin analytics endpoint accessible');
        console.log(`   Analytics data: ${JSON.stringify(analyticsResponse.data).substring(0, 100)}...`);
      } catch (error) {
        console.log('❌ Admin analytics endpoint failed:', error.response?.data?.message || error.message);
      }

      try {
        const statsResponse = await axios.get(`${BASE_URL}/admin/stats`, { headers });
        console.log('✅ Admin stats endpoint accessible');
        console.log(`   Stats data: ${JSON.stringify(statsResponse.data).substring(0, 100)}...`);
      } catch (error) {
        console.log('❌ Admin stats endpoint failed:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Test market rates endpoint (public)
    console.log('\n5. Testing public endpoints...');
    try {
      const marketRatesResponse = await axios.get(`${BASE_URL}/market-rates`);
      console.log('✅ Market rates endpoint accessible');
      console.log(`   Market rates: ${JSON.stringify(marketRatesResponse.data).substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Market rates endpoint failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Admin functionality test completed!');
}

// Run the test
testAdminUser();
