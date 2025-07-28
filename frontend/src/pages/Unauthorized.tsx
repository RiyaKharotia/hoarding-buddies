
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine where to redirect the user based on their role
  const getRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'owner':
        return '/dashboard';
      case 'photographer':
        return '/photographer';
      case 'client':
        return '/client';
      default:
        return '/login';
    }
  };
  
  const handleRedirect = () => {
    navigate(getRedirectPath());
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-brand-purple">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. Please contact an administrator if you 
          believe this is a mistake.
        </p>
        <Button onClick={handleRedirect}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
