import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>IPL Fantasy League Tracker</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <LinkContainer to="/">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Tournaments" id="tournaments-dropdown">
                  <LinkContainer to="/tournaments/create">
                    <NavDropdown.Item>Create Tournament</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/tournaments/join">
                    <NavDropdown.Item>Join Tournament</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
                {isAdmin && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <LinkContainer to="/admin">
                      <NavDropdown.Item>Admin Dashboard</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/matches">
                      <NavDropdown.Item>Match Management</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/points">
                      <NavDropdown.Item>Points Entry</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )}
                <NavDropdown title={user?.username || 'User'} id="user-dropdown">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
