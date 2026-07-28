import request from 'supertest';
import app from '../app';

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