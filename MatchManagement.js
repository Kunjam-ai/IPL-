import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';

const MatchManagement = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMatch, setNewMatch] = useState({
    match_date: '',
    team1: '',
    team2: '',
    venue: '',
    status: 'scheduled'
  });
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/matches');
      setMatches(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players/teams');
      setTeams(response.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatch({
      ...newMatch,
      [name]: value
    });
  };

  const handleAddMatch = async () => {
    try {
      setSubmitting(true);
      await axios.post('http://localhost:5000/api/matches', newMatch);
      setShowAddModal(false);
      setNewMatch({
        match_date: '',
        team1: '',
        team2: '',
        venue: '',
        status: 'scheduled'
      });
      fetchMatches();
    } catch (err) {
      setError('Failed to add match');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (matchId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/matches/${matchId}`, { status: newStatus });
      fetchMatches();
    } catch (err) {
      setError('Failed to update match status');
      console.error(err);
    }
  };

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
          <div className="d-flex justify-content-between align-items-center">
            <h1>Match Management</h1>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add New Match
            </Button>
          </div>
          <p className="lead">Manage IPL matches and their status.</p>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Matches</h5>
            </Card.Header>
            <Card.Body>
              {matches.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Teams</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.match_id}>
                        <td>{new Date(match.match_date).toLocaleDateString()}</td>
                        <td>{match.team1} vs {match.team2}</td>
                        <td>{match.venue}</td>
                        <td>
                          <span className={`badge bg-${match.status === 'completed' ? 'success' : match.status === 'scheduled' ? 'primary' : 'warning'}`}>
                            {match.status}
                          </span>
                        </td>
                        <td>
                          {match.status === 'scheduled' && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(match.match_id, 'completed')}
                              className="me-2"
                            >
                              Mark Completed
                            </Button>
                          )}
                          {match.status === 'completed' && (
                            <Button 
                              variant="warning" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(match.match_id, 'scheduled')}
                            >
                              Reopen
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No matches found. Add a new match to get started.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Match Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Match</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Match Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="match_date"
                value={newMatch.match_date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Team 1</Form.Label>
              <Form.Select
                name="team1"
                value={newMatch.team1}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Team 2</Form.Label>
              <Form.Select
                name="team2"
                value={newMatch.team2}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Control
                type="text"
                name="venue"
                value={newMatch.venue}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={newMatch.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddMatch}
            disabled={submitting || !newMatch.match_date || !newMatch.team1 || !newMatch.team2 || !newMatch.venue}
          >
            {submitting ? 'Adding...' : 'Add Match'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MatchManagement;
