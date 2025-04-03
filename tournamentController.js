const { pool } = require('../../database/init');
const crypto = require('crypto');
const { io } = require('../server');

/**
 * Get all tournaments
 * @route GET /api/tournaments
 * @access Private
 */
const getAllTournaments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.username as creator_username, 
       COUNT(tp.user_id) as participant_count
       FROM tournaments t
       JOIN users u ON t.creator_user_id = u.user_id
       LEFT JOIN tournament_participants tp ON t.tournament_id = tp.tournament_id
       GROUP BY t.tournament_id, u.username
       ORDER BY t.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllTournaments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user's tournaments
 * @route GET /api/tournaments/my-tournaments
 * @access Private
 */
const getUserTournaments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get tournaments created by user
    const createdResult = await pool.query(
      `SELECT t.*, 'creator' as role, COUNT(tp.user_id) as participant_count
       FROM tournaments t
       LEFT JOIN tournament_participants tp ON t.tournament_id = tp.tournament_id
       WHERE t.creator_user_id = $1
       GROUP BY t.tournament_id
       ORDER BY t.created_at DESC`,
      [userId]
    );

    // Get tournaments user is participating in but didn't create
    const participatingResult = await pool.query(
      `SELECT t.*, 'participant' as role, COUNT(tp2.user_id) as participant_count
       FROM tournaments t
       JOIN tournament_participants tp ON t.tournament_id = tp.tournament_id
       LEFT JOIN tournament_participants tp2 ON t.tournament_id = tp2.tournament_id
       WHERE tp.user_id = $1 AND t.creator_user_id != $1
       GROUP BY t.tournament_id
       ORDER BY t.created_at DESC`,
      [userId]
    );

    // Combine results
    const tournaments = [
      ...createdResult.rows,
      ...participatingResult.rows
    ];

    res.json(tournaments);
  } catch (error) {
    console.error('Error in getUserTournaments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get tournament by ID
 * @route GET /api/tournaments/:tournamentId
 * @access Private
 */
const getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Get tournament details
    const tournamentResult = await pool.query(
      `SELECT t.*, u.username as creator_username
       FROM tournaments t
       JOIN users u ON t.creator_user_id = u.user_id
       WHERE t.tournament_id = $1`,
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const tournament = tournamentResult.rows[0];

    // Get participants
    const participantsResult = await pool.query(
      `SELECT u.user_id, u.username, tp.joined_at
       FROM tournament_participants tp
       JOIN users u ON tp.user_id = u.user_id
       WHERE tp.tournament_id = $1
       ORDER BY tp.joined_at ASC`,
      [tournamentId]
    );

    tournament.participants = participantsResult.rows;

    res.json(tournament);
  } catch (error) {
    console.error('Error in getTournamentById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new tournament
 * @route POST /api/tournaments
 * @access Private
 */
const createTournament = async (req, res) => {
  try {
    const { tournament_name, start_date, end_date } = req.body;
    const creator_user_id = req.user.id;

    // Validate input
    if (!tournament_name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Please provide tournament name, start date, and end date' });
    }

    // Generate unique tournament code
    const tournament_code = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create tournament
    const result = await pool.query(
      `INSERT INTO tournaments 
       (tournament_name, tournament_code, creator_user_id, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [tournament_name, tournament_code, creator_user_id, start_date, end_date]
    );

    const tournament = result.rows[0];

    // Add creator as participant
    await pool.query(
      `INSERT INTO tournament_participants (user_id, tournament_id)
       VALUES ($1, $2)`,
      [creator_user_id, tournament.tournament_id]
    );

    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error in createTournament:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Join a tournament
 * @route POST /api/tournaments/join
 * @access Private
 */
const joinTournament = async (req, res) => {
  try {
    const { tournament_code } = req.body;
    const userId = req.user.id;

    if (!tournament_code) {
      return res.status(400).json({ message: 'Please provide tournament code' });
    }

    // Find tournament by code
    const tournamentResult = await pool.query(
      'SELECT * FROM tournaments WHERE tournament_code = $1',
      [tournament_code]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found with the provided code' });
    }

    const tournament = tournamentResult.rows[0];

    // Check if user is already a participant
    const participantResult = await pool.query(
      'SELECT * FROM tournament_participants WHERE user_id = $1 AND tournament_id = $2',
      [userId, tournament.tournament_id]
    );

    if (participantResult.rows.length > 0) {
      return res.status(400).json({ message: 'You are already a participant in this tournament' });
    }

    // Add user as participant
    await pool.query(
      'INSERT INTO tournament_participants (user_id, tournament_id) VALUES ($1, $2)',
      [userId, tournament.tournament_id]
    );

    // Get user info for real-time notification
    const userResult = await pool.query(
      'SELECT username FROM users WHERE user_id = $1',
      [userId]
    );

    const username = userResult.rows[0].username;

    // Notify all participants in the tournament
    io.to(`tournament-${tournament.tournament_id}`).emit('tournament-update', {
      type: 'new-participant',
      tournamentId: tournament.tournament_id,
      message: `${username} has joined the tournament`,
      participant: {
        user_id: userId,
        username,
        joined_at: new Date()
      }
    });

    res.json({ 
      message: 'Successfully joined tournament',
      tournament
    });
  } catch (error) {
    console.error('Error in joinTournament:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get tournament leaderboard
 * @route GET /api/tournaments/:tournamentId/leaderboard
 * @access Private
 */
const getTournamentLeaderboard = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Verify tournament exists
    const tournamentResult = await pool.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Get all matches in the tournament date range
    const tournament = tournamentResult.rows[0];
    const matchesResult = await pool.query(
      `SELECT * FROM matches 
       WHERE match_date BETWEEN $1 AND $2
       ORDER BY match_date ASC`,
      [tournament.start_date, tournament.end_date]
    );

    const matches = matchesResult.rows;

    // Get all participants
    const participantsResult = await pool.query(
      `SELECT u.user_id, u.username
       FROM tournament_participants tp
       JOIN users u ON tp.user_id = u.user_id
       WHERE tp.tournament_id = $1`,
      [tournamentId]
    );

    const participants = participantsResult.rows;

    // Calculate points for each participant
    const leaderboard = await Promise.all(participants.map(async (participant) => {
      // Get user's team for this tournament
      const teamResult = await pool.query(
        `SELECT utt.team_id, uttp.ipl_player_id
         FROM user_tournament_teams utt
         JOIN user_tournament_team_players uttp ON utt.team_id = uttp.team_id
         WHERE utt.user_id = $1 AND utt.tournament_id = $2`,
        [participant.user_id, tournamentId]
      );

      const playerIds = teamResult.rows.map(row => row.ipl_player_id);
      
      // Calculate total points across all matches
      let totalPoints = 0;
      const matchPoints = [];

      for (const match of matches) {
        if (match.status === 'completed') {
          // Get fantasy points for the user's players in this match
          const pointsResult = await pool.query(
            `SELECT SUM(fantasy_points) as match_points
             FROM match_fantasy_points
             WHERE match_id = $1 AND ipl_player_id = ANY($2::int[])`,
            [match.match_id, playerIds]
          );

          const matchPoint = parseFloat(pointsResult.rows[0].match_points || 0);
          totalPoints += matchPoint;
          
          matchPoints.push({
            match_id: match.match_id,
            match_date: match.match_date,
            teams: `${match.team1} vs ${match.team2}`,
            points: matchPoint
          });
        }
      }

      return {
        user_id: participant.user_id,
        username: participant.username,
        total_points: totalPoints,
        match_points: matchPoints
      };
    }));

    // Sort leaderboard by total points (descending)
    leaderboard.sort((a, b) => b.total_points - a.total_points);

    // Add rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error in getTournamentLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTournaments,
  getUserTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  getTournamentLeaderboard
};
