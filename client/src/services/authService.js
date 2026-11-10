import { apiClient, USE_MOCK_DATA } from './api';
import { MOCK_CLIENTS, MOCK_DEVELOPERS, ALL_USERS, DEFAULT_CLIENT } from '../data/mockUsers';

const USER_STORAGE_KEY = 'proofpay_user';
const TOKEN_STORAGE_KEY = 'proofpay_token';

export const authService = {
  async login(email, password) {
    if (USE_MOCK_DATA) {
      // Find matching mock user by email
      const normalizedEmail = (email || '').trim().toLowerCase();
      const matchedUser = ALL_USERS.find(u => u.email.toLowerCase() === normalizedEmail) || DEFAULT_CLIENT;
      
      const mockToken = `mock_jwt_${matchedUser.id}_${Date.now()}`;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(matchedUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);

      return {
        user: matchedUser,
        token: mockToken,
        isMock: true
      };
    }

    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    return { user, token, isMock: false };
  },

  async register(userData) {
    if (USE_MOCK_DATA) {
      const newUser = {
        id: `usr_${userData.role.slice(0, 1)}_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company: userData.company || (userData.role === 'client' ? 'Client Org' : undefined),
        githubUsername: userData.githubUsername || (userData.role === 'developer' ? userData.email.split('@')[0] : undefined),
        createdAt: new Date().toISOString()
      };
      
      const mockToken = `mock_jwt_${newUser.id}_${Date.now()}`;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);

      return {
        user: newUser,
        token: mockToken,
        isMock: true
      };
    }

    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser() {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUser) {
      // Default to Sarah Chen in mock mode if nothing stored yet
      if (USE_MOCK_DATA) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_CLIENT));
        localStorage.setItem(TOKEN_STORAGE_KEY, 'mock_jwt_default');
        return DEFAULT_CLIENT;
      }
      return null;
    }
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  // Mock-specific convenience to quickly switch between demo roles
  switchMockRole(role, userId) {
    let targetUser;
    if (userId) {
      targetUser = ALL_USERS.find(u => u.id === userId);
    } else if (role === 'client') {
      targetUser = MOCK_CLIENTS[0];
    } else {
      targetUser = MOCK_DEVELOPERS[0];
    }

    if (targetUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(targetUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, `mock_jwt_${targetUser.id}`);
    }
    return targetUser;
  },

  getMockAccounts() {
    return {
      clients: MOCK_CLIENTS,
      developers: MOCK_DEVELOPERS
    };
  }
};
