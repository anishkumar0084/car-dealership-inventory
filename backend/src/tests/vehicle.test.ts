import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

let authToken: string;

beforeAll(async () => {
  // Clean up any leftover test data
  await prisma.user.deleteMany({
    where: { email: 'vehicletester@example.com' },
  });
  await prisma.vehicle.deleteMany({
    where: { make: 'TestMake' },
  });

  // Register and log in a user to get an auth token
  await request(app).post('/api/auth/register').send({
    name: 'Vehicle Tester',
    email: 'vehicletester@example.com',
    password: 'password123',
  });

  const loginResponse = await request(app).post('/api/auth/login').send({
    email: 'vehicletester@example.com',
    password: 'password123',
  });

  authToken = loginResponse.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/vehicles', () => {
  it('should reject request without auth token', async () => {
    const response = await request(app).post('/api/vehicles').send({
      make: 'TestMake',
      model: 'TestModel',
      category: 'Sedan',
      price: 20000,
      quantity: 5,
    });

    expect(response.status).toBe(401);
  });

  it('should create a new vehicle when authenticated', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        make: 'TestMake',
        model: 'TestModel',
        category: 'Sedan',
        price: 20000,
        quantity: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.vehicle).toHaveProperty('id');
    expect(response.body.vehicle.make).toBe('TestMake');
    expect(response.body.vehicle.quantity).toBe(5);
  });
});

describe('GET /api/vehicles', () => {
  it('should return a list of vehicles when authenticated', async () => {
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.vehicles)).toBe(true);
  });
});

describe('GET /api/vehicles/search', () => {
  beforeAll(async () => {
    // Create some vehicles to search against
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 3 },
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        { make: 'Ford', model: 'Explorer', category: 'SUV', price: 35000, quantity: 2 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { make: { in: ['Toyota', 'Ford'] } },
    });
  });

  it('should search vehicles by make', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles.length).toBe(2);
  });

  it('should search vehicles by category', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles.length).toBe(1);
    expect(response.body.vehicles[0].make).toBe('Ford');
  });

  it('should search vehicles by price range', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?minPrice=22000&maxPrice=40000')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles.length).toBe(2); // Camry (25000) and Explorer (35000)
  });
});

describe('PUT /api/vehicles/:id', () => {
  let vehicleId: string;

  beforeAll(async () => {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'UpdateTestMake',
        model: 'UpdateTestModel',
        category: 'Sedan',
        price: 15000,
        quantity: 4,
      },
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { make: 'UpdateTestMake' },
    });
  });

  it('should update a vehicle when authenticated', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ price: 18000, quantity: 6 });

    expect(response.status).toBe(200);
    expect(response.body.vehicle.price).toBe(18000);
    expect(response.body.vehicle.quantity).toBe(6);
  });

  it('should return 404 for a non-existent vehicle', async () => {
    const response = await request(app)
      .put('/api/vehicles/non-existent-id')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ price: 10000 });

    expect(response.status).toBe(404);
  });

  it('should reject update without auth token', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send({ price: 10000 });

    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId: string;
  let adminToken: string;
  let regularUserToken: string;

  beforeAll(async () => {
    // Clean up any leftover test data
    await prisma.user.deleteMany({
      where: { email: { in: ['admintester@example.com', 'regulartester@example.com'] } },
    });

    // Create a vehicle to delete
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'DeleteTestMake',
        model: 'DeleteTestModel',
        category: 'Sedan',
        price: 12000,
        quantity: 2,
      },
    });
    vehicleId = vehicle.id;

    // Register a regular user
    await request(app).post('/api/auth/register').send({
      name: 'Regular Tester',
      email: 'regulartester@example.com',
      password: 'password123',
    });
    const regularLogin = await request(app).post('/api/auth/login').send({
      email: 'regulartester@example.com',
      password: 'password123',
    });
    regularUserToken = regularLogin.body.token;

    // Register an admin user, then manually promote to admin in DB
    await request(app).post('/api/auth/register').send({
      name: 'Admin Tester',
      email: 'admintester@example.com',
      password: 'password123',
    });
    await prisma.user.update({
      where: { email: 'admintester@example.com' },
      data: { role: 'admin' },
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admintester@example.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({ where: { make: 'DeleteTestMake' } });
    await prisma.user.deleteMany({
      where: { email: { in: ['admintester@example.com', 'regulartester@example.com'] } },
    });
  });

  it('should reject deletion by a non-admin user', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${regularUserToken}`);

    expect(response.status).toBe(403);
  });

  it('should allow deletion by an admin user', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    // Confirm it's actually deleted
    const check = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(check).toBeNull();
  });
});

describe('POST /api/vehicles/:id/purchase', () => {
  let vehicleId: string;
  let outOfStockVehicleId: string;

  beforeAll(async () => {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'PurchaseTestMake',
        model: 'PurchaseTestModel',
        category: 'Sedan',
        price: 22000,
        quantity: 3,
      },
    });
    vehicleId = vehicle.id;

    const outOfStockVehicle = await prisma.vehicle.create({
      data: {
        make: 'PurchaseTestMake',
        model: 'OutOfStockModel',
        category: 'Sedan',
        price: 22000,
        quantity: 0,
      },
    });
    outOfStockVehicleId = outOfStockVehicle.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({ where: { make: 'PurchaseTestMake' } });
  });

  it('should decrease quantity by 1 on purchase', async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicle.quantity).toBe(2);
  });

  it('should return 400 when purchasing an out-of-stock vehicle', async () => {
    const response = await request(app)
      .post(`/api/vehicles/${outOfStockVehicleId}/purchase`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for a non-existent vehicle', async () => {
    const response = await request(app)
      .post('/api/vehicles/non-existent-id/purchase')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });
});