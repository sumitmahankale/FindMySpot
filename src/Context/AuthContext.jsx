// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionQueries, setSessionQueries] = useState([]);
  
  // Initialize from localStorage/sessionStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const listerId = localStorage.getItem('listerId');
    const savedQueries = JSON.parse(sessionStorage.getItem('queries') || '[]');
    
    if (token && listerId) {
      setIsAuthenticated(true);
      setUser({ id: listerId });
    }
    
    if (savedQueries.length > 0) {
      setSessionQueries(savedQueries);
    }
  }, []);
  
  // Login function
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('listerId', userData.id);
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  // Logout function 
  const logout = () => {
    // Save current queries to session storage before logging out
    // This ensures queries remain available after logout
    localStorage.removeItem('token');
    localStorage.removeItem('listerId');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Update session queries
  const updateSessionQueries = (queries) => {
    setSessionQueries(queries);
    sessionStorage.setItem('queries', JSON.stringify(queries));
  };
  
  // Clear session queries
  const clearSessionQueries = () => {
    setSessionQueries([]);
    sessionStorage.removeItem('queries');
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      sessionQueries,
      updateSessionQueries,
      clearSessionQueries
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);