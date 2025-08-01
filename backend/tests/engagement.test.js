const request = require('supertest');
const app = require('../app');

let token;
let tweetId;

beforeAll(async () => {
  await request(app)
    .post('/auth/register')
    .send({ username: 'testengage', password: 'password123' });

  const res = await request(app)
    .post('/auth/login')
    .send({ username: 'testengage', password: 'password123' });

  token = res.body.token;

  const post = await request(app)
    .post('/posts/tweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Engagement tweet' });

  tweetId = post.body.tweet.id;
});

describe('Engagement Routes', () => {
  it('should like a tweet', async () => {
    const res = await request(app)
      .post(`/engagement/tweets/${tweetId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should unlike a tweet', async () => {
    const res = await request(app)
      .delete(`/engagement/tweets/${tweetId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should retweet a tweet', async () => {
    const res = await request(app)
      .post(`/engagement/tweets/${tweetId}/retweet`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should unretweet a tweet', async () => {
    const res = await request(app)
      .delete(`/engagement/tweets/${tweetId}/retweet`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should not like the same tweet twice', async () => {
    await request(app)
      .post(`/engagement/tweets/${tweetId}/like`)
      .set('Authorization', `Bearer ${token}`);
  
    const res = await request(app)
      .post(`/engagement/tweets/${tweetId}/like`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(400);
  });
  
  it('should not unlike a tweet that was not liked', async () => {
    const res = await request(app)
      .delete(`/engagement/tweets/9999/like`) // fake tweet ID unlikely to exist
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });  

  it('should not retweet the same tweet twice', async () => {
    await request(app)
      .post(`/engagement/tweets/${tweetId}/retweet`)
      .set('Authorization', `Bearer ${token}`);
    
    const res = await request(app)
      .post(`/engagement/tweets/${tweetId}/retweet`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
  
  it('should not unretweet if not retweeted', async () => {
    const res = await request(app)
      .delete(`/engagement/tweets/9999/retweet`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });  
});
