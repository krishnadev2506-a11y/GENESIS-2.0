async function test() {
  try {
    const res = await fetch('https://genesis-rouge.vercel.app/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'krishnadev2506@gmail.com',
        password: 'AdminPassword123!'
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Body:', data);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
