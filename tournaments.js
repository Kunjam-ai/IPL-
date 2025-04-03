const express = require('express');
const router = express.Router();
const { 
  getAllTournaments, 
  getUserTournaments, 
  getTournamentById, 
  createTournament, 
  joinTournament, 
  getTournamentLeaderboard 
} = require('../controllers/tournamentController');
const { authenticateToken, isTournamentCreatorOrAdmin } = require('../middleware/auth');

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Private
router.get('/', authenticateToken, getAllTournaments);

// @route   GET /api/tournaments/my-tournaments
// @desc    Get user's tournaments
// @access  Private
router.get('/my-tournaments', authenticateToken, getUserTournaments);

// @route   GET /api/tournaments/:tournamentId
// @desc    Get tournament by ID
// @access  Private
router.get('/:tournamentId', authenticateToken, getTournamentById);

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private
router.post('/', authenticateToken, createTournament);

// @route   POST /api/tournaments/join
// @desc    Join a tournament
// @access  Private
router.post('/join', authenticateToken, joinTournament);

// @route   GET /api/tournaments/:tournamentId/leaderboard
// @desc    Get tournament leaderboard
// @access  Private
router.get('/:tournamentId/leaderboard', authenticateToken, getTournamentLeaderboard);

module.exports = router;
