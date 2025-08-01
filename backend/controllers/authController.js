const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
exports.register = (req, res) => {
  const { username, password } = req.body;

  console.log('Registering user:', { username, password });

  if (!username || !password || password.length < 6) {
    return res.status(400).json({ message: 'Username and password required. Password must be at least 6 chars.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare('INSERT INTO profiles (username, password) VALUES (?, ?)');
    stmt.run(username, hashedPassword);
    res.status(201).json({ message: 'User registered.' });
  } catch (err) {
    console.error('Database error:', err);
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ message: 'Username already taken.' });
    } else {
      res.status(500).json({ message: 'Database error.', error: err });
    }
  }
};

// Login
exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM profiles WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
};

// Update Profile
exports.updateProfile = (req, res) => {
  const { username, birthday, profile_picture } = req.body;
  const userId = req.user.id;

  try {
    const result = db.prepare(`
      UPDATE profiles
      SET username = ?, birthday = ?, profile_picture = ?
      WHERE id = ?
    `).run(username, birthday, profile_picture, userId);

    if (result.changes === 0) {
      throw new Error('No changes made to the profile');
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

// Logout
exports.logout = (req, res) => {
  res.json({ message: 'Logout successful. Please delete the token on the client.' });
};

// Get Feed
exports.getFeed = (req, res) => {
  const { id } = req.user;

  try {
    const following = db.prepare('SELECT following_id FROM followers WHERE follower_id = ?').all(id);

    if (following.length === 0) {
      return res.json({ tweets: [] });
    }

    const placeholders = following.map(() => '?').join(',');
    const followingIds = following.map(f => f.following_id);

    const tweets = db.prepare(`
      SELECT tweets.*, profiles.username, profiles.profile_picture
      FROM tweets
      JOIN profiles ON tweets.user_id = profiles.id
      WHERE tweets.user_id IN (${placeholders})
      ORDER BY tweets.created_at DESC
    `).all(...followingIds);

    res.json({ tweets });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
};
