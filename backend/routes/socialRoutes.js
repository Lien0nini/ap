const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');

// Follow a user
router.post('/follow/:userId', authMiddleware, (req, res) => {
  const { id: followerId } = req.user; // Current user ID
  const followingId = parseInt(req.params.userId);

  if (followerId === followingId) {
    return res.status(400).json({ message: 'You cannot follow yourself.' });
  }

  try {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, followingId);
    res.json({ message: 'User followed successfully.' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ message: 'Already following this user.' });
    } else {
      res.status(500).json({ message: 'Failed to follow user.', error: err.message });
    }
  }
});

// Unfollow a user
router.delete('/follow/:userId', authMiddleware, (req, res) => {
  const { id: followerId } = req.user; // Current user ID
  const followingId = parseInt(req.params.userId);

  const result = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
  if (result.changes === 0) {
    return res.status(400).json({ message: 'You are not following this user.' });
  }

  res.json({ message: 'User unfollowed successfully.' });
});

module.exports = router;
