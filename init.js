require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Function to initialize the database
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Execute the schema SQL
      await client.query(schemaSQL);
      console.log('Database schema created successfully');
      
      // Insert some sample data for testing
      await insertSampleData(client);
      console.log('Sample data inserted successfully');
      
    } finally {
      // Release the client back to the pool
      client.release();
    }
    
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Function to insert sample data for testing
async function insertSampleData(client) {
  // Sample users (password is 'password123' hashed)
  await client.query(`
    INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@example.com', '$2b$10$rPiEAgQNIT1TCoQpZPX.VOLj2UUVjEIBzHIHdFMaGr2Kcet/3/0TG', 'admin'),
    ('user1', 'user1@example.com', '$2b$10$rPiEAgQNIT1TCoQpZPX.VOLj2UUVjEIBzHIHdFMaGr2Kcet/3/0TG', 'user'),
    ('user2', 'user2@example.com', '$2b$10$rPiEAgQNIT1TCoQpZPX.VOLj2UUVjEIBzHIHdFMaGr2Kcet/3/0TG', 'user')
    ON CONFLICT (username) DO NOTHING;
  `);
  
  // Sample IPL teams and players
  const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'PBKS', 'RR', 'SRH', 'GT', 'LSG'];
  
  // Insert sample IPL players
  for (const team of teams) {
    for (let i = 1; i <= 3; i++) {
      await client.query(`
        INSERT INTO ipl_players (player_name, team) VALUES
        ('${team} Player ${i}', '${team}')
        ON CONFLICT DO NOTHING;
      `);
    }
  }
  
  // Sample matches
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const matchDate = new Date(today);
    matchDate.setDate(today.getDate() + i);
    
    const team1 = teams[i % teams.length];
    const team2 = teams[(i + 1) % teams.length];
    
    await client.query(`
      INSERT INTO matches (match_date, team1, team2, venue, status) VALUES
      ($1, $2, $3, 'Stadium ${i+1}', $4)
      ON CONFLICT DO NOTHING;
    `, [matchDate, team1, team2, i === 0 ? 'completed' : 'scheduled']);
  }
  
  // Sample tournament
  await client.query(`
    INSERT INTO tournaments (tournament_name, tournament_code, creator_user_id, start_date, end_date) VALUES
    ('Test Tournament', 'TEST123', 1, $1, $2)
    ON CONFLICT DO NOTHING;
  `, [today, new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())]);
  
  // Sample tournament participants
  await client.query(`
    INSERT INTO tournament_participants (user_id, tournament_id) VALUES
    (1, 1), (2, 1), (3, 1)
    ON CONFLICT DO NOTHING;
  `);
}

// Export the pool and initialization function
module.exports = {
  pool,
  initializeDatabase
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}
