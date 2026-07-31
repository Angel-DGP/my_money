const http = require('http');

async function run() {
  console.log('--- Starting Categories Verification ---');
  
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

  // 2. List Categories (Initial - Should contain system categories)
  let res = await fetch('http://localhost:3000/api/v1/categories', {
    headers: { 'Cookie': cookie }
  });
  let body = await res.json();
  console.log(`\n2. List Categories Status: ${res.status}`);
  console.log(`   Categories count: ${body.data ? body.data.length : JSON.stringify(body)}`);

  // 3. Create Root Category
  res = await fetch('http://localhost:3000/api/v1/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      name: 'Custom Income',
      type: 'INCOME',
      color: '#10B981',
      icon: 'money'
    })
  });
  body = await res.json();
  console.log(`\n3. Create Root Category Status: ${res.status}`);
  console.log(`   Response: ${JSON.stringify(body)}`);
  
  if (res.status !== 201) {
    console.error('Create root category failed!');
    return;
  }
  
  const rootCategoryId = body.data.id;

  // 4. Create Subcategory
  res = await fetch('http://localhost:3000/api/v1/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      name: 'Freelance',
      type: 'INCOME', // Ignored by use case, inherited from parent
      parent_id: rootCategoryId,
      color: '#059669'
    })
  });
  body = await res.json();
  console.log(`\n4. Create Subcategory Status: ${res.status}`);
  console.log(`   Response: ${JSON.stringify(body)}`);

  // 5. Verify Hierarchy in List
  res = await fetch('http://localhost:3000/api/v1/categories', {
    headers: { 'Cookie': cookie }
  });
  body = await res.json();
  console.log(`\n5. Verify Hierarchy Status: ${res.status}`);
  const rootCategory = body.data.find(c => c.id === rootCategoryId);
  console.log(`   Custom Income has subcategories: ${rootCategory && rootCategory.subcategories.length > 0}`);

  // 6. Delete Subcategory
  const subcategoryId = body.data.find(c => c.id === rootCategoryId).subcategories[0].id;
  res = await fetch(`http://localhost:3000/api/v1/categories/${subcategoryId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookie }
  });
  console.log(`\n6. Delete Subcategory Status: ${res.status}`);

  // 7. Delete Root Category
  res = await fetch(`http://localhost:3000/api/v1/categories/${rootCategoryId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookie }
  });
  console.log(`\n7. Delete Root Category Status: ${res.status}`);

  console.log('\n--- Categories Verification Completed ---');
}

run().catch(console.error);
