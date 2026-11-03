import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch {
        localStorage.removeItem('insurance-token');
        localStorage.removeItem('insurance-user');
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
  }

  async function register(details) {
    const { data } = await api.post('/auth/register', details);
    localStorage.setItem('insurance-token', data.token);
    localStorage.setItem('insurance-user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('insurance-token');
    localStorage.removeItem('insurance-user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
