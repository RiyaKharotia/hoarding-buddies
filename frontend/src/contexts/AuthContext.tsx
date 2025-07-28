
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

export type UserRole = 'owner' | 'photographer' | 'client';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: File;
  phone?: string;
  location?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  companyName?: string;
  website?: string;
  address?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  updateUser: () => {},
});

// Demo account data for fallback
const demoAccounts = {
  'om@demo.com': {
    _id: '1',
    name: 'Om Raj',
    email: 'om@demo.com',
    role: 'owner' as UserRole,
    avatar: 'https://showitmax-api.onrender.com/uploads/users/om@demo.com-1743531614757.png',
    phone: '+91 98765 43210',
    location: 'Mumbai',
    companyName: 'ShowIt Media',
    website: 'www.showit.media',
    address: '123 Business Park, Mumbai'
  },
  'photo@demo.com': {
    _id: '2',
    name: 'Photo Grapher',
    email: 'photo@demo.com',
    role: 'photographer' as UserRole,
    avatar: 'https://showitmax-api.onrender.com/uploads/users/photo@demo.com-1743531685387.png',
    phone: '+91 87654 32109',
    location: 'Delhi'
  },
  'client@demo.com': {
    _id: '3',
    name: 'Client User',
    email: 'client@demo.com',
    role: 'client' as UserRole,
    avatar: 'https://i.pravatar.cc/150?u=client',
    phone: '+91 76543 21098',
    location: 'Bangalore',
    companyName: 'Client Corp',
    website: 'www.clientcorp.com',
    address: '456 Business Zone, Bangalore'
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const isLoading = loading;

  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedEmail = localStorage.getItem('userEmail');
      
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          // Try to fetch the user profile from the API
          await fetchUserProfile();
        } catch (err) {
          console.error("Failed to authenticate with stored token:", err);
          // If API fails and we have a demo email, use that
          if (storedEmail && storedEmail in demoAccounts) {
            setUser(demoAccounts[storedEmail as keyof typeof demoAccounts]);
            setIsAuthenticated(true);
            console.info('Using demo account data for:', storedEmail);
          } else {
            // Complete authentication failure
            logout();
          }
        }
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Update authorization header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      
      // Check if we can find a demo user based on the stored email in local storage
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail && storedEmail in demoAccounts) {
        setUser(demoAccounts[storedEmail as keyof typeof demoAccounts]);
        setIsAuthenticated(true);
        console.info('API profile fetch failed, using demo account');
      } else {
        throw err; // Rethrow to be handled by the caller
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if this is a demo account login
      if (email in demoAccounts) {
        console.info('Using demo account:', email);
        const mockToken = 'mock-token-for-development';
        const demoUser = demoAccounts[email as keyof typeof demoAccounts];
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userEmail', email);
        setToken(mockToken);
        setUser(demoUser);
        setIsAuthenticated(true);
        
        toast.success(`Welcome, ${demoUser.name}! (Demo Account)`);
        return;
      }
      
      // Real API login
      const response = await authService.login(email, password);
      
      if (response && response.data && response.data.token) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success(`Welcome, ${user.name}!`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed: ' + (err.response?.data?.message || err.message));
      toast.error('Login failed: ' + (err.response?.data?.message || err.message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Real API registration
      const response = await authService.register(userData);
      
      if (response && response.data && response.data.token) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', userData.email);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Registration successful!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Fall back to mock data if API fails
      console.info('API registration failed, using mock data as fallback');
      const mockToken = 'mock-token-for-development';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userEmail', userData.email);
      setToken(mockToken);
      
      setUser({
        _id: Math.random().toString(36).substring(2, 15),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar ? URL.createObjectURL(userData.avatar) : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.name,
        phone: userData.phone,
        location: userData.location,
      });
      
      setIsAuthenticated(true);
      toast.success('Registration successful! (Demo Mode)');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      register,
      logout, 
      isAuthenticated,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
