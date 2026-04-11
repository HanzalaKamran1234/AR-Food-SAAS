async function test() {
  const res = await fetch('http://localhost:3000/api/upload/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: 'ar_saas/test' })
  });
  console.log(await res.text());
}
test();
