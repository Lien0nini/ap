
const tweets = require('../models/tweetsStore');

function engagementMiddleware(req, res, next) {
  const { tweetId } = req.params;
  const tweet = tweets.find(t => t.id === parseInt(tweetId));

  if (!tweet) {
    return res.status(404).json({ message: 'Tweet not found.' });
  }

  // Save the found tweet to the request, so controllers can use it if needed
  req.tweet = tweet;

  next();
}

module.exports = engagementMiddleware;
