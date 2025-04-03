import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
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
      // Listen for leaderboard updates
      socket.on('tournament-leaderboard-update', (data) => {
        if (data.tournament_id === parseInt(id)) {
          // Refresh leaderboard data when updates occur
          fetchLeaderboardData();
        }
      });
    }
  }, [socket, id]);

  const fetchTournamentData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
      setTournament(response.data);
    } catch (err) {
      console.error('Failed to fetch tournament details:', err);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/tournaments/${id}/leaderboard`);
      setLeaderboard(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
    fetchLeaderboardData();
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

  // Prepare data for chart
  const chartData = {
    labels: leaderboard.map(entry => entry.username),
    datasets: [
      {
        label: 'Total Points',
        data: leaderboard.map(entry => entry.total_points),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tournament Points Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Tournament Leaderboard</h1>
          {tournament && (
            <p className="lead">
              <Badge bg="info" className="me-2">{tournament.tournament_name}</Badge>
              <Badge bg="secondary">
                {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
              </Badge>
            </p>
          )}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Current Standings</h5>
            </Card.Header>
            <Card.Body>
              {leaderboard.length > 0 ? (
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.user_id}>
                        <td>
                          <Badge bg={entry.rank === 1 ? 'warning' : entry.rank === 2 ? 'secondary' : entry.rank === 3 ? 'danger' : 'light text-dark'}>
                            {entry.rank}
                          </Badge>
                        </td>
                        <td>{entry.username}</td>
                        <td>{entry.total_points.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No data available yet. Leaderboard will update as matches are played.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {leaderboard.length > 0 && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Points Visualization</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '400px' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Leaderboard;
