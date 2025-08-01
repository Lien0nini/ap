const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/tweets', authenticateToken, postController.postTweet);
router.delete('/tweets/:tweetId', authenticateToken, postController.deleteTweet);
router.get('/feed', authenticateToken, postController.getFeed);
router.get('/feed/refresh', authenticateToken, postController.refreshFeed);
router.get('/user/:username', authenticateToken, postController.getUserTweets);
router.get('/:id', authenticateToken, postController.getPostById);
router.post('/:id/comment', authenticateToken, postController.addComment);

module.exports = router;
