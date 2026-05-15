import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, clearToken, getToken, setToken } from '../lib/api';
import { AuthContext } from './auth-context';
import { useNotifications } from './useNotifications';

export const AuthProvider = ({ children }) => {
  const { notify } = useNotifications();
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

  const requestOtp = useCallback(async (payload) => {
    const response = await authApi.requestOtp(payload);
    notify({
      variant: 'info',
      title: 'OTP sent',
      message: `Check ${payload.channel === 'phone' ? 'your mobile' : 'your email'} to continue.`
    });
    return response;
  }, [notify]);

  const verifyOtp = useCallback(async (payload) => {
    const response = await authApi.verifyOtp(payload);
    setToken(response.accessToken);
    setUser(response.user);
    notify({
      title: payload.purpose === 'register' ? 'Account created' : 'Logged in',
      message: 'Your fit profile is active.'
    });
    return response;
  }, [notify]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    notify({
      variant: 'info',
      title: 'Logged out',
      message: 'Your session has ended.'
    });
  }, [notify]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    requestOtp,
    verifyOtp,
    logout
  }), [user, loading, requestOtp, verifyOtp, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
