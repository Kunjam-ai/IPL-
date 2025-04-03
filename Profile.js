import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    tournamentsCreated: 0,
    tournamentsJoined: 0,
    totalPoints: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/auth/profile');
        setUser(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        
        // Fetch user stats
        const tournamentsResponse = await axios.get('http://localhost:5000/api/tournaments/my-tournaments');
        const tournaments = tournamentsResponse.data;
        
        setStats({
          tournamentsCreated: tournaments.filter(t => t.role === 'creator').length,
          tournamentsJoined: tournaments.filter(t => t.role === 'participant').length,
          totalPoints: tournaments.length // This is a placeholder, actual points calculation would be more complex
        });
        
        setError('');
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setUpdating(true);
      setError('');
      
      const userData = {
        username,
        email
      };
      
      if (password) {
        userData.password = password;
      }
      
      const response = await axios.put('http://localhost:5000/api/users/profile', userData);
      
      setUser(response.data);
      setSuccess('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
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
          <h1>Your Profile</h1>
          <p className="lead">Manage your account information and view your stats.</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Account Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password (leave blank to keep current)</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!password}
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Your Stats</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>Tournaments Created</td>
                    <td className="text-center">{stats.tournamentsCreated}</td>
                  </tr>
                  <tr>
                    <td>Tournaments Joined</td>
                    <td className="text-center">{stats.tournamentsJoined}</td>
                  </tr>
                  <tr>
                    <td>Total Tournaments</td>
                    <td className="text-center">{stats.tournamentsCreated + stats.tournamentsJoined}</td>
                  </tr>
                  <tr>
                    <td>Account Created</td>
                    <td className="text-center">{new Date(user?.created_at).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Role</td>
                    <td className="text-center">{user?.role === 'admin' ? 'Admin' : 'User'}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
