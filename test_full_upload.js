const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dyj6ieksp',
  api_key: '763664419995717',
  api_secret: 'NqYFZWxWgNlCMzJycmfAFQ4uCpE',
  secure: true
});

async function testUpload() {
  try {
    fs.writeFileSync('test_upload.txt', 'hello world');
    const result = await cloudinary.uploader.upload('test_upload.txt', {
      folder: 'ar_saas/test_node',
      resource_type: 'auto'
    });
    console.log('Upload successful:', result.secure_url);
    console.log('Cloud Name used:', result.cloud_name || 'dyj6ieksp'); // result usually doesn't return cloud_name but we can infer
  } catch (error) {
    console.error('Upload Failed:', error.message);
  }
}

testUpload();
