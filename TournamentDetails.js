import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const TournamentDetails = () => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join tournament room for real-time updates
    newSocket.emit('join-tournament', id);

    // Clean up socket connection on component unmount
    return () => {
      newSocket.emit('leave-tournament', id);
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (socket) {
      // Listen for tournament updates
      socket.on('tournament-update', (data) => {
        if (data.tournamentId === parseInt(id)) {
          // Refresh tournament data when updates occur
          fetchTournamentData();
        }
      });

      // Listen for points updates
      socket.on('tournament-points-update', (data) => {
        if (data.tournament_id === parseInt(id)) {
          // Refresh tournament data when points are updated
          fetchTournamentData();
        }
      });

      // Listen for leaderboard updates
      socket.on('tournament-leaderboard-update', (data) => {
        if (data.tournament_id === parseInt(id)) {
          // Refresh tournament data when leaderboard is updated
          fetchTournamentData();
        }
      });
    }
  }, [socket, id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
      setTournament(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tournament details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Tournament not found</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>{tournament.tournament_name}</h1>
            <Link to={`/tournaments/${id}/leaderboard`}>
              <Button variant="primary">View Leaderboard</Button>
            </Link>
          </div>
          <p className="lead">
            <Badge bg="info" className="me-2">Tournament Code: {tournament.tournament_code}</Badge>
            <Badge bg="secondary" className="me-2">
              {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
            </Badge>
            <Badge bg="dark">Created by: {tournament.creator_username}</Badge>
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tabs defaultActiveKey="participants" className="mb-3">
            <Tab eventKey="participants" title="Participants">
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Tournament Participants</h5>
                    <span className="badge bg-primary">{tournament.participants?.length || 0} Participants</span>
                  </div>
                </Card.Header>
                {tournament.participants?.length > 0 ? (
                  <ListGroup variant="flush">
                    {tournament.participants.map((participant, index) => (
                      <ListGroup.Item key={participant.user_id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">{participant.username}</h6>
                          <small className="text-muted">Joined: {new Date(participant.joined_at).toLocaleDateString()}</small>
                        </div>
                        {participant.user_id === tournament.creator_user_id && (
                          <Badge bg="success">Creator</Badge>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Card.Body>
                    <p className="text-center mb-0">No participants yet.</p>
                  </Card.Body>
                )}
              </Card>
            </Tab>
            <Tab eventKey="info" title="Tournament Info">
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>Tournament Details</h5>
                      <p><strong>Name:</strong> {tournament.tournament_name}</p>
                      <p><strong>Code:</strong> {tournament.tournament_code}</p>
                      <p><strong>Creator:</strong> {tournament.creator_username}</p>
                      <p><strong>Start Date:</strong> {new Date(tournament.start_date).toLocaleDateString()}</p>
                      <p><strong>End Date:</strong> {new Date(tournament.end_date).toLocaleDateString()}</p>
                      <p><strong>Created:</strong> {new Date(tournament.created_at).toLocaleDateString()}</p>
                    </Col>
                    <Col md={6}>
                      <h5>How to Play</h5>
                      <p>Share the tournament code <strong>{tournament.tournament_code}</strong> with friends to invite them to join.</p>
                      <p>Points are automatically calculated based on player performance in IPL matches.</p>
                      <p>Check the leaderboard regularly to see your ranking.</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default TournamentDetails;
