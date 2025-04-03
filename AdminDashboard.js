import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTournaments: 0,
    totalMatches: 0,
    totalPlayers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users count
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        
        // Fetch tournaments count
        const tournamentsResponse = await axios.get('http://localhost:5000/api/tournaments');
        
        // Fetch matches count
        const matchesResponse = await axios.get('http://localhost:5000/api/matches');
        
        // Fetch players count
        const playersResponse = await axios.get('http://localhost:5000/api/players');
        
        setStats({
          totalUsers: usersResponse.data.length,
          totalTournaments: tournamentsResponse.data.length,
          totalMatches: matchesResponse.data.length,
          totalPlayers: playersResponse.data.length
        });
        
        setError('');
      } catch (err) {
        setError('Failed to fetch admin statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Admin Dashboard</h1>
          <p className="lead">Manage the IPL Fantasy League system.</p>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2>{stats.totalUsers}</h2>
              <p className="text-muted">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2>{stats.totalTournaments}</h2>
              <p className="text-muted">Tournaments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2>{stats.totalMatches}</h2>
              <p className="text-muted">Matches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2>{stats.totalPlayers}</h2>
              <p className="text-muted">IPL Players</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Admin Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Button variant="primary" className="w-100" href="/admin/matches">
                    Manage Matches
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button variant="success" className="w-100" href="/admin/points">
                    Enter Fantasy Points
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button variant="info" className="w-100" href="/">
                    View Dashboard
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
