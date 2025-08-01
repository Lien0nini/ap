const request = require('supertest'); 
const app = require('../../backend/app'); // Adjust path to your backend app
const db = require('../../backend/db'); // Adjust path to your database setup

let token1 = '';
let token2 = '';
let userId1 = 0;
let userId2 = 0;
let postId = 0;

beforeAll(() => {
  // Reset database cleanly before tests
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM posts').run();
  db.prepare('DELETE FROM comments').run();
  db.prepare('DELETE FROM follows').run();
  db.prepare('DELETE FROM blocks').run();
});

describe('Integration Tests', () => {
  it('should create accounts and login users', async () => {
    // Create accounts
    await request(app).post('/auth/register').send({ username: 'userA', password: 'password123' });
    await request(app).post('/auth/register').send({ username: 'userB', password: 'password123' });

    // Login users
    const res1 = await request(app).post('/auth/login').send({ username: 'userA', password: 'password123' });
    token1 = res1.body.token;
    userId1 = res1.body.id;

    const res2 = await request(app).post('/auth/login').send({ username: 'userB', password: 'password123' });
    token2 = res2.body.token;
    userId2 = res2.body.id;

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
  });

  it('should post a tweet and see it in the feed', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Hello World!' });

    expect(res.statusCode).toBe(201);
    postId = res.body.id;

    const feedRes = await request(app)
      .get('/feed')
      .set('Authorization', `Bearer ${token1}`);

    expect(feedRes.body.posts[0].content).toBe('Hello World!');
  });

  it('should comment on a tweet and view the comment', async () => {
    const commentRes = await request(app)
      .post(`/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Nice post!' });

    expect(commentRes.statusCode).toBe(201);

    const postRes = await request(app)
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(postRes.body.comments[0].content).toBe('Nice post!');
  });

  it('should like and retweet a tweet', async () => {
    const likeRes = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);

    expect(likeRes.statusCode).toBe(200);

    const retweetRes = await request(app)
      .post(`/posts/${postId}/retweet`)
      .set('Authorization', `Bearer ${token2}`);

    expect(retweetRes.statusCode).toBe(200);
  });

  it('should block a user and not see their tweets', async () => {
    await request(app)
      .post(`/social/block/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);

    const feedRes = await request(app)
      .get('/feed')
      .set('Authorization', `Bearer ${token1}`);

    expect(feedRes.body.posts.some((post) => post.userId === userId2)).toBe(false);
  });

  it('should follow and unfollow a user', async () => {
    const followRes = await request(app)
      .post(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(followRes.statusCode).toBe(200);

    const unfollowRes = await request(app)
      .delete(`/social/follow/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(unfollowRes.statusCode).toBe(200);
  });

  it('should view another user’s profile from their tweet', async () => {
    const profileRes = await request(app)
      .get(`/users/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(profileRes.body.username).toBe('userB');
  });

  it('should logout and restrict access to protected routes', async () => {
    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token1}`);

    expect(logoutRes.statusCode).toBe(200);

    const feedRes = await request(app)
      .get('/feed')
      .set('Authorization', `Bearer ${token1}`);

    expect(feedRes.statusCode).toBe(401);
  });
});