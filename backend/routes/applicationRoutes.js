const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['super_admin', 'hostel_admin']), applicationController.getAllApplications);
router.post('/', verifyToken, applicationController.createApplication);

module.exports = router;