const request = require('supertest');
const app = require('../app');

let token;
let tweetId;

beforeAll(async () => {
  await request(app)
    .post('/auth/register')
    .send({ username: 'testposter', password: 'password123' });

  const res = await request(app)
    .post('/auth/login')
    .send({ username: 'testposter', password: 'password123' });

  token = res.body.token;
});

describe('Post Routes', () => {
  it('should post a new tweet', async () => {
    const res = await request(app)
      .post('/posts/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello world!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.tweet.content).toBe('Hello world!');
    tweetId = res.body.tweet.id;
  });

  it('should not post a tweet without a token', async () => {
    const res = await request(app)
      .post('/posts/tweets')
      .send({ content: 'No token tweet' });

    expect(res.statusCode).toBe(401);
  });

  it('should fetch the feed', async () => {
    const res = await request(app)
      .get('/posts/feed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.feed)).toBe(true);
  });

  it('should delete a tweet', async () => {
    const res = await request(app)
      .delete(`/posts/tweets/${tweetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should not allow posting a tweet over 280 characters', async () => {
    const longTweet = 'a'.repeat(281);
    const res = await request(app)
      .post('/posts/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: longTweet });
    expect(res.statusCode).toBe(400);
  });
  
  it('should not allow deleting someone else’s tweet', async () => {
    const postRes = await request(app)
      .post('/posts/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Protected tweet' });
    const tweetId = postRes.body.tweet.id;
  
    const newUser = await request(app)
      .post('/auth/register')
      .send({ username: 'otherUser', password: 'password123' });
  
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'otherUser', password: 'password123' });
    const otherToken = loginRes.body.token;
  
    const deleteRes = await request(app)
      .delete(`/posts/tweets/${tweetId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteRes.statusCode).toBe(403);
  });  

  it('should return empty feed if no tweets exist', async () => {
    const newUser = await request(app)
      .post('/auth/register')
      .send({ username: 'noTweetsUser', password: 'password123' });
  
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'noTweetsUser', password: 'password123' });
  
    const token = loginRes.body.token;
    const feedRes = await request(app)
      .get('/posts/feed')
      .set('Authorization', `Bearer ${token}`);
  
    expect(feedRes.statusCode).toBe(200);
    expect(Array.isArray(feedRes.body.feed)).toBe(true);
  });
  
  it('should refresh the feed', async () => {
    const res = await request(app)
      .get('/posts/feed/refresh')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });  
});
