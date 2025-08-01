const db = require('../db');
let tweetIdCounter = 1;

const TWEET_CHAR_LIMIT = 280;
const FEED_PAGE_SIZE = 10;

// Post a new tweet
exports.postTweet = (req, res) => {
  const { id: userId } = req.user;
  const { content } = req.body;

  console.log('Attempting to post tweet:', { userId, content });

  if (!content || content.length > TWEET_CHAR_LIMIT) {
    return res.status(400).json({ message: `Tweet must be between 1 and ${TWEET_CHAR_LIMIT} characters.` });
  }

  try {
    const stmt = db.prepare('INSERT INTO tweets (user_id, content, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const info = stmt.run(userId, content);
    console.log('Tweet inserted, row info:', info);

    const newTweet = db.prepare(`
      SELECT tweets.*, profiles.username, profiles.profile_picture
      FROM tweets
      JOIN profiles ON tweets.user_id = profiles.id
      WHERE tweets.id = ?
    `).get(info.lastInsertRowid);
    console.log('Retrieved new tweet:', newTweet);

    res.status(201).json({ message: 'Tweet posted.', tweet: newTweet });
  } catch (error) {
    console.error('Error posting tweet:', error);
    res.status(500).json({ message: 'Failed to post tweet', error: error.message });
  }
};

// Delete a tweet
exports.deleteTweet = (req, res) => {
  const { id: userId } = req.user;
  const tweetId = parseInt(req.params.tweetId);

  const tweet = db.prepare('SELECT * FROM tweets WHERE id = ?').get(tweetId);
  if (!tweet) return res.status(404).json({ message: 'Tweet not found.' });
  if (tweet.user_id !== userId) return res.status(403).json({ message: 'You can only delete your own tweets.' });

  db.prepare('DELETE FROM tweets WHERE id = ?').run(tweetId);
  res.json({ message: 'Tweet deleted.' });
};

// Get feed
exports.getFeed = (req, res) => {
  const { id: userId } = req.user;

  const tweets = db.prepare(`
    SELECT 
      tweets.*,
      profiles.username,
      profiles.profile_picture,
      EXISTS(
        SELECT 1 FROM likes WHERE user_id = ? AND tweet_id = tweets.id
      ) AS liked,
      EXISTS(
        SELECT 1 FROM retweets WHERE user_id = ? AND tweet_id = tweets.id
      ) AS retweeted,
      CASE 
        WHEN EXISTS(
          SELECT 1 FROM retweets 
          WHERE user_id = ? AND tweet_id = tweets.id
        ) THEN 1 ELSE 0 
      END AS is_retweet,
      (
        SELECT username FROM profiles 
        WHERE id = (
          SELECT user_id FROM retweets 
          WHERE tweet_id = tweets.id AND user_id = ?
        )
      ) AS retweeter_username
    FROM tweets
    JOIN profiles ON tweets.user_id = profiles.id
    ORDER BY tweets.created_at DESC
  `).all(userId, userId, userId, userId);

  res.json({ feed: tweets });
};



// Refresh feed (first page)
exports.refreshFeed = (req, res) => {
  const feed = db.prepare('SELECT * FROM tweets ORDER BY created_at DESC LIMIT ?').all(FEED_PAGE_SIZE);
  res.json({ feed, refreshedAt: new Date() });
};

// Get tweets by username
// controllers/postController.js
exports.getUserTweets = (req, res) => {
  const { username } = req.params;
  try {
    const tweets = db.prepare(`
      SELECT
        tweets.*,
        profiles.username       AS username,
        profiles.username       AS name,
        profiles.profile_picture,
        EXISTS(SELECT 1 FROM likes    WHERE user_id = ? AND tweet_id = tweets.id) AS liked,
        EXISTS(SELECT 1 FROM retweets WHERE user_id = ? AND tweet_id = tweets.id) AS retweeted,
        CASE WHEN tweets.user_id != (SELECT id FROM profiles WHERE username = ?) THEN 1 ELSE 0 END AS is_retweet,
        (SELECT username FROM profiles 
           WHERE id = (
             SELECT user_id FROM retweets 
             WHERE tweet_id = tweets.id 
               AND user_id = (SELECT id FROM profiles WHERE username = ?)
           )
        ) AS retweeter_username
      FROM tweets
      JOIN profiles ON tweets.user_id = profiles.id
      WHERE profiles.username = ?
         OR EXISTS(
           SELECT 1 FROM retweets 
           WHERE user_id = (SELECT id FROM profiles WHERE username = ?)
             AND tweet_id = tweets.id
         )
      ORDER BY tweets.created_at DESC
    `).all(
      req.user.id,    // for liked
      req.user.id,    // for retweeted
      username,
      username,
      username,
      username
    );

    res.json({ tweets });
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    res.status(500).json({ message: 'Failed to fetch tweets' });
  }
};


// Get a single post by ID
exports.getPostById = (req, res) => {
  const { id } = req.params;

  try {
    const post = db.prepare(`
      SELECT 
        tweets.*, 
        profiles.username, 
        profiles.profile_picture
      FROM tweets
      JOIN profiles ON tweets.user_id = profiles.id
      WHERE tweets.id = ?
    `).get(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comments = db.prepare(`
      SELECT 
        comments.id,
        comments.content,
        comments.created_at,
        profiles.username,
        profiles.profile_picture
      FROM comments
      JOIN profiles ON comments.user_id = profiles.id
      WHERE comments.tweet_id = ?
      ORDER BY comments.created_at ASC
    `).all(id);

    res.json({ ...post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};


// Add a comment to a tweet
exports.addComment = (req, res) => {
  const { id } = req.params; // `id` is the tweet ID
  const { content, parentCommentId } = req.body; // Optional parent comment ID for nested comments
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Content required' });
  }

  try {
    db.prepare(`
      INSERT INTO comments (tweet_id, user_id, parent_comment_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, parentCommentId || null, content, new Date().toISOString());

    res.json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};
