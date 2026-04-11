const crypto = require('crypto');

async function simulateBrowserUpload() {
  const cloudName = 'dyj6ieksp';
  const apiKey = '763664419995717';
  const apiSecret = 'NqYFZWxWgNlCMzJycmfAFQ4uCpE';
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'ar_saas/debug';
  
  // Calculate signature (alphabetical order of params)
  const signatureStr = older=&timestamp=;
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const url = https://api.cloudinary.com/v1_1//image/upload;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

simulateBrowserUpload();
