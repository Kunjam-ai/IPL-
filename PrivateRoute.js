import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children, adminRequired = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminRequired && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
