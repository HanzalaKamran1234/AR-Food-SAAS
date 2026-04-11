const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dyj6ieksp',
  api_key: '763664419995717',
  api_secret: 'NqYFZWxWgNlCMzJycmfAFQ4uCpE',
  secure: true
});

async function testCredentials() {
  try {
    const result = await cloudinary.api.ping();
    console.log('Ping successful:', result);
    
    // Get account info to verify cloud name / api key association
    // Note: Some trial accounts might not have access to some admin APIs, 
    // but ping should work if credentials are valid.
  } catch (error) {
    console.error('Cloudinary Test Error:', error.message);
    if (error.http_code) console.log('HTTP Code:', error.http_code);
  }
}

testCredentials();
