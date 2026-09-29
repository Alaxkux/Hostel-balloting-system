const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, notificationController.getMyNotifications);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;