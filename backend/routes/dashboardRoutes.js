const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/admin-stats', verifyToken, requireRole(['super_admin', 'hostel_admin']), dashboardController.getAdminStats);

module.exports = router;