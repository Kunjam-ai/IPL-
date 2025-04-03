const { pool } = require('../../database/init');

/**
 * Get all IPL players
 * @route GET /api/players
 * @access Private
 */
const getAllPlayers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ipl_players ORDER BY team, player_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllPlayers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get player by ID
 * @route GET /api/players/:playerId
 * @access Private
 */
const getPlayerById = async (req, res) => {
  try {
    const { playerId } = req.params;

    const result = await pool.query(
      'SELECT * FROM ipl_players WHERE ipl_player_id = $1',
      [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const player = result.rows[0];

    // Get player's fantasy points across all matches
    const pointsResult = await pool.query(
      `SELECT mfp.*, m.match_date, m.team1, m.team2
       FROM match_fantasy_points mfp
       JOIN matches m ON mfp.match_id = m.match_id
       WHERE mfp.ipl_player_id = $1
       ORDER BY m.match_date DESC`,
      [playerId]
    );

    player.fantasy_points_history = pointsResult.rows;

    res.json(player);
  } catch (error) {
    console.error('Error in getPlayerById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new player
 * @route POST /api/players
 * @access Private/Admin
 */
const createPlayer = async (req, res) => {
  try {
    const { player_name, team } = req.body;

    // Validate input
    if (!player_name || !team) {
      return res.status(400).json({ message: 'Please provide player name and team' });
    }

    // Check if player already exists
    const existingResult = await pool.query(
      'SELECT * FROM ipl_players WHERE player_name = $1 AND team = $2',
      [player_name, team]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Player already exists' });
    }

    // Create player
    const result = await pool.query(
      `INSERT INTO ipl_players (player_name, team) 
       VALUES ($1, $2) 
       RETURNING *`,
      [player_name, team]
    );

    const player = result.rows[0];

    res.status(201).json(player);
  } catch (error) {
    console.error('Error in createPlayer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get players by team
 * @route GET /api/players/team/:teamName
 * @access Private
 */
const getPlayersByTeam = async (req, res) => {
  try {
    const { teamName } = req.params;

    const result = await pool.query(
      `SELECT * FROM ipl_players WHERE team = $1 ORDER BY player_name`,
      [teamName]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getPlayersByTeam:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all teams
 * @route GET /api/players/teams
 * @access Private
 */
const getAllTeams = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT team FROM ipl_players ORDER BY team`
    );

    const teams = result.rows.map(row => row.team);
    res.json(teams);
  } catch (error) {
    console.error('Error in getAllTeams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  getPlayersByTeam,
  getAllTeams
};
