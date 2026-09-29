const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, hostelController.getAllHostels);
router.post('/', verifyToken, requireRole(['super_admin', 'hostel_admin']), hostelController.createHostel);
router.put('/:id', verifyToken, requireRole(['super_admin', 'hostel_admin']), hostelController.updateHostel);
router.delete('/:id', verifyToken, requireRole(['super_admin', 'hostel_admin']), hostelController.deleteHostel);

module.exports = router;