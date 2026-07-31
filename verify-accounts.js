const http = require('http');

async function run() {
  console.log('--- Starting Accounts Verification ---');
  
  // 1. Login
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@mymoney.local' })
  });
  
  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    console.error('Login failed! No cookie received.');
    return;
  }
  
  const cookie = setCookie.split(';')[0];
  console.log('1. Login successful');

  // 2. List Accounts (Initial)
  let res = await fetch('http://localhost:3000/accounts', {
    headers: { 'Cookie': cookie }
  });
  let body = await res.json();
  console.log(`\n2. List Accounts Status: ${res.status}`);
  console.log(`   Accounts count: ${body.data ? body.data.length : JSON.stringify(body)}`);

  // 3. Create Account
  res = await fetch('http://localhost:3000/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      name: 'Checking Account',
      type: 'CHECKING',
      currency: 'USD',
      initial_balance: '1500.00',
      color: '#10B981',
      icon: 'bank'
    })
  });
  body = await res.json();
  console.log(`\n3. Create Account Status: ${res.status}`);
  console.log(`   Response: ${JSON.stringify(body)}`);
  
  if (res.status !== 201) {
    console.error('Create account failed!');
    return;
  }
  
  const accountId = body.id;

  // 4. Update Account
  res = await fetch(`http://localhost:3000/accounts/${accountId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      name: 'Main Checking Account',
      color: '#059669'
    })
  });
  body = await res.json();
  console.log(`\n4. Update Account Status: ${res.status}`);
  console.log(`   Response: ${JSON.stringify(body)}`);

  // 5. Get Account
  res = await fetch(`http://localhost:3000/accounts/${accountId}`, {
    headers: { 'Cookie': cookie }
  });
  body = await res.json();
  console.log(`\n5. Get Account Status: ${res.status}`);
  console.log(`   Account Name: ${body.name}`);

  // 6. Delete (Archive) Account
  res = await fetch(`http://localhost:3000/accounts/${accountId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookie }
  });
  console.log(`\n6. Delete Account Status: ${res.status}`);
  
  // 7. Verify deletion (Should not be in list)
  res = await fetch('http://localhost:3000/accounts', {
    headers: { 'Cookie': cookie }
  });
  body = await res.json();
  console.log(`\n7. Verify Deletion Status: ${res.status}`);
  const exists = body.data && body.data.some(a => a.id === accountId);
  console.log(`   Account still exists in list: ${exists}`);

  console.log('\n--- Accounts Verification Completed ---');
}

run().catch(console.error);
