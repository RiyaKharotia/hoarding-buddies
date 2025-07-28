
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If authenticated, redirect based on user role
  if (isAuthenticated && user) {
    const redirectPath = 
      user.role === 'owner' ? '/dashboard' :
      user.role === 'photographer' ? '/photographer' :
      '/client';
    
    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default Index;
