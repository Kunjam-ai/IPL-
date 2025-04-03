require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { pool } = require('../database/init');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tournamentRoutes = require('./routes/tournaments');
const matchRoutes = require('./routes/matches');
const playerRoutes = require('./routes/players');
const pointsRoutes = require('./routes/points');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://ipl-fantasy-tracker.vercel.app'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/points', pointsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to IPL Fantasy League Tracker API' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join tournament room
  socket.on('join-tournament', (tournamentId) => {
    socket.join(`tournament-${tournamentId}`);
    console.log(`Socket ${socket.id} joined tournament-${tournamentId}`);
  });
  
  // Leave tournament room
  socket.on('leave-tournament', (tournamentId) => {
    socket.leave(`tournament-${tournamentId}`);
    console.log(`Socket ${socket.id} left tournament-${tournamentId}`);
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export socket.io instance for use in other files
module.exports.io = io;

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
