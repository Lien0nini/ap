-- seed.sql (complete version)

-- Insert 25 profiles
INSERT INTO profiles (username, email, password, bio) VALUES
('user1', 'user1@example.com', 'password1', 'Bio for user1'),
('user2', 'user2@example.com', 'password2', 'Bio for user2'),
('user3', 'user3@example.com', 'password3', 'Bio for user3'),
('user4', 'user4@example.com', 'password4', 'Bio for user4'),
('user5', 'user5@example.com', 'password5', 'Bio for user5'),
('user6', 'user6@example.com', 'password6', 'Bio for user6'),
('user7', 'user7@example.com', 'password7', 'Bio for user7'),
('user8', 'user8@example.com', 'password8', 'Bio for user8'),
('user9', 'user9@example.com', 'password9', 'Bio for user9'),
('user10', 'user10@example.com', 'password10', 'Bio for user10'),
('user11', 'user11@example.com', 'password11', 'Bio for user11'),
('user12', 'user12@example.com', 'password12', 'Bio for user12'),
('user13', 'user13@example.com', 'password13', 'Bio for user13'),
('user14', 'user14@example.com', 'password14', 'Bio for user14'),
('user15', 'user15@example.com', 'password15', 'Bio for user15'),
('user16', 'user16@example.com', 'password16', 'Bio for user16'),
('user17', 'user17@example.com', 'password17', 'Bio for user17'),
('user18', 'user18@example.com', 'password18', 'Bio for user18'),
('user19', 'user19@example.com', 'password19', 'Bio for user19'),
('user20', 'user20@example.com', 'password20', 'Bio for user20'),
('user21', 'user21@example.com', 'password21', 'Bio for user21'),
('user22', 'user22@example.com', 'password22', 'Bio for user22'),
('user23', 'user23@example.com', 'password23', 'Bio for user23'),
('user24', 'user24@example.com', 'password24', 'Bio for user24'),
('user25', 'user25@example.com', 'password25', 'Bio for user25');

-- Insert 200 tweets
INSERT INTO tweets (user_id, content) VALUES
-- generate tweets for user1 to user25, 8 each
" +
    Array.from({ length: 200 }, (_, i) => {
      const user = (i % 25) + 1;
      return `(${user}, 'Tweet ${i + 1} from user${user}')`;
    }).join(',
') + ';

-- Insert random follows (30 pairs)
INSERT INTO follows (follower_id, followed_id) VALUES
" +
    Array.from({ length: 30 }, (_, i) => {
      const follower = (i % 25) + 1;
      const followed = ((i * 2) % 25) + 1;
      if (follower !== followed) {
        return `(${follower}, ${followed})`;
      }
    }).filter(Boolean).join(',
') + ';

-- Insert random likes (50 pairs)
INSERT INTO likes (user_id, tweet_id) VALUES
" +
    Array.from({ length: 50 }, (_, i) => {
      const user = (i % 25) + 1;
      const tweet = ((i * 3) % 200) + 1;
      return `(${user}, ${tweet})`;
    }).join(',
') + ';

-- Insert random retweets (50 pairs)
INSERT INTO retweets (user_id, tweet_id) VALUES
" +
    Array.from({ length: 50 }, (_, i) => {
      const user = ((i * 4) % 25) + 1;
      const tweet = ((i * 5) % 200) + 1;
      return `(${user}, ${tweet})`;
    }).join(',
') + ';

-- Insert random blocks (20 pairs)
INSERT INTO blocks (blocker_id, blocked_id) VALUES
" +
    Array.from({ length: 20 }, (_, i) => {
      const blocker = (i % 25) + 1;
      const blocked = ((i * 3) % 25) + 1;
      if (blocker !== blocked) {
        return `(${blocker}, ${blocked})`;
      }
    }).filter(Boolean).join(',
') + ';

-- Insert random comments (50 comments)
INSERT INTO comments (user_id, tweet_id, content) VALUES
" +
    Array.from({ length: 50 }, (_, i) => {
      const user = (i % 25) + 1;
      const tweet = ((i * 2) % 200) + 1;
      return `(${user}, ${tweet}, 'Comment ${i + 1} by user${user}')`;
    }).join(',
') + ';
