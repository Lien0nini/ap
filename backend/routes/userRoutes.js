const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db'); // or wherever your database is

// PUT /api/users/profile
router.put('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { username, birthday, profile_picture } = req.body;

  if (!username || !birthday || !profile_picture) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE profiles
      SET username = ?, birthday = ?, profile_picture = ?
      WHERE id = ?
    `);
    stmt.run(username, birthday, profile_picture, userId);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// GET /api/users/:username
// routes/users.js
router.get('/:username', authMiddleware, (req, res) => {
  const { username } = req.params;

  try {
    const user = db.prepare(`
      SELECT
        id,
        username,
        bio              AS bio,            -- if you want a bio field
        profile_picture,
        created_at       AS joined,         -- alias to "joined"
        (SELECT COUNT(*) FROM follows WHERE followed_id = profiles.id)   AS followerCount,
        (SELECT COUNT(*) FROM follows WHERE follower_id = profiles.id)   AS followingCount
      FROM profiles
      WHERE username = ?
    `).get(username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

module.exports = router;
