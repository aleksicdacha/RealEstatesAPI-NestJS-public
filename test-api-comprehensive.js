#!/usr/bin/env node

const http = require('http');

// First, login to get token
const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 COMPREHENSIVE API TESTING');
  console.log('==============================\n');

  try {
    // 1. Test Login
    console.log('1. 🔐 Testing Login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.statusCode === 200 && loginResponse.data.accessToken) {
      console.log('   ✅ Login successful!');
      console.log(`   🔑 Token: ${loginResponse.data.accessToken.substring(0, 30)}...`);
      console.log(`   👤 User: ${loginResponse.data.user.username} (${loginResponse.data.user.role})\n`);
      
      const token = loginResponse.data.accessToken;

      // 2. Test Properties endpoint
      console.log('2. 🏠 Testing Properties List...');
      const propertiesOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/properties',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const propertiesResponse = await makeRequest(propertiesOptions);
      
      if (propertiesResponse.statusCode === 200) {
        console.log(`   ✅ Properties retrieved successfully!`);
        console.log(`   📊 Found ${propertiesResponse.data.data?.length || 0} properties`);
        console.log(`   📄 Total pages: ${propertiesResponse.data.totalPages || 'N/A'}\n`);
      } else {
        console.log(`   ❌ Properties request failed: ${propertiesResponse.statusCode}\n`);
      }

      // 3. Test Users endpoint
      console.log('3. 👥 Testing Users List...');
      const usersOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const usersResponse = await makeRequest(usersOptions);
      
      if (usersResponse.statusCode === 200) {
        console.log(`   ✅ Users retrieved successfully!`);
        console.log(`   👤 Found ${usersResponse.data.length || 0} users\n`);
      } else {
        console.log(`   ❌ Users request failed: ${usersResponse.statusCode}\n`);
      }

      // 4. Test Clients endpoint
      console.log('4. 🤝 Testing Clients List...');
      const clientsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/clients',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const clientsResponse = await makeRequest(clientsOptions);
      
      if (clientsResponse.statusCode === 200) {
        console.log(`   ✅ Clients retrieved successfully!`);
        console.log(`   🤝 Found ${clientsResponse.data.data?.length || 0} clients`);
        console.log(`   📄 Total pages: ${clientsResponse.data.totalPages || 'N/A'}\n`);
      } else {
        console.log(`   ❌ Clients request failed: ${clientsResponse.statusCode}\n`);
      }

    } else {
      console.log('   ❌ Login failed!');
      console.log(`   Status: ${loginResponse.statusCode}`);
      console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}\n`);
    }

    console.log('🎉 API Testing Complete!');
    console.log('========================\n');

  } catch (error) {
    console.error(`❌ Test error: ${error.message}`);
    console.log('💡 Make sure the server is running on http://localhost:3000');
  }
}

testAPI();
