import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/tournaments/my-tournaments');
        setTournaments(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch tournaments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
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
          <h1>Welcome, {user?.username}!</h1>
          <p className="lead">Manage your IPL fantasy tournaments and track your progress.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <Card className="h-100">
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <Link to="/tournaments/create">
                  <Button variant="primary" className="w-100 mb-2">Create New Tournament</Button>
                </Link>
              </div>
              <div>
                <Link to="/tournaments/join">
                  <Button variant="outline-primary" className="w-100">Join Tournament</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Your Stats</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <h3>{tournaments.filter(t => t.role === 'creator').length}</h3>
                  <p className="text-muted">Created</p>
                </div>
                <div>
                  <h3>{tournaments.filter(t => t.role === 'participant').length}</h3>
                  <p className="text-muted">Joined</p>
                </div>
                <div>
                  <h3>{tournaments.length}</h3>
                  <p className="text-muted">Total</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Your Tournaments</Card.Header>
            {tournaments.length === 0 ? (
              <Card.Body>
                <p className="text-center mb-0">You haven't created or joined any tournaments yet.</p>
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {tournaments.map((tournament) => (
                  <ListGroup.Item key={tournament.tournament_id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{tournament.tournament_name}</h5>
                      <p className="text-muted mb-0 small">
                        {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg={tournament.role === 'creator' ? 'success' : 'info'} className="me-2">
                        {tournament.role === 'creator' ? 'Creator' : 'Participant'}
                      </Badge>
                      <Link to={`/tournaments/${tournament.tournament_id}`}>
                        <Button variant="outline-primary" size="sm">View</Button>
                      </Link>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
