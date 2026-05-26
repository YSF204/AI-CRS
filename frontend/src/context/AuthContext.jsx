import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      // Only log out if the token is actually invalid (401).
      // Do NOT log out on 429 (rate-limited), 5xx, or network errors —
      // those are transient and should not destroy the session.
      if (err.response?.status === 401) {
        clearStoredToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    setStoredToken(token);
    setUser(userData);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  const updateUserState = (nextUser) => {
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: fetchUser,
        updateUserState,
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
