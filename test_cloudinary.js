const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: 'dyj6ieksp',
  api_key: '567797338593617',
  api_secret: '_XtmTfwwV0VjLCepM6lO0x0KbLU',
  secure: true
});

const timestamp = Math.round(new Date().getTime() / 1000);
const folder = 'ar_saas/test';
const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, '_XtmTfwwV0VjLCepM6lO0x0KbLU');

async function testUpload() {
  const FormData = require('form-data');
  const fs = require('fs');
  fs.writeFileSync('test.txt', 'test content');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('test.txt'));
  form.append('api_key', '567797338593617');
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', folder);

  const url = 'https://api.cloudinary.com/v1_1/dyj6ieksp/auto/upload';
  console.log('Sending to URL:', url);
  
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(url, { method: 'POST', body: form });
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Body:', text);
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

testUpload();
