const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const loginData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123',
});

let sessionCookie = '';

async function run() {
  console.log('--- Transactions E2E Verification ---');
  
  try {
    // 1. Login
    const loginRes = await makeRequest(options, loginData);
    if (!loginRes.headers['set-cookie']) {
      throw new Error(`Login failed: ${loginRes.statusCode} - ${loginRes.body}`);
    }
    sessionCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('✅ Login successful');

    // 2. Create Account
    const accountRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/accounts',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie }
    }, JSON.stringify({
      name: 'Transaction Test Account ' + Date.now(),
      type: 'CHECKING',
      currency: 'USD',
      initial_balance: '1000.00'
    }));
    
    if (accountRes.statusCode !== 201) throw new Error(`Account creation failed: ${accountRes.body}`);
    const accountBody = JSON.parse(accountRes.body);
    const accountId = accountBody.data ? accountBody.data.id : accountBody.id;
    console.log('✅ Account created:', accountId);

    // 3. Create Category
    const categoryRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/categories',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie }
    }, JSON.stringify({
      name: 'Groceries',
      type: 'EXPENSE'
    }));

    if (categoryRes.statusCode !== 201) throw new Error(`Category creation failed: ${categoryRes.body}`);
    const categoryBody = JSON.parse(categoryRes.body);
    const categoryId = categoryBody.data ? categoryBody.data.id : categoryBody.id;
    console.log('✅ Category created:', categoryId);

    // 4. Create Transaction
    const transactionRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/transactions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie }
    }, JSON.stringify({
      account_id: accountId,
      category_id: categoryId,
      type: 'EXPENSE',
      amount: '50.00',
      date: new Date().toISOString().split('T')[0],
      description: 'Supermarket'
    }));

    if (transactionRes.statusCode !== 201) throw new Error(`Transaction creation failed: ${transactionRes.body}`);
    const transactionBody = JSON.parse(transactionRes.body);
    const transactionId = transactionBody.data ? transactionBody.data.id : transactionBody.id;
    console.log('✅ Transaction created:', transactionId);

    // 5. Verify Account Balance
    const accountCheckRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/accounts/${accountId}`,
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    const accountCheckBody = JSON.parse(accountCheckRes.body);
    const balance = accountCheckBody.data ? accountCheckBody.data.current_balance.value : accountCheckBody.current_balance.value;
    if (parseFloat(balance) !== 950) throw new Error(`Balance incorrect: ${balance}`);
    console.log('✅ Account balance decreased to 950');

    // 6. Delete Transaction
    const deleteRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/transactions/${transactionId}`,
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });
    if (deleteRes.statusCode !== 204) throw new Error('Transaction delete failed');
    console.log('✅ Transaction soft deleted');

    // 7. Verify Account Balance Restored
    const accountCheckRes2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/accounts/${accountId}`,
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    const accountCheckBody2 = JSON.parse(accountCheckRes2.body);
    const balance2 = accountCheckBody2.data ? accountCheckBody2.data.current_balance.value : accountCheckBody2.current_balance.value;
    if (parseFloat(balance2) !== 1000) throw new Error(`Balance not restored: ${balance2}`);
    console.log('✅ Account balance restored to 1000');
    
    console.log('\n✅ All transaction checks passed.');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

function makeRequest(opts, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

run();
