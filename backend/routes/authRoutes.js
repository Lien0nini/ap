const db = require('../db');

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.put('/profile', authenticateToken, authController.updateProfile);


router.get('/me', authenticateToken, (req, res) => {
  const { id } = req.user;
  const user = db
    .prepare('SELECT id, username, profile_picture FROM profiles WHERE id = ?')
    .get(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});


module.exports = router;
