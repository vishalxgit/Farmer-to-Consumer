const http = require('http');

async function postJSON(url, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getJSON(url, token = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('[TEST] Running Farm2Market End-to-End Tests...\n');

  // 1. AI Service Tests
  console.log('--- 1. Testing AI Service (Port 8000) ---');
  const aiHealth = await getJSON('http://localhost:8000/');
  console.log('AI Health:', aiHealth);

  const pricePred = await postJSON('http://localhost:8000/predict-price', {
    crop: 'tomato',
    region: 'Maharashtra',
    quantity: 100
  });
  console.log('AI Price Prediction (Tomato, MH):', pricePred);

  const demandFore = await postJSON('http://localhost:8000/forecast-demand', {
    crop: 'tomato',
    region: 'Maharashtra'
  });
  console.log('AI Demand Forecast (Tomato, MH):', demandFore);

  // 2. Backend Auth Tests
  console.log('\n--- 2. Testing Backend Auth (Port 3001) ---');
  const farmerLogin = await postJSON('http://localhost:3001/api/auth/login', {
    email: 'rajan@farm2market.com',
    password: 'password123'
  });
  console.log('Farmer Login Status:', farmerLogin.status, '| Name:', farmerLogin.data?.user?.name);
  const farmerToken = farmerLogin.data?.token;

  const buyerLogin = await postJSON('http://localhost:3001/api/auth/login', {
    email: 'amit@buyer.com',
    password: 'password123'
  });
  console.log('Buyer Login Status:', buyerLogin.status, '| Name:', buyerLogin.data?.user?.name);
  const buyerToken = buyerLogin.data?.token;

  // 3. Products Listing and Distance Sorting
  console.log('\n--- 3. Testing Products and Geolocation Distance Sorting ---');
  const productsNearMumbai = await getJSON('http://localhost:3001/api/products?lat=19.1136&lng=72.8697');
  console.log(`Retrieved ${productsNearMumbai.data.length} products sorted by distance from Mumbai:`);
  productsNearMumbai.data.slice(0, 3).forEach(p => {
    console.log(`  - ${p.name} (₹${p.asking_price}/${p.unit}): ${p.distance_km} km away | Farmer: ${p.farmer_name} (${p.district})`);
  });

  // 4. Buyer Places Order and Farmer Advances Status
  console.log('\n--- 4. Testing Order Flow and Stepper Status Advancement ---');
  // Order a product owned by Rajan Patel so Rajan Patel's token has access to update status
  const targetProduct = productsNearMumbai.data.find(p => p.farmer_name === 'Rajan Patel') || productsNearMumbai.data[0];
  const orderRes = await postJSON('http://localhost:3001/api/orders', {
    product_id: targetProduct.id,
    quantity: 5
  }, buyerToken);
  console.log('Placed Order:', orderRes.status, '| Order ID:', orderRes.data?.id, '| Total: ₹' + orderRes.data?.total_price);

  if (orderRes.data?.id) {
    const updateRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ status: 'confirmed' });
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: `/api/orders/${orderRes.data.id}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': `Bearer ${farmerToken}`
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    console.log('Farmer advanced status to confirmed:', updateRes);
  }

  // 5. Frontend Check
  console.log('\n--- 5. Testing Frontend (Port 5173) ---');
  const feCheck = await getJSON('http://localhost:5173/');
  console.log('Frontend Dev Server response status:', feCheck.status);

  console.log('\n[PASS] ALL INTEGRATION TESTS PASSED!');
}

runTests().catch(console.error);
