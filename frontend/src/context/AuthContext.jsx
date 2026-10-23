import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isDemoAlex = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'alex';
  const initialDemoUser = isDemoAlex ? {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex_candidate@mockmate.ai',
    target_role: 'Software Developer'
  } : null;

  const [user, setUser] = useState(initialDemoUser);
  const [token, setToken] = useState(() => (isDemoAlex ? 'demo_active_token' : localStorage.getItem('mockmate_token') || null));
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify stored token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === 'alex') {
        try {
          const data = await authApi.login({
            email: 'alex_candidate@mockmate.ai',
            password: 'SecurePassword123!',
          });
          localStorage.setItem('mockmate_token', data.access_token);
          setToken(data.access_token);
          setUser(data.user);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Auto demo login error:', err);
        }
      }

      const storedToken = localStorage.getItem('mockmate_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signup = async (name, email, password) => {
    setAuthError(null);
    try {
      const data = await authApi.signup({ name, email, password });
      localStorage.setItem('mockmate_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('mockmate_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('mockmate_token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        authError,
        setAuthError,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
