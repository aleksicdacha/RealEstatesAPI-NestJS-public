#!/usr/bin/env node

const http = require('http');

// Test data
const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('🧪 Testing login endpoint...');
console.log(`📡 Sending request to: http://localhost:3000/v1/auth/login`);

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📨 Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.access_token) {
        console.log('\n✅ LOGIN SUCCESSFUL! JWT token received.');
        console.log(`🔑 Token length: ${jsonData.access_token.length} characters`);
      } else {
        console.log('\n❌ Login failed - no token received');
      }
    } catch (e) {
      console.log('Raw response:', data);
      console.log('❌ Failed to parse JSON response');
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Request error: ${err.message}`);
  console.log('💡 Make sure the server is running on http://localhost:3000');
});

req.write(loginData);
req.end();
