import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getError } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      async login(payload) {
        const { data } = await api.post('/auth/login', payload);
        setUser(data.data.user);
        return data;
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        return data;
      },
      async logout() {
        await api.post('/auth/logout');
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export { getError };
