const db = require('./db');

// Run once to initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  profile_picture TEXT
);

CREATE TABLE IF NOT EXISTS tweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  username TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tweet_id INTEGER NOT NULL,
  UNIQUE(user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS retweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tweet_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);
`);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const socialRoutes = require('./routes/socialRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/social', socialRoutes);
app.use('/api/users', userRoutes);

module.exports = app;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

