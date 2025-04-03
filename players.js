const express = require('express');
const router = express.Router();
const { 
  getAllPlayers, 
  getPlayerById, 
  createPlayer, 
  getPlayersByTeam, 
  getAllTeams 
} = require('../controllers/playerController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/players
// @desc    Get all IPL players
// @access  Private
router.get('/', authenticateToken, getAllPlayers);

// @route   GET /api/players/teams
// @desc    Get all teams
// @access  Private
router.get('/teams', authenticateToken, getAllTeams);

// @route   GET /api/players/team/:teamName
// @desc    Get players by team
// @access  Private
router.get('/team/:teamName', authenticateToken, getPlayersByTeam);

// @route   GET /api/players/:playerId
// @desc    Get player by ID
// @access  Private
router.get('/:playerId', authenticateToken, getPlayerById);

// @route   POST /api/players
// @desc    Create a new player
// @access  Private/Admin
router.post('/', authenticateToken, isAdmin, createPlayer);

module.exports = router;
