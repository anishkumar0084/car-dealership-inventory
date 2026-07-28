import request from 'supertest';
import app from '../app';

import prisma from '../lib/prisma';

beforeAll(async () => {
  // Clean up test users before running tests
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'testuser@example.com',
          'duplicate@example.com',
          'loginuser@example.com',
          'wrongpass@example.com',
          'doesnotexist@example.com',
        ],
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return 201 with user data (no password)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('testuser@example.com');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if email is already registered', async () => {
    // First registration
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123',
    });

    // Duplicate registration
    const response = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: 'duplicate@example.com',
      password: 'password456',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  it('should log in an existing user and return a token', async () => {
    // First register a user
    await request(app).post('/api/auth/register').send({
      name: 'Login Test User',
      email: 'loginuser@example.com',
      password: 'password123',
    });

    // Now try logging in
    const response = await request(app).post('/api/auth/login').send({
      email: 'loginuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('loginuser@example.com');
  });

  it('should return 401 for incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Wrong Pass User',
      email: 'wrongpass@example.com',
      password: 'correctpassword',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'incorrectpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 401 for non-existent email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@example.com',
      password: 'somepassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});