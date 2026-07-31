const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const loginOptions = {
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
  console.log('--- Advanced Transactions E2E Verification ---');
  
  try {
    // 0. Login
    const loginRes = await makeRequest(loginOptions, loginData);
    if (!loginRes.headers['set-cookie']) {
      throw new Error(`Login failed: ${loginRes.statusCode} - ${loginRes.body}`);
    }
    sessionCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('✅ Login successful');

    const headers = { 'Content-Type': 'application/json', 'Cookie': sessionCookie };

    // Create Account A
    const accARes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/accounts', method: 'POST', headers }, JSON.stringify({
      name: 'Acc A ' + Date.now(), type: 'CHECKING', currency: 'USD', initial_balance: '1000.00'
    }));
    if (accARes.statusCode !== 201) throw new Error(`Acc A creation failed: ${accARes.body}`);
    const accAId = JSON.parse(accARes.body).data?.id || JSON.parse(accARes.body).id;

    // Create Account B
    const accBRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/accounts', method: 'POST', headers }, JSON.stringify({
      name: 'Acc B ' + Date.now(), type: 'SAVINGS', currency: 'USD', initial_balance: '500.00'
    }));
    if (accBRes.statusCode !== 201) throw new Error(`Acc B creation failed: ${accBRes.body}`);
    const accBId = JSON.parse(accBRes.body).data?.id || JSON.parse(accBRes.body).id;

    console.log(`✅ Accounts created: A(${accAId}), B(${accBId})`);

    // Create Categories
    const catFoodRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/v1/categories', method: 'POST', headers }, JSON.stringify({ name: 'Food ' + Date.now(), type: 'EXPENSE' }));
    if (catFoodRes.statusCode !== 201) throw new Error(`Food cat creation failed: ${catFoodRes.body}`);
    const catFoodId = JSON.parse(catFoodRes.body).data?.id || JSON.parse(catFoodRes.body).id;

    const catTransportRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/v1/categories', method: 'POST', headers }, JSON.stringify({ name: 'Transport ' + Date.now(), type: 'EXPENSE' }));
    if (catTransportRes.statusCode !== 201) throw new Error(`Transport cat creation failed: ${catTransportRes.body}`);
    const catTransportId = JSON.parse(catTransportRes.body).data?.id || JSON.parse(catTransportRes.body).id;

    console.log(`✅ Categories created: Food(${catFoodId}), Transport(${catTransportId})`);

    const getBalance = (res) => {
      const parsed = JSON.parse(res.body);
      return parseFloat(parsed.data ? parsed.data.current_balance.value : parsed.current_balance.value);
    };

    // --- 1. TRANSFERENCIAS ---
    console.log('\n--- 1. Testing Transfers ---');
    const transferRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transfers', method: 'POST', headers }, JSON.stringify({
      source_account_id: accAId,
      destination_account_id: accBId,
      amount: '200.00',
      destination_amount: '200.00',
      date: new Date().toISOString().split('T')[0],
      description: 'Test Transfer'
    }));
    if (transferRes.statusCode !== 201) throw new Error(`Transfer failed: ${transferRes.body}`);
    console.log('✅ Transfer of 200 created');

    let checkA = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    let checkB = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accBId}`, method: 'GET', headers });
    if (getBalance(checkA) !== 800) throw new Error(`Acc A balance should be 800, got ${getBalance(checkA)}`);
    if (getBalance(checkB) !== 700) throw new Error(`Acc B balance should be 700, got ${getBalance(checkB)}`);
    console.log('✅ Balances updated correctly for Transfer (A=800, B=700)');

    const transferPairId = JSON.parse(transferRes.body).data?.transfer_pair_id || JSON.parse(transferRes.body).transfer_pair_id;

    const delTransferRes = await makeRequest({ hostname: 'localhost', port: 3000, path: `/transfers/${transferPairId}`, method: 'DELETE', headers });
    if (delTransferRes.statusCode !== 204) throw new Error(`Transfer deletion failed: ${delTransferRes.statusCode} - ${delTransferRes.body}`);
    console.log('✅ Transfer deleted');

    checkA = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    checkB = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accBId}`, method: 'GET', headers });
    if (getBalance(checkA) !== 1000) throw new Error('Acc A balance should be 1000');
    if (getBalance(checkB) !== 500) throw new Error('Acc B balance should be 500');
    console.log('✅ Balances restored correctly (A=1000, B=500)');


    // --- 2. ROLLBACK ---
    console.log('\n--- 2. Testing UoW Rollback ---');
    const rollbackRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transactions', method: 'POST', headers }, JSON.stringify({
      account_id: accAId,
      category_id: catFoodId,
      type: 'EXPENSE',
      amount: '500.00',
      date: new Date().toISOString().split('T')[0],
      description: 'SIMULATE_ROLLBACK' // This triggers the throw in the usecase
    }));
    if (rollbackRes.statusCode === 201) throw new Error('Rollback transaction should have failed');
    console.log(`✅ Transaction creation failed properly (Status: ${rollbackRes.statusCode})`);

    checkA = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    if (getBalance(checkA) !== 1000) throw new Error('Rollback failed to restore balance');
    console.log('✅ Rollback successful, balance is still 1000');


    // --- 3. EDITAR MONTO ---
    console.log('\n--- 3. Testing Edit Amount ---');
    const expRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transactions', method: 'POST', headers }, JSON.stringify({
      account_id: accAId, type: 'EXPENSE', amount: '100.00', category_id: catFoodId, date: new Date().toISOString().split('T')[0]
    }));
    const expId = JSON.parse(expRes.body).data?.id || JSON.parse(expRes.body).id;
    checkA = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    if (getBalance(checkA) !== 900) throw new Error('Balance should be 900');
    
    await makeRequest({ hostname: 'localhost', port: 3000, path: `/transactions/${expId}`, method: 'PATCH', headers }, JSON.stringify({ amount: '150.00' }));
    checkA = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    if (getBalance(checkA) !== 850) throw new Error(`Edit amount failed. Balance is ${getBalance(checkA)}, expected 850`);
    console.log('✅ Amount edited successfully, balance is correctly 850');


    // --- 4. CAMBIAR CATEGORIA ---
    console.log('\n--- 4. Testing Category Change ---');
    const updateCatRes = await makeRequest({ hostname: 'localhost', port: 3000, path: `/transactions/${expId}`, method: 'PATCH', headers }, JSON.stringify({ category_id: catTransportId }));
    if (updateCatRes.statusCode !== 200) throw new Error(`Update category failed: ${updateCatRes.statusCode} ${updateCatRes.body}`);
    const updateCatBody = JSON.parse(updateCatRes.body);
    const updatedCatId = updateCatBody.data?.category_id || updateCatBody.data?.categoryId || updateCatBody.category_id || updateCatBody.categoryId;
    if (updatedCatId !== catTransportId) throw new Error(`Category not updated. Got: ${JSON.stringify(updateCatBody.data)}`);
    console.log('✅ Category updated successfully to Transport');


    // --- 5. FUTURE DATE ---
    console.log('\n--- 5. Testing Future Date ---');
    const date6Days = new Date(); date6Days.setDate(date6Days.getDate() + 6);
    const date8Days = new Date(); date8Days.setDate(date8Days.getDate() + 8);

    const f6Res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transactions', method: 'POST', headers }, JSON.stringify({
      account_id: accAId, type: 'EXPENSE', amount: '10.00', date: date6Days.toISOString().split('T')[0]
    }));
    if (f6Res.statusCode !== 201) throw new Error(`Should allow +6 days, got ${f6Res.statusCode}`);
    console.log('✅ Allowed +6 days');

    const f8Res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transactions', method: 'POST', headers }, JSON.stringify({
      account_id: accAId, type: 'EXPENSE', amount: '10.00', date: date8Days.toISOString().split('T')[0]
    }));
    if (f8Res.statusCode === 201) throw new Error('Should NOT allow +8 days');
    console.log(`✅ Rejected +8 days as expected (Status: ${f8Res.statusCode})`);


    // --- 6. EDIT TRANSFER PAIR (PROHIBITED) ---
    console.log('\n--- 6. Testing Prohibited Transfer Edit ---');
    const transfer2Res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/transfers', method: 'POST', headers }, JSON.stringify({
      source_account_id: accAId, destination_account_id: accBId, amount: '50.00', destination_amount: '50.00', date: new Date().toISOString().split('T')[0]
    }));
    const transfer2ResBody = JSON.parse(transfer2Res.body);
    const srcTrans2Id = transfer2ResBody.data ? transfer2ResBody.data.source_transaction.id : transfer2ResBody.source_transaction.id;
    
    const patchTransferRes = await makeRequest({ hostname: 'localhost', port: 3000, path: `/transactions/${srcTrans2Id}`, method: 'PATCH', headers }, JSON.stringify({ amount: '100.00' }));
    if (patchTransferRes.statusCode === 200 || patchTransferRes.statusCode === 204) throw new Error('Should NOT allow editing individual transfer transaction amount');
    console.log(`✅ Prevented editing individual transfer transaction (Status: ${patchTransferRes.statusCode})`);


    // --- 7. IDEMPOTENCIA DEL DELETE ---
    console.log('\n--- 7. Testing Delete Idempotency ---');
    const del1 = await makeRequest({ hostname: 'localhost', port: 3000, path: `/transactions/${expId}`, method: 'DELETE', headers });
    if (del1.statusCode !== 204) throw new Error('First delete failed');
    
    const checkA_postDel1 = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    const balancePostDel1 = getBalance(checkA_postDel1);
    
    const del2 = await makeRequest({ hostname: 'localhost', port: 3000, path: `/transactions/${expId}`, method: 'DELETE', headers });
    console.log(`✅ Second delete returned status: ${del2.statusCode}`);

    const checkA_postDel2 = await makeRequest({ hostname: 'localhost', port: 3000, path: `/accounts/${accAId}`, method: 'GET', headers });
    const balancePostDel2 = getBalance(checkA_postDel2);

    if (balancePostDel1 !== balancePostDel2) throw new Error('Second delete modified the balance!');
    console.log('✅ Delete is idempotent and protects balance');

    console.log('\n🏆 ALL ADVANCED CHECKS PASSED');

  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

run();
