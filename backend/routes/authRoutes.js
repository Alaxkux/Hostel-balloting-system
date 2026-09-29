const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.loginStudent);
router.post('/admin/login', authController.loginAdmin);
router.put('/admin/change-password', verifyToken, authController.changeAdminPassword);

module.exports = router;