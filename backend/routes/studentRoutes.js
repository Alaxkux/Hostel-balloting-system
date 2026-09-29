const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['super_admin', 'hostel_admin']), studentController.getAllStudents);
router.get('/applications/my', verifyToken, studentController.getStudentApplications);
router.get('/my-result', verifyToken, studentController.getMyResult);
router.put('/:id', verifyToken, requireRole(['super_admin']), studentController.updateStudent);
router.patch('/:id/deactivate', verifyToken, requireRole(['super_admin']), studentController.deactivateStudent);

module.exports = router;