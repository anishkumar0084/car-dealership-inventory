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