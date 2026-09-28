/**
 * Farm2Market Seed Script
 * Run: node --experimental-sqlite seed.js
 * Populates the database with realistic Indian farmer/buyer/product/order data.
 */

const bcrypt = require('bcryptjs');
const db = require('./src/db');

console.log('[SEED] Starting database seed...');

// Clear existing data
db.exec(`
  DELETE FROM orders;
  DELETE FROM products;
  DELETE FROM users;
`);

const password_hash = bcrypt.hashSync('password123', 10);

// --- FARMERS ----------------------------------------------------------------
const farmers = [
  { name: 'Rajan Patel',      email: 'rajan@farm2market.com',    phone: '9876543210', village: 'Baramati',    district: 'Pune',       state: 'Maharashtra', lat: 18.1518, lng: 74.5813 },
  { name: 'Sukhwinder Singh', email: 'sukh@farm2market.com',     phone: '9876543211', village: 'Malerkotla',  district: 'Ludhiana',   state: 'Punjab',      lat: 30.5291, lng: 75.8849 },
  { name: 'Lakshmi Devi',     email: 'lakshmi@farm2market.com',  phone: '9876543212', village: 'Nanjangud',   district: 'Mysuru',     state: 'Karnataka',   lat: 12.1150, lng: 76.6853 },
  { name: 'Harpreet Kaur',    email: 'harpreet@farm2market.com', phone: '9876543213', village: 'Tarn Taran',  district: 'Amritsar',   state: 'Punjab',      lat: 31.4518, lng: 74.9285 },
  { name: 'Govind Reddy',     email: 'govind@farm2market.com',   phone: '9876543214', village: 'Bailhongal',  district: 'Belgaum',    state: 'Karnataka',   lat: 15.8221, lng: 74.8620 },
  { name: 'Meena Sharma',     email: 'meena@farm2market.com',    phone: '9876543215', village: 'Wardha',      district: 'Nagpur',     state: 'Maharashtra', lat: 20.7453, lng: 78.5998 },
  { name: 'Balwant Singh',    email: 'balwant@farm2market.com',  phone: '9876543216', village: 'Rajpura',     district: 'Patiala',    state: 'Punjab',      lat: 30.4832, lng: 76.5902 },
  { name: 'Kaveri Nair',      email: 'kaveri@farm2market.com',   phone: '9876543217', village: 'Dharwad',     district: 'Hubli',      state: 'Karnataka',   lat: 15.4589, lng: 75.0078 },
];

const farmerInsert = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, phone, village, district, state, lat, lng)
  VALUES (?, ?, ?, 'farmer', ?, ?, ?, ?, ?, ?)
`);

const farmerIds = [];
for (const f of farmers) {
  const r = farmerInsert.run(f.name, f.email, password_hash, f.phone, f.village, f.district, f.state, f.lat, f.lng);
  farmerIds.push(Number(r.lastInsertRowid));
}
console.log(`[OK] Inserted ${farmerIds.length} farmers`);

// --- BUYERS -----------------------------------------------------------------
const buyers = [
  { name: 'Amit Khanna',  email: 'amit@buyer.com',  phone: '9988776655', village: 'Andheri',    district: 'Mumbai',    state: 'Maharashtra', lat: 19.1136, lng: 72.8697 },
  { name: 'Priya Mehta',  email: 'priya@buyer.com', phone: '9988776656', village: 'Koramangala', district: 'Bangalore', state: 'Karnataka',   lat: 12.9352, lng: 77.6245 },
  { name: 'Rohit Joshi',  email: 'rohit@buyer.com', phone: '9988776657', village: 'Gurugram',    district: 'Gurugram',  state: 'Haryana',     lat: 28.4595, lng: 77.0266 },
  { name: 'Deepa Iyer',   email: 'deepa@buyer.com', phone: '9988776658', village: 'Kothrud',     district: 'Pune',      state: 'Maharashtra', lat: 18.5089, lng: 73.8078 },
];

const buyerInsert = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, phone, village, district, state, lat, lng)
  VALUES (?, ?, ?, 'buyer', ?, ?, ?, ?, ?, ?)
`);

const buyerIds = [];
for (const b of buyers) {
  const r = buyerInsert.run(b.name, b.email, password_hash, b.phone, b.village, b.district, b.state, b.lat, b.lng);
  buyerIds.push(Number(r.lastInsertRowid));
}
console.log(`[OK] Inserted ${buyerIds.length} buyers`);

// --- PRODUCTS ----------------------------------------------------------------
const products = [
  // Rajan Patel (Maharashtra, Pune)
  { farmer: 0, name: 'Tomato',      category: 'vegetables', quantity: 200,  unit: 'kg', asking_price: 18,  ai_price: 20,  mandi_price: 22,  harvest_date: '2026-08-25', photo_url: 'https://images.unsplash.com/photo-1561136594-7f68af7bf1ec?w=400' },
  { farmer: 0, name: 'Onion',       category: 'vegetables', quantity: 500,  unit: 'kg', asking_price: 22,  ai_price: 24,  mandi_price: 26,  harvest_date: '2026-08-20', photo_url: 'https://images.unsplash.com/photo-1618512496248-a4dd43b8a6df?w=400' },
  // Sukhwinder Singh (Punjab, Ludhiana)
  { farmer: 1, name: 'Wheat',       category: 'grains',     quantity: 1000, unit: 'kg', asking_price: 21,  ai_price: 22,  mandi_price: 23,  harvest_date: '2026-07-10', photo_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
  { farmer: 1, name: 'Rice',        category: 'grains',     quantity: 800,  unit: 'kg', asking_price: 28,  ai_price: 30,  mandi_price: 31,  harvest_date: '2026-08-15', photo_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { farmer: 1, name: 'Potato',      category: 'vegetables', quantity: 300,  unit: 'kg', asking_price: 11,  ai_price: 12,  mandi_price: 13,  harvest_date: '2026-08-28', photo_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
  // Lakshmi Devi (Karnataka, Mysuru)
  { farmer: 2, name: 'Brinjal',     category: 'vegetables', quantity: 150,  unit: 'kg', asking_price: 16,  ai_price: 17,  mandi_price: 18,  harvest_date: '2026-08-22', photo_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400' },
  { farmer: 2, name: 'Mango',       category: 'fruits',     quantity: 100,  unit: 'kg', asking_price: 55,  ai_price: 60,  mandi_price: 65,  harvest_date: '2026-05-15', photo_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400' },
  // Harpreet Kaur (Punjab, Amritsar)
  { farmer: 3, name: 'Cauliflower', category: 'vegetables', quantity: 120,  unit: 'kg', asking_price: 19,  ai_price: 21,  mandi_price: 23,  harvest_date: '2026-08-18', photo_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400' },
  { farmer: 3, name: 'Wheat',       category: 'grains',     quantity: 600,  unit: 'kg', asking_price: 20,  ai_price: 22,  mandi_price: 23,  harvest_date: '2026-07-05', photo_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
  // Govind Reddy (Karnataka, Belgaum)
  { farmer: 4, name: 'Tomato',      category: 'vegetables', quantity: 250,  unit: 'kg', asking_price: 17,  ai_price: 19,  mandi_price: 21,  harvest_date: '2026-08-24', photo_url: 'https://images.unsplash.com/photo-1561136594-7f68af7bf1ec?w=400' },
  { farmer: 4, name: 'Onion',       category: 'vegetables', quantity: 400,  unit: 'kg', asking_price: 20,  ai_price: 22,  mandi_price: 24,  harvest_date: '2026-08-17', photo_url: 'https://images.unsplash.com/photo-1618512496248-a4dd43b8a6df?w=400' },
  // Meena Sharma (Maharashtra, Nagpur)
  { farmer: 5, name: 'Brinjal',     category: 'vegetables', quantity: 180,  unit: 'kg', asking_price: 15,  ai_price: 17,  mandi_price: 19,  harvest_date: '2026-08-26', photo_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400' },
  { farmer: 5, name: 'Cauliflower', category: 'vegetables', quantity: 90,   unit: 'kg', asking_price: 20,  ai_price: 22,  mandi_price: 24,  harvest_date: '2026-08-20', photo_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400' },
  // Balwant Singh (Punjab, Patiala)
  { farmer: 6, name: 'Rice',        category: 'grains',     quantity: 1200, unit: 'kg', asking_price: 27,  ai_price: 30,  mandi_price: 31,  harvest_date: '2026-08-12', photo_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { farmer: 6, name: 'Potato',      category: 'vegetables', quantity: 500,  unit: 'kg', asking_price: 10,  ai_price: 12,  mandi_price: 13,  harvest_date: '2026-08-27', photo_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
  // Kaveri Nair (Karnataka, Hubli)
  { farmer: 7, name: 'Mango',       category: 'fruits',     quantity: 80,   unit: 'kg', asking_price: 52,  ai_price: 57,  mandi_price: 62,  harvest_date: '2026-05-20', photo_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400' },
  { farmer: 7, name: 'Tomato',      category: 'vegetables', quantity: 160,  unit: 'kg', asking_price: 16,  ai_price: 18,  mandi_price: 20,  harvest_date: '2026-08-23', photo_url: 'https://images.unsplash.com/photo-1561136594-7f68af7bf1ec?w=400' },
  { farmer: 7, name: 'Brinjal',     category: 'vegetables', quantity: 100,  unit: 'kg', asking_price: 14,  ai_price: 16,  mandi_price: 18,  harvest_date: '2026-08-25', photo_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400' },
];

const productInsert = db.prepare(`
  INSERT INTO products (farmer_id, name, category, quantity, unit, asking_price, ai_price, mandi_price, harvest_date, photo_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const productIds = [];
for (const p of products) {
  const r = productInsert.run(
    farmerIds[p.farmer], p.name, p.category, p.quantity, p.unit,
    p.asking_price, p.ai_price, p.mandi_price, p.harvest_date, p.photo_url || null
  );
  productIds.push(Number(r.lastInsertRowid));
}
console.log(`[OK] Inserted ${productIds.length} products`);

// --- ORDERS ------------------------------------------------------------------
const orderData = [
  { buyer: 0, product: 0,  quantity: 20,  status: 'delivered',        created_at: '2026-08-20 10:00:00' },
  { buyer: 1, product: 2,  quantity: 50,  status: 'out_for_delivery', created_at: '2026-08-25 11:00:00' },
  { buyer: 3, product: 1,  quantity: 30,  status: 'confirmed',        created_at: '2026-08-27 09:00:00' },
  { buyer: 0, product: 5,  quantity: 15,  status: 'confirmed',        created_at: '2026-08-28 14:00:00' },
  { buyer: 2, product: 3,  quantity: 100, status: 'placed',           created_at: '2026-08-29 16:00:00' },
  { buyer: 1, product: 9,  quantity: 25,  status: 'placed',           created_at: '2026-08-30 08:00:00' },
];

const orderInsert = db.prepare(`
  INSERT INTO orders (buyer_id, product_id, quantity, total_price, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const o of orderData) {
  const product = db.prepare('SELECT asking_price FROM products WHERE id = ?').get(productIds[o.product]);
  const total = o.quantity * product.asking_price;
  orderInsert.run(buyerIds[o.buyer], productIds[o.product], o.quantity, total, o.status, o.created_at, o.created_at);
}
console.log(`[OK] Inserted ${orderData.length} orders`);

console.log('\n[DONE] Seed complete! Login credentials:');
console.log('  Farmers: rajan@farm2market.com / password123');
console.log('  Buyers:  amit@buyer.com / password123');
console.log('\n  All accounts share password: password123');
