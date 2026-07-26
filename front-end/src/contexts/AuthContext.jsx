/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import authService from "../services/authService";
import { ROLE_PERMISSIONS } from "../constants/permissions";

const AuthContext = createContext(undefined);

const TOKEN_KEY = "ats_token";
const USER_KEY = "ats_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const isBootstrapping = false;

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await authService.login(credentials);
      const { token: newToken, user: newUser } = data.data;
      persistSession(newToken, newUser);
      return newUser;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasRole = useCallback(
    (...roles) => !!user?.role && roles.includes(user.role),
    [user]
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user?.role) return false;
      return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isBootstrapping,
      login,
      logout,
      hasRole,
      hasPermission,
      setUser,
      persistSession,
      clearSession,
    }),
    [user, token, isBootstrapping, login, logout, hasRole, hasPermission, persistSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
