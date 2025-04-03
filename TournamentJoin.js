import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TournamentJoin = () => {
  const [tournamentCode, setTournamentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:5000/api/tournaments/join', {
        tournament_code: tournamentCode
      });
      
      setSuccess('Successfully joined tournament!');
      
      // Navigate to the tournament after a short delay
      setTimeout(() => {
        navigate(`/tournaments/${response.data.tournament.tournament_id}`);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card className="p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Join Tournament</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tournament Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={tournamentCode}
                    onChange={(e) => setTournamentCode(e.target.value.toUpperCase())}
                    placeholder="Enter tournament code (e.g., ABC123)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter the tournament code provided by the tournament creator.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join Tournament'}
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

export default TournamentJoin;
