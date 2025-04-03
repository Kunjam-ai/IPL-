const express = require('express');
const router = express.Router();
const { 
  getAllMatches, 
  getMatchById, 
  createMatch, 
  updateMatchStatus, 
  getUpcomingMatches, 
  getCompletedMatches 
} = require('../controllers/matchController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/matches
// @desc    Get all matches
// @access  Private
router.get('/', authenticateToken, getAllMatches);

// @route   GET /api/matches/upcoming
// @desc    Get upcoming matches
// @access  Private
router.get('/upcoming', authenticateToken, getUpcomingMatches);

// @route   GET /api/matches/completed
// @desc    Get completed matches
// @access  Private
router.get('/completed', authenticateToken, getCompletedMatches);

// @route   GET /api/matches/:matchId
// @desc    Get match by ID
// @access  Private
router.get('/:matchId', authenticateToken, getMatchById);

// @route   POST /api/matches
// @desc    Create a new match
// @access  Private/Admin
router.post('/', authenticateToken, isAdmin, createMatch);

// @route   PUT /api/matches/:matchId
// @desc    Update match status
// @access  Private/Admin
router.put('/:matchId', authenticateToken, isAdmin, updateMatchStatus);

module.exports = router;
