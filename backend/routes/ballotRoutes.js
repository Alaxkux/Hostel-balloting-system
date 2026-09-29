const express = require('express');
const router = express.Router();
const ballotController = require('../controllers/ballotController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/:id/run', verifyToken, requireRole(['super_admin']), ballotController.runBallot);
router.get('/:id/results', verifyToken, requireRole(['super_admin', 'hostel_admin']), ballotController.getBallotResults);

module.exports = router;