const express = require('express');
const router = express.Router();
const ballotRoundsControllers = require('../controllers/ballotRoundsControllers');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', ballotRoundsControllers.getAllBallotRounds);
router.post('/', verifyToken, requireRole(['super_admin']), ballotRoundsControllers.createBallotRound);

module.exports = router;