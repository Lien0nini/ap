const db = require('../db');

// Like a tweet
exports.likeTweet = (req, res) => {
  const { tweetId } = req.params;
  const { id: userId } = req.user;

  try {
    db.prepare('INSERT INTO likes (user_id, tweet_id) VALUES (?, ?)').run(userId, tweetId);
    res.status(200).json({ message: 'Tweet liked successfully' });
  } catch (error) {
    console.error('Error liking tweet:', error);
    res.status(500).json({ message: 'Failed to like tweet' });
  }
};

// Unlike a tweet
exports.unlikeTweet = (req, res) => {
  const { tweetId } = req.params;
  const { id: userId } = req.user;

  try {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND tweet_id = ?').run(userId, tweetId);
    res.status(200).json({ message: 'Tweet unliked successfully' });
  } catch (error) {
    console.error('Error unliking tweet:', error);
    res.status(500).json({ message: 'Failed to unlike tweet' });
  }
};

// Retweet a tweet
exports.retweetTweet = (req, res) => {
  const { tweetId } = req.params;
  const { id: userId } = req.user;

  try {
    db.prepare('INSERT INTO retweets (user_id, tweet_id) VALUES (?, ?)').run(userId, tweetId);
    res.status(200).json({ message: 'Tweet retweeted successfully' });
  } catch (error) {
    console.error('Error retweeting tweet:', error);
    res.status(500).json({ message: 'Failed to retweet tweet' });
  }
};

// Unretweet a tweet
exports.unretweetTweet = (req, res) => {
  const { tweetId } = req.params;
  const { id: userId } = req.user;

  try {
    db.prepare('DELETE FROM retweets WHERE user_id = ? AND tweet_id = ?').run(userId, tweetId);
    res.status(200).json({ message: 'Tweet unretweeted successfully' });
  } catch (error) {
    console.error('Error unretweeting tweet:', error);
    res.status(500).json({ message: 'Failed to unretweet tweet' });
  }
};
