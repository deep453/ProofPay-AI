import { apiClient, USE_MOCK_DATA } from './api';
import { MOCK_PAYMENTS } from '../data/mockPayments';

export const paymentService = {
  async getPayments() {
    if (USE_MOCK_DATA) {
      return [...MOCK_PAYMENTS];
    }

    const response = await apiClient.get('/payments');
    return response.data;
  },

  async getPaymentById(id) {
    const list = await this.getPayments();
    const item = list.find(
      p => p.id === id || p.paymentReference === id
    );

    if (!item) {
      throw new Error('Payment record not found');
    }

    return item;
  }
};
