const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  let token;

  beforeAll(async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'testauth', password: 'password123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testauth', password: 'password123' });

    token = res.body.token;
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testauth', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not allow login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testauth', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });

  it('should update profile', async () => {
    const res = await request(app)
      .put('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio', profile_picture: 'https://example.com/image.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.bio).toBe('Updated bio');
  });

  it('should not register a user with missing password', async () => {
    const res = await request(app).post('/auth/register').send({ username: 'noPass' });
    expect(res.statusCode).toBe(400);
  });

  it('should not login with wrong password', async () => {
    await request(app).post('/auth/register').send({ username: 'testuser', password: 'password123' });
    const res = await request(app).post('/auth/login').send({ username: 'testuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('should not update profile if user not found', async () => {
    const fakeToken = jwt.sign({ id: 9999, username: 'ghost' }, process.env.JWT_SECRET || 'supersecretkey');
    const res = await request(app).put('/auth/profile')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ bio: 'ghost mode' });
    expect(res.statusCode).toBe(404);
  });

  it('should not register a user twice', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testauth', password: 'password123' });
    expect(res.statusCode).toBe(400);
  });

  it('should not register duplicate usernames', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testauth', password: 'password123' });
    expect(res.statusCode).toBe(400);
  });  
});
