-- Custom IPL Fantasy League Tracker Database Schema

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- IPL Players Table
CREATE TABLE ipl_players (
    ipl_player_id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    team VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    team1 VARCHAR(50) NOT NULL,
    team2 VARCHAR(50) NOT NULL,
    venue VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments Table
CREATE TABLE tournaments (
    tournament_id SERIAL PRIMARY KEY,
    tournament_name VARCHAR(100) NOT NULL,
    tournament_code VARCHAR(20) UNIQUE NOT NULL,
    creator_user_id INTEGER NOT NULL REFERENCES users(user_id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Participants Table (Many-to-Many relationship between Users and Tournaments)
CREATE TABLE tournament_participants (
    participation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    tournament_id INTEGER NOT NULL REFERENCES tournaments(tournament_id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tournament_id)
);

-- Match Fantasy Points Table
CREATE TABLE match_fantasy_points (
    point_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(match_id),
    ipl_player_id INTEGER NOT NULL REFERENCES ipl_players(ipl_player_id),
    fantasy_points DECIMAL(10, 2) NOT NULL,
    entered_by_user_id INTEGER NOT NULL REFERENCES users(user_id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, ipl_player_id)
);

-- User Tournament Teams Table (Optional: Store user's fantasy team composition for the tournament)
CREATE TABLE user_tournament_teams (
    team_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    tournament_id INTEGER NOT NULL REFERENCES tournaments(tournament_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tournament_id)
);

-- User Tournament Team Players Table (Many-to-Many relationship between User Tournament Teams and IPL Players)
CREATE TABLE user_tournament_team_players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES user_tournament_teams(team_id),
    ipl_player_id INTEGER NOT NULL REFERENCES ipl_players(ipl_player_id),
    UNIQUE(team_id, ipl_player_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX idx_match_fantasy_points_match_id ON match_fantasy_points(match_id);
CREATE INDEX idx_match_fantasy_points_player_id ON match_fantasy_points(ipl_player_id);
CREATE INDEX idx_user_tournament_teams_tournament_id ON user_tournament_teams(tournament_id);
CREATE INDEX idx_user_tournament_teams_user_id ON user_tournament_teams(user_id);
