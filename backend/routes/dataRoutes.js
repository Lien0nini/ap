const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');


// Get all mock users
router.get('/users', authenticateToken, userController.getAllUsers);

module.exports = router;
