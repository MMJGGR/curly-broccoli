import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    // No token, redirect to auth
    return <Navigate to="/auth" replace />;
  }
  
  // Token exists, render the protected component
  return children;
};

export default PrivateRoute;