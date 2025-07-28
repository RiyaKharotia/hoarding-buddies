
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from "sonner";

const Login = () => {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginInProgress, setLoginInProgress] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      const redirectPath = 
        user.role === 'owner' ? '/dashboard' :
        user.role === 'photographer' ? '/photographer' :
        '/client';
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setLoginInProgress(true);
    
    try {
      await login(email, password);
      // Redirect happens in the useEffect
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the auth context
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleDemoLogin = async (role: 'owner' | 'photographer' | 'client') => {
    const demoCredentials = {
      owner: { email: 'om@demo.com', password: 'password123' },
      photographer: { email: 'photo@demo.com', password: 'password123' },
      client: { email: 'client@demo.com', password: 'password123' }
    };
    
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
    
    setLoginInProgress(true);
    
    try {
      await login(demoCredentials[role].email, demoCredentials[role].password);
      // Redirect happens in the useEffect
    } catch (error) {
      console.error('Demo login error:', error);
      // Error is already handled in the auth context
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Forgot password functionality not implemented yet");
  };
  
  const navigateToRegister = () => {
    navigate('/register');
  };

  // If global auth loading is true, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-r from-brand-blue to-brand-purple rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
            <span className="text-xl font-bold">Show It Max</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-brand-blue hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginInProgress}
              >
                {loginInProgress ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full mb-2">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={navigateToRegister} 
                className="text-brand-blue hover:underline"
              >
                Sign up
              </button>
            </div>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Demo Accounts
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('owner')}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('photographer')}
              >
                Photographer
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('client')}
              >
                Client
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
