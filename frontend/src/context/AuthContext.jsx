import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { tokenStore } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { _id, name, email, role: 'teacher' | 'admin' }
  const [loading, setLoading] = useState(true);

  // Restore session on first load.
  useEffect(() => {
    const restore = async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};