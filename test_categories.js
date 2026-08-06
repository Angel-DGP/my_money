const http = require('http');

const PORT = 3000;
let sessionId = '';
let userId = '';
let categoryId = '';

const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(sessionId ? { 'Cookie': `session_id=${sessionId}` } : {})
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = body;
        try { parsed = JSON.parse(body); } catch (e) {}
        
        // save cookie
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          const match = setCookie[0].match(/session_id=([^;]+)/);
          if (match) sessionId = match[1];
        }
        
        resolve({
          status: res.statusCode,
          data: parsed
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function run() {
  try {
    console.log('1. Login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'demo@mymoney.app',
      password: 'demo'
    });
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) throw new Error('Login failed');
    userId = loginRes.data.user.id;
    console.log('User ID:', userId);

    const authHeaders = { Authorization: `Bearer ${loginRes.data.token}` };

    const uniqueSuffix = Date.now();
    console.log('\n2. Create Category...');
    const createRes = await request('POST', '/api/api/v1/categories', {
      name: 'Custom Groceries ' + uniqueSuffix,
      type: 'EXPENSE',
      icon: 'shopping-cart',
      color: '#ff0000'
    }, authHeaders);
    console.log('Create Status:', createRes.status);
    console.dir(createRes.data, { depth: null });
    categoryId = createRes.data.data.id;

    console.log('\n3. Create Duplicate Category (Should fail with 409/400)...');
    const dupRes = await request('POST', '/api/api/v1/categories', {
      name: 'Custom Groceries ' + uniqueSuffix,
      type: 'EXPENSE',
      icon: 'shopping-cart',
      color: '#ff0000'
    }, authHeaders);
    console.log('Duplicate Create Status:', dupRes.status);
    console.dir(dupRes.data, { depth: null });

    console.log('\n4. Update Category...');
    const updateRes = await request('PATCH', `/api/api/v1/categories/${categoryId}`, {
      name: 'Updated Groceries ' + uniqueSuffix,
      icon: 'shopping-bag'
    }, authHeaders);
    console.log('Update Status:', updateRes.status);
    console.dir(updateRes.data, { depth: null });

    console.log('\n5. Create transaction for this category (to test deletion restriction)...');
    // First need an account
    const accRes = await request('POST', '/api/api/accounts', {
      name: 'Test Category Acc ' + uniqueSuffix,
      type: 'CHECKING',
      currency: 'USD',
      initial_balance: 100
    }, authHeaders);
    console.log('Account Status:', accRes.status);
    console.dir(accRes.data, { depth: null });
    const accId = accRes.data.data.id;
    
    const txRes = await request('POST', '/api/api/transactions', {
      account_id: accId,
      category_id: categoryId,
      type: 'EXPENSE',
      amount: 10,
      currency: 'USD',
      date: new Date().toISOString(),
      description: 'Test category tx'
    }, authHeaders);
    const txId = txRes.data.data.id;
    console.log('Transaction created:', txRes.status);

    console.log('\n6. Delete Category with transaction (Should fail with 409/400)...');
    const delFailRes = await request('DELETE', `/api/api/v1/categories/${categoryId}`, null, authHeaders);
    console.log('Delete (fail) Status:', delFailRes.status);
    console.dir(delFailRes.data, { depth: null });

    console.log('\n7. Delete transaction, then delete category...');
    await request('DELETE', `/api/api/transactions/${txId}`, null, authHeaders);
    // Since hasTransactionsIncludingDeleted includes deleted ones, we can't delete it.
    // Let's verify that.
    const delCatRes = await request('DELETE', `/api/api/v1/categories/${categoryId}`, null, authHeaders);
    console.log('Delete Category Status (after tx delete):', delCatRes.status);
    console.dir(delCatRes.data, { depth: null });

    console.log('\n8. List Categories...');
    const listRes = await request('GET', '/api/api/v1/categories', null, authHeaders);
    console.log('List Status:', listRes.status);
    console.log('Total Categories:', listRes.data.data.length);

    console.log('\nDone.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
