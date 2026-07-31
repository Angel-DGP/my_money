const http = require('http');

async function run() {
  console.log('--- Starting E2E Verification ---');
  
  // 1. Login
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@mymoney.local' })
  });
  
  console.log(`\n1. Login Status: ${loginRes.status}`);
  const setCookie = loginRes.headers.get('set-cookie');
  console.log(`   Set-Cookie Header: ${setCookie}`);
  
  const cookie = setCookie.split(';')[0];
  
  // 2. Get Me (with cookie)
  const meRes = await fetch('http://localhost:3000/users/me', {
    headers: { 'Cookie': cookie }
  });
  console.log(`\n2. Get /users/me (Authenticated) Status: ${meRes.status}`);
  const meBody = await meRes.json();
  console.log(`   User Email: ${meBody.email}`);

  // 3. Logout
  const logoutRes = await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    headers: { 'Cookie': cookie }
  });
  console.log(`\n3. Logout Status: ${logoutRes.status}`);
  console.log(`   Set-Cookie Header (Clear): ${logoutRes.headers.get('set-cookie')}`);
  
  // 4. Get Me (Logged out)
  const meRes2 = await fetch('http://localhost:3000/users/me', {
    headers: { 'Cookie': cookie }
  }); // Using old cookie, but it's revoked in DB
  console.log(`\n4. Get /users/me (After Logout) Status: ${meRes2.status}`);
  const meBody2 = await meRes2.json();
  console.log(`   Response: ${JSON.stringify(meBody2)}`);
  
  console.log('\n--- E2E Verification Completed ---');
}

run().catch(console.error);
