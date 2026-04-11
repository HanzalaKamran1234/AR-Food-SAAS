const crypto = require('crypto');

async function simulateBrowserUpload() {
  const cloudName = 'dyj6ieksp';
  const apiKey = '763664419995717';
  const apiSecret = 'NqYFZWxWgNlCMzJycmfAFQ4uCpE';
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'ar_saas/debug';
  
  // Signature params must be in alphabetical order
  // folder, timestamp
  const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

  console.log('--- Simulation Parameters ---');
  console.log('Cloud Name:', cloudName);
  console.log('API Key:', apiKey);
  console.log('Timestamp:', timestamp);
  console.log('Signature:', signature);
  console.log('-----------------------------');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const body = new URLSearchParams();
    body.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    body.append('api_key', apiKey);
    body.append('timestamp', timestamp);
    body.append('signature', signature);
    body.append('folder', folder);

    const res = await fetch(url, {
      method: 'POST',
      body: body
    });
    console.log('Status:', res.status);
    const responseBody = await res.text();
    console.log('Body:', responseBody);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

simulateBrowserUpload();
