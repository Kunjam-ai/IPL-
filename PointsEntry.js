import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Modal, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const PointsEntry = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

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

  const fetchPlayers = async (team) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/players/team/${team}`);
      setPlayers(response.data);
      
      // Initialize points data for each player
      const initialPointsData = response.data.map(player => ({
        ipl_player_id: player.ipl_player_id,
        player_name: player.player_name,
        team: player.team,
        fantasy_points: 0
      }));
      
      setPointsData(initialPointsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch players');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingPoints = async (matchId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/points/match/${matchId}`);
      
      // If there are existing points, update the pointsData
      if (response.data.length > 0) {
        const existingPoints = response.data;
        
        // Update points data with existing values
        setPointsData(prevData => {
          return prevData.map(player => {
            const existingPoint = existingPoints.find(p => p.ipl_player_id === player.ipl_player_id);
            if (existingPoint) {
              return {
                ...player,
                fantasy_points: existingPoint.fantasy_points
              };
            }
            return player;
          });
        });
      }
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch existing points:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setSelectedTeam('');
    setPlayers([]);
    setPointsData([]);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    fetchPlayers(team);
    
    if (selectedMatch) {
      fetchExistingPoints(selectedMatch.match_id);
    }
  };

  const handlePointsChange = (playerId, points) => {
    setPointsData(prevData => {
      return prevData.map(player => {
        if (player.ipl_player_id === playerId) {
          return {
            ...player,
            fantasy_points: parseFloat(points) || 0
          };
        }
        return player;
      });
    });
  };

  const handleSubmitPoints = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Filter out players with zero points if needed
      const pointsToSubmit = pointsData.filter(player => player.fantasy_points > 0);
      
      if (pointsToSubmit.length === 0) {
        setError('Please enter points for at least one player');
        setSubmitting(false);
        return;
      }
      
      // Format data for bulk submission
      const bulkData = {
        match_id: selectedMatch.match_id,
        points_data: pointsToSubmit.map(player => ({
          ipl_player_id: player.ipl_player_id,
          fantasy_points: player.fantasy_points
        }))
      };
      
      // Submit points in bulk
      await axios.post('http://localhost:5000/api/points/bulk', bulkData);
      
      setSuccess('Fantasy points submitted successfully!');
      
      // Refresh match data to update status
      fetchMatches();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit fantasy points');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && matches.length === 0) {
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
          <h1>Fantasy Points Entry</h1>
          <p className="lead">Enter fantasy points for IPL players after matches.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Select Match</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {matches.length > 0 ? (
                <div className="list-group">
                  {matches.map((match) => (
                    <button
                      key={match.match_id}
                      className={`list-group-item list-group-item-action ${selectedMatch?.match_id === match.match_id ? 'active' : ''}`}
                      onClick={() => handleMatchSelect(match)}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{match.team1} vs {match.team2}</h6>
                        <small className={`badge bg-${match.status === 'completed' ? 'success' : 'primary'}`}>
                          {match.status}
                        </small>
                      </div>
                      <small>{new Date(match.match_date).toLocaleDateString()}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center">No matches available.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {selectedMatch ? (
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  Enter Points: {selectedMatch.team1} vs {selectedMatch.team2}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select Team</Form.Label>
                  <Form.Select
                    value={selectedTeam}
                    onChange={(e) => handleTeamSelect(e.target.value)}
                  >
                    <option value="">Select a team</option>
                    <option value={selectedMatch.team1}>{selectedMatch.team1}</option>
                    <option value={selectedMatch.team2}>{selectedMatch.team2}</option>
                  </Form.Select>
                </Form.Group>

                {selectedTeam && (
                  <>
                    <Table striped bordered responsive>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Team</th>
                          <th>Fantasy Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointsData.map((player) => (
                          <tr key={player.ipl_player_id}>
                            <td>{player.player_name}</td>
                            <td>{player.team}</td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.5"
                                min="0"
                                value={player.fantasy_points}
                                onChange={(e) => handlePointsChange(player.ipl_player_id, e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        onClick={handleSubmitPoints}
                        disabled={submitting || pointsData.length === 0}
                      >
                        {submitting ? 'Submitting...' : 'Submit Fantasy Points'}
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center">
                <p>Select a match to enter fantasy points.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PointsEntry;
