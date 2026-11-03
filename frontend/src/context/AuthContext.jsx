import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('insurance-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          localStorage.removeItem('insurance-token');
          localStorage.removeItem('insurance-user');
        } else {
          setAuthError(requestError.response?.data?.message || 'Could not verify your saved session. Check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('insurance-token', data.token);
    localStorage.setItem('insurance-user', JSON.stringify(data.user));
    setUser(data.user);
    setAuthError('');
  }

  async function register(details) {
    const { data } = await api.post('/auth/register', details);
    localStorage.setItem('insurance-token', data.token);
    localStorage.setItem('insurance-user', JSON.stringify(data.user));
    setUser(data.user);
    setAuthError('');
  }

  function logout() {
    localStorage.removeItem('insurance-token');
    localStorage.removeItem('insurance-user');
    setUser(null);
    setAuthError('');
  }

  const value = useMemo(() => ({ user, loading, authError, login, register, logout }), [user, loading, authError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
