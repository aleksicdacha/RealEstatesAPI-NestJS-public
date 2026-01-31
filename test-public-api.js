const http = require('http');

console.log('🧪 Testing Public Properties API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/v1/properties/public?clientTransactionType=seller&limit=5',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      console.log('📊 API Response:');
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Properties returned: ${response.items?.length || 0}`);
      console.log(`Total items: ${response.meta?.totalItems || 0}`);

      if (response.items && response.items.length > 0) {
        console.log('\n✅ SUCCESS! Properties found:');
        response.items.forEach((prop, index) => {
          console.log(`  ${index + 1}. ${prop.code} - ${prop.propertyType} - ${prop.price}€`);
        });
        console.log('\n🎉 User-web should now display properties!');
      } else {
        console.log('\n❌ No properties returned');
        console.log('💡 Run: ./scripts/fix-enum-values.sh');
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API request failed:', error.message);
  console.log('💡 Make sure API is running on port 3000');
});

req.end();
