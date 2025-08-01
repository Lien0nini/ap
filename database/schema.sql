-- schema.sql

-- Drop tables if they exist
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS tweets;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS retweets;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS follows;

-- Profiles table
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    bio TEXT,
    profile_picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    follower_count INTEGER DEFAULT 0, -- Number of followers
    following_count INTEGER DEFAULT 0 -- Number of users being followed
);

-- Tweets table
CREATE TABLE tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_reply BOOLEAN DEFAULT 0,
    reply_to_tweet_id INTEGER,
    media_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (reply_to_tweet_id) REFERENCES tweets(id)
);

-- Likes table
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tweet_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id),
    UNIQUE (user_id, tweet_id)
);

-- Retweets table
CREATE TABLE retweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tweet_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id),
    UNIQUE (user_id, tweet_id)
);

-- Comments table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tweet_id INTEGER NOT NULL,
    parent_comment_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

-- Blocks table
CREATE TABLE blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES profiles(id),
    FOREIGN KEY (blocked_id) REFERENCES profiles(id),
    UNIQUE (blocker_id, blocked_id)
);

-- Follows table
CREATE TABLE follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES profiles(id),
    FOREIGN KEY (followed_id) REFERENCES profiles(id),
    UNIQUE (follower_id, followed_id)
);
