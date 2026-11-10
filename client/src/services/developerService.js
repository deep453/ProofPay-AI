import { apiClient } from './api';

export const developerService = {
  async getDevelopers() {
    const response = await apiClient.get('/users/developers');
    return response.data;
  }
};
