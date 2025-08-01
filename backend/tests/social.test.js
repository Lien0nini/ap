const request = require('supertest');
const app = require('../app');
const db = require('../db');

let token1 = '';
let token2 = '';
let userId1 = 0;
let userId2 = 0;

beforeAll(() => {
  // Reset database cleanly before tests
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM follows').run();
  db.prepare('DELETE FROM blocks').run();
});

beforeEach(async () => {
  // Recreate users for each test run
  await request(app)
    .post('/auth/register')
    .send({ username: 'userA', password: 'password123' });

  await request(app)
    .post('/auth/register')
    .send({ username: 'userB', password: 'password123' });

  const res1 = await request(app)
    .post('/auth/login')
    .send({ username: 'userA', password: 'password123' });

  token1 = res1.body.token;
  userId1 = res1.body.id || 1; // default if not set

  const res2 = await request(app)
    .post('/auth/login')
    .send({ username: 'userB', password: 'password123' });

  token2 = res2.body.token;
  userId2 = res2.body.id || 2; // default if not set
});

describe('Social Routes', () => {
  it('should follow a user', async () => {
    const res = await request(app)
      .post(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });

  it('should block a user', async () => {
    const res = await request(app)
      .post(`/social/block/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });

  it('should unblock a user after blocking', async () => {
    // First block again to make sure exists
    await request(app)
      .post(`/social/block/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
      
    const res = await request(app)
      .delete(`/social/block/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });

  it('should follow again after unblock', async () => {
    const res = await request(app)
      .post(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });

  it('should unfollow the user', async () => {
    const res = await request(app)
      .delete(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });

  it('should not follow yourself', async () => {
    const res = await request(app)
      .post(`/social/follow/${userId1}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(400);
  });
  
  it('should not block yourself', async () => {
    const res = await request(app)
      .post(`/social/block/${userId1}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(400);
  });
  
  it('should return 400 when unfollowing a user not followed', async () => {
    const res = await request(app)
      .delete(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(400);
  });  

  it('should not unblock if user is not blocked', async () => {
    const res = await request(app)
      .delete(`/social/block/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(400);
  });  
});
