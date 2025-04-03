import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-auto">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} IPL Fantasy League Tracker | All Rights Reserved
            </p>
            <p className="text-muted small mb-0">
              Developed with React, Node.js, and PostgreSQL
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
