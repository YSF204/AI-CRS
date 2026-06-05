import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback((token, userData) => {
    setStoredToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const updateUserState = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshUser: fetchUser,
    updateUserState,
  }), [user, loading, login, logout, fetchUser, updateUserState]);

  return (
    <AuthContext.Provider value={value}>
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
