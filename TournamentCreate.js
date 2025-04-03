import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const TournamentCreate = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return setError('End date must be after start date');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:5000/api/tournaments', {
        tournament_name: tournamentName,
        start_date: startDate,
        end_date: endDate
      });
      
      setSuccess('Tournament created successfully!');
      
      // Navigate to the new tournament after a short delay
      setTimeout(() => {
        navigate(`/tournaments/${response.data.tournament_id}`);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Create New Tournament</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tournament Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter a name for your tournament"
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Tournament'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TournamentCreate;
