const { pool } = require('../../database/init');
const { io } = require('../server');

/**
 * Get all matches
 * @route GET /api/matches
 * @access Private
 */
const getAllMatches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches ORDER BY match_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllMatches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get match by ID
 * @route GET /api/matches/:matchId
 * @access Private
 */
const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE match_id = $1',
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = matchResult.rows[0];

    // Get fantasy points for this match
    const pointsResult = await pool.query(
      `SELECT mfp.*, ip.player_name, ip.team
       FROM match_fantasy_points mfp
       JOIN ipl_players ip ON mfp.ipl_player_id = ip.ipl_player_id
       WHERE mfp.match_id = $1
       ORDER BY mfp.fantasy_points DESC`,
      [matchId]
    );

    match.fantasy_points = pointsResult.rows;

    res.json(match);
  } catch (error) {
    console.error('Error in getMatchById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new match
 * @route POST /api/matches
 * @access Private/Admin
 */
const createMatch = async (req, res) => {
  try {
    const { match_date, team1, team2, venue, status } = req.body;

    // Validate input
    if (!match_date || !team1 || !team2 || !venue) {
      return res.status(400).json({ message: 'Please provide match date, teams, and venue' });
    }

    // Create match
    const result = await pool.query(
      `INSERT INTO matches (match_date, team1, team2, venue, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [match_date, team1, team2, venue, status || 'scheduled']
    );

    const match = result.rows[0];

    // Notify all connected clients
    io.emit('match-update', {
      type: 'new-match',
      match
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Error in createMatch:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update match status
 * @route PUT /api/matches/:matchId
 * @access Private/Admin
 */
const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    // Update match
    const result = await pool.query(
      `UPDATE matches SET status = $1 WHERE match_id = $2 RETURNING *`,
      [status, matchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = result.rows[0];

    // Notify all connected clients
    io.emit('match-update', {
      type: 'status-update',
      match
    });

    res.json(match);
  } catch (error) {
    console.error('Error in updateMatchStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get upcoming matches
 * @route GET /api/matches/upcoming
 * @access Private
 */
const getUpcomingMatches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE match_date > NOW() AND status = 'scheduled'
       ORDER BY match_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getUpcomingMatches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get completed matches
 * @route GET /api/matches/completed
 * @access Private
 */
const getCompletedMatches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE status = 'completed'
       ORDER BY match_date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getCompletedMatches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatchStatus,
  getUpcomingMatches,
  getCompletedMatches
};
