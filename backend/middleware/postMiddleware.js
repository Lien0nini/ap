
const jwt = require('jsonwebtoken');

function postMiddleware(req, res, next) {
  // The token should be sent in the Authorization header as "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret'; // Same secret used when signing tokens
    const user = jwt.verify(token, secret);
    req.user = user; // Attach the decoded user to the request
    next(); // Move on to the next middleware or route handler
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
  }
}

module.exports = postMiddleware;
