
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'admin' | 'student') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, userType: 'admin' | 'student') => {
    setIsLoading(true);
    
    try {
      // Demo authentication logic
      let userData: User | null = null;
      
      if (userType === 'admin' && email === 'admin@vignanits.ac.in' && password === 'admin123') {
        userData = {
          id: 'admin-1',
          email: 'admin@vignanits.ac.in',
          role: 'admin',
          name: 'Admin User'
        };
      } else if (userType === 'student' && email === 'student@vignanits.ac.in' && password === 'student123') {
        userData = {
          id: 'student-1',
          email: 'student@vignanits.ac.in',
          role: 'student',
          name: 'John Doe'
        };
      }

      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect based on role
        if (userData.role === 'admin') {
          setLocation('/admin-dashboard');
        } else {
          setLocation('/student-dashboard');
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setLocation('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
