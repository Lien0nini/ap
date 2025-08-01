const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');
const authenticateToken = require('../middleware/authMiddleware');

// Like a tweet
router.post('/tweets/:tweetId/like', authenticateToken, engagementController.likeTweet);
router.delete('/tweets/:tweetId/like', authenticateToken, engagementController.unlikeTweet);

// Retweet a tweet
router.post('/tweets/:tweetId/retweet', authenticateToken, engagementController.retweetTweet);
router.delete('/tweets/:tweetId/retweet', authenticateToken, engagementController.unretweetTweet);

module.exports = router;
