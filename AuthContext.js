import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Set up axios defaults when user changes
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Register user
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      const userData = response.data;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setLoading(false);
      
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const userData = response.data;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setLoading(false);
      
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put('http://localhost:5000/api/users/profile', userData);
      
      const updatedUser = {
        ...user,
        ...response.data
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setLoading(false);
      
      return updatedUser;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
