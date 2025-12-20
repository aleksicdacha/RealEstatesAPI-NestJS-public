// Simple test script to check if the upload endpoint is working
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Create a simple test image buffer (1x1 pixel red PNG)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64'
);

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('files', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const response = await fetch('http://localhost:3000/upload?propertyCode=TEST001', {
      method: 'POST',
      body: formData
    });

    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpload();