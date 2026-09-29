const express = require('express');
const router = express.Router();
const auditlogsController = require('../controllers/auditlogsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['super_admin']), auditlogsController.getAllAuditLogs);

module.exports = router;