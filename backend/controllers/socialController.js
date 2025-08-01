const db = require('../db');

// Follow a user
exports.followUser = (req, res) => {
  const { id: followerId } = req.user;
  const followingId = parseInt(req.params.userId);

  if (followerId === followingId) return res.status(400).json({ message: 'You cannot follow yourself.' });

  try {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, followingId);

    // Update follower and following counts
    db.prepare('UPDATE profiles SET followerCount = followerCount + 1 WHERE id = ?').run(followingId);
    db.prepare('UPDATE profiles SET followingCount = followingCount + 1 WHERE id = ?').run(followerId);

    res.json({ message: 'User followed.' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ message: 'Already following this user.' });
    } else {
      res.status(500).json({ message: 'Database error.', error: err });
    }
  }
};

// Unfollow a user
exports.unfollowUser = (req, res) => {
  const { id: followerId } = req.user;
  const followingId = parseInt(req.params.userId);

  const result = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
  if (result.changes === 0) {
    return res.status(400).json({ message: 'You are not following this user.' });
  }

  // Update follower and following counts
  db.prepare('UPDATE profiles SET followerCount = followerCount - 1 WHERE id = ?').run(followingId);
  db.prepare('UPDATE profiles SET followingCount = followingCount - 1 WHERE id = ?').run(followerId);

  res.json({ message: 'User unfollowed.' });
};

// Block a user
exports.blockUser = (req, res) => {
  const { id: blockerId } = req.user;
  const blockedId = parseInt(req.params.userId);

  if (blockerId === blockedId) return res.status(400).json({ message: 'You cannot block yourself.' });

  // Remove follow relationships first
  db.prepare('DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)').run(blockerId, blockedId, blockedId, blockerId);

  // Check if already blocked
  const exists = db.prepare('SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?').get(blockerId, blockedId);

  if (exists) {
    return res.status(400).json({ message: 'Already blocked this user.' });
  }

  // Insert block
  try {
    db.prepare('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(blockerId, blockedId);
    res.json({ message: 'User blocked.' });
  } catch (err) {
    res.status(500).json({ message: 'Database error.', error: err });
  }
};

// Unblock a user
exports.unblockUser = (req, res) => {
  const { id: blockerId } = req.user;
  const blockedId = parseInt(req.params.userId);

  const result = db.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?').run(blockerId, blockedId);
  if (result.changes === 0) {
    return res.status(400).json({ message: 'You have not blocked this user.' });
  }

  res.json({ message: 'User unblocked.' });
};
// Filter out blocked users' posts from the feed
exports.getFeed = (req, res) => {
  const { id: userId } = req.user;

  try {
    // Get the list of users blocked by the current user
    const blockedUsers = db.prepare('SELECT blocked_id FROM blocks WHERE blocker_id = ?').all(userId).map(row => row.blocked_id);

    // Fetch posts excluding those from blocked users
    const posts = db.prepare(`
      SELECT posts.* 
      FROM posts 
      WHERE user_id NOT IN (${blockedUsers.map(() => '?').join(',')})
      ORDER BY created_at DESC
    `).all(...blockedUsers);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Database error.', error: err });
  }
};