import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Auth Components
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

// Main Components
import Dashboard from './pages/Dashboard';
import TournamentCreate from './pages/TournamentCreate';
import TournamentJoin from './pages/TournamentJoin';
import TournamentDetails from './pages/TournamentDetails';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import MatchManagement from './pages/admin/MatchManagement';
import PointsEntry from './pages/admin/PointsEntry';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Context Provider
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Container className="py-4 main-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private Routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/tournaments/create" element={<PrivateRoute><TournamentCreate /></PrivateRoute>} />
            <Route path="/tournaments/join" element={<PrivateRoute><TournamentJoin /></PrivateRoute>} />
            <Route path="/tournaments/:id" element={<PrivateRoute><TournamentDetails /></PrivateRoute>} />
            <Route path="/tournaments/:id/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute adminRequired={true}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/matches" element={<PrivateRoute adminRequired={true}><MatchManagement /></PrivateRoute>} />
            <Route path="/admin/points" element={<PrivateRoute adminRequired={true}><PointsEntry /></PrivateRoute>} />
            
            {/* Redirect to dashboard for any unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
