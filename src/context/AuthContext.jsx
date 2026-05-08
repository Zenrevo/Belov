import { useEffect, useMemo, useState } from 'react';
import { authApi, clearToken, getToken, setToken } from '../lib/api';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      return () => { active = false; };
    }

    authApi.me()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        clearToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const requestOtp = (payload) => authApi.requestOtp(payload);

  const verifyOtp = async (payload) => {
    const response = await authApi.verifyOtp(payload);
    setToken(response.accessToken);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    requestOtp,
    verifyOtp,
    logout
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
