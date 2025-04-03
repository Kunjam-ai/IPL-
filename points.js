const express = require('express');
const router = express.Router();
const { 
  getPointsByMatch, 
  addOrUpdatePoints, 
  getPointsByPlayer, 
  bulkAddPoints 
} = require('../controllers/pointsController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/points/match/:matchId
// @desc    Get fantasy points for a match
// @access  Private
router.get('/match/:matchId', authenticateToken, getPointsByMatch);

// @route   GET /api/points/player/:playerId
// @desc    Get fantasy points for a player
// @access  Private
router.get('/player/:playerId', authenticateToken, getPointsByPlayer);

// @route   POST /api/points
// @desc    Add or update fantasy points for a player in a match
// @access  Private/Admin
router.post('/', authenticateToken, isAdmin, addOrUpdatePoints);

// @route   POST /api/points/bulk
// @desc    Bulk add fantasy points for multiple players in a match
// @access  Private/Admin
router.post('/bulk', authenticateToken, isAdmin, bulkAddPoints);

module.exports = router;
