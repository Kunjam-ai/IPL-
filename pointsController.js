const { pool } = require('../../database/init');
const { io } = require('../server');

/**
 * Get fantasy points for a match
 * @route GET /api/points/match/:matchId
 * @access Private
 */
const getPointsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify match exists
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE match_id = $1',
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Get fantasy points for this match
    const pointsResult = await pool.query(
      `SELECT mfp.*, ip.player_name, ip.team
       FROM match_fantasy_points mfp
       JOIN ipl_players ip ON mfp.ipl_player_id = ip.ipl_player_id
       WHERE mfp.match_id = $1
       ORDER BY mfp.fantasy_points DESC`,
      [matchId]
    );

    res.json(pointsResult.rows);
  } catch (error) {
    console.error('Error in getPointsByMatch:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add or update fantasy points for a player in a match
 * @route POST /api/points
 * @access Private/Admin
 */
const addOrUpdatePoints = async (req, res) => {
  try {
    const { match_id, ipl_player_id, fantasy_points } = req.body;
    const entered_by_user_id = req.user.id;

    // Validate input
    if (!match_id || !ipl_player_id || fantasy_points === undefined) {
      return res.status(400).json({ message: 'Please provide match ID, player ID, and fantasy points' });
    }

    // Verify match exists
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE match_id = $1',
      [match_id]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Verify player exists
    const playerResult = await pool.query(
      'SELECT * FROM ipl_players WHERE ipl_player_id = $1',
      [ipl_player_id]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if points already exist for this player in this match
    const existingResult = await pool.query(
      'SELECT * FROM match_fantasy_points WHERE match_id = $1 AND ipl_player_id = $2',
      [match_id, ipl_player_id]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing points
      result = await pool.query(
        `UPDATE match_fantasy_points 
         SET fantasy_points = $1, entered_by_user_id = $2, entered_at = NOW()
         WHERE match_id = $3 AND ipl_player_id = $4
         RETURNING *`,
        [fantasy_points, entered_by_user_id, match_id, ipl_player_id]
      );
    } else {
      // Insert new points
      result = await pool.query(
        `INSERT INTO match_fantasy_points 
         (match_id, ipl_player_id, fantasy_points, entered_by_user_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [match_id, ipl_player_id, fantasy_points, entered_by_user_id]
      );
    }

    const pointsEntry = result.rows[0];

    // Get player details for the notification
    const player = playerResult.rows[0];

    // Notify all connected clients about the points update
    io.emit('points-update', {
      type: existingResult.rows.length > 0 ? 'points-updated' : 'points-added',
      match_id,
      player: {
        ipl_player_id: player.ipl_player_id,
        player_name: player.player_name,
        team: player.team
      },
      fantasy_points,
      updated_at: new Date()
    });

    // Find all tournaments that include this match date
    const tournamentsResult = await pool.query(
      `SELECT tournament_id FROM tournaments 
       WHERE start_date <= $1 AND end_date >= $1`,
      [matchResult.rows[0].match_date]
    );

    // Notify each tournament room about the update
    for (const tournament of tournamentsResult.rows) {
      io.to(`tournament-${tournament.tournament_id}`).emit('tournament-points-update', {
        tournament_id: tournament.tournament_id,
        match_id,
        player: {
          ipl_player_id: player.ipl_player_id,
          player_name: player.player_name,
          team: player.team
        },
        fantasy_points,
        updated_at: new Date()
      });
    }

    res.status(201).json(pointsEntry);
  } catch (error) {
    console.error('Error in addOrUpdatePoints:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get fantasy points for a player
 * @route GET /api/points/player/:playerId
 * @access Private
 */
const getPointsByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Verify player exists
    const playerResult = await pool.query(
      'SELECT * FROM ipl_players WHERE ipl_player_id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Get fantasy points for this player across all matches
    const pointsResult = await pool.query(
      `SELECT mfp.*, m.match_date, m.team1, m.team2, m.venue
       FROM match_fantasy_points mfp
       JOIN matches m ON mfp.match_id = m.match_id
       WHERE mfp.ipl_player_id = $1
       ORDER BY m.match_date DESC`,
      [playerId]
    );

    res.json(pointsResult.rows);
  } catch (error) {
    console.error('Error in getPointsByPlayer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Bulk add fantasy points for multiple players in a match
 * @route POST /api/points/bulk
 * @access Private/Admin
 */
const bulkAddPoints = async (req, res) => {
  try {
    const { match_id, points_data } = req.body;
    const entered_by_user_id = req.user.id;

    // Validate input
    if (!match_id || !points_data || !Array.isArray(points_data) || points_data.length === 0) {
      return res.status(400).json({ message: 'Please provide match ID and points data array' });
    }

    // Verify match exists
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE match_id = $1',
      [match_id]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const pointData of points_data) {
        const { ipl_player_id, fantasy_points } = pointData;

        // Verify player exists
        const playerResult = await client.query(
          'SELECT * FROM ipl_players WHERE ipl_player_id = $1',
          [ipl_player_id]
        );

        if (playerResult.rows.length === 0) {
          continue; // Skip invalid players
        }

        // Check if points already exist for this player in this match
        const existingResult = await client.query(
          'SELECT * FROM match_fantasy_points WHERE match_id = $1 AND ipl_player_id = $2',
          [match_id, ipl_player_id]
        );

        let result;
        if (existingResult.rows.length > 0) {
          // Update existing points
          result = await client.query(
            `UPDATE match_fantasy_points 
             SET fantasy_points = $1, entered_by_user_id = $2, entered_at = NOW()
             WHERE match_id = $3 AND ipl_player_id = $4
             RETURNING *`,
            [fantasy_points, entered_by_user_id, match_id, ipl_player_id]
          );
        } else {
          // Insert new points
          result = await client.query(
            `INSERT INTO match_fantasy_points 
             (match_id, ipl_player_id, fantasy_points, entered_by_user_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [match_id, ipl_player_id, fantasy_points, entered_by_user_id]
          );
        }

        results.push({
          ...result.rows[0],
          player_name: playerResult.rows[0].player_name,
          team: playerResult.rows[0].team
        });
      }

      await client.query('COMMIT');

      // Update match status to completed if not already
      await pool.query(
        `UPDATE matches SET status = 'completed' WHERE match_id = $1 AND status != 'completed'`,
        [match_id]
      );

      // Notify all connected clients about the bulk points update
      io.emit('points-bulk-update', {
        type: 'bulk-points-update',
        match_id,
        updated_at: new Date()
      });

      // Find all tournaments that include this match date
      const tournamentsResult = await pool.query(
        `SELECT tournament_id FROM tournaments 
         WHERE start_date <= $1 AND end_date >= $1`,
        [matchResult.rows[0].match_date]
      );

      // Notify each tournament room about the update
      for (const tournament of tournamentsResult.rows) {
        io.to(`tournament-${tournament.tournament_id}`).emit('tournament-leaderboard-update', {
          tournament_id: tournament.tournament_id,
          match_id,
          updated_at: new Date()
        });
      }

      res.status(201).json(results);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in bulkAddPoints:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPointsByMatch,
  addOrUpdatePoints,
  getPointsByPlayer,
  bulkAddPoints
};
