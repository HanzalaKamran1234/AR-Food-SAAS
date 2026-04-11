async function debug() {
  const res = await fetch('http://localhost:3000/api/upload/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: 'debug' })
  });
  console.log('API Response:', await res.json());
}
debug();
