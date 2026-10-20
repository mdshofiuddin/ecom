import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setCsrfToken, clearCsrfToken } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await apiRequest('/api/auth/me');
      setUser(data.user);
      setIsAdmin(data.isAdmin);
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setUser(res.user);
    setIsAdmin(res.user.role === 'admin');
    if (res.csrfToken) {
      setCsrfToken(res.csrfToken);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setUser(res.user);
    setIsAdmin(res.user.role === 'admin');
    if (res.csrfToken) {
      setCsrfToken(res.csrfToken);
    }
    return res;
  };

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsAdmin(false);
    clearCsrfToken();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
