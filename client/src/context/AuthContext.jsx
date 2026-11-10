import { useState } from 'react';
import { authService } from '../services/authService';

import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      setToken(result.token);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const switchRole = (role, userId) => {
    const newUser = authService.switchMockRole(role, userId);
    setUser(newUser);
    return newUser;
  };

  const value = {
    user,
    role: user?.role || 'client',
    token,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    switchRole,
    demoAccounts: authService.getMockAccounts()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
