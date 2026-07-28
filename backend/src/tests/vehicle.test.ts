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