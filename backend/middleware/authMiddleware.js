const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided.' });

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
