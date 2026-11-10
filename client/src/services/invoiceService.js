import { apiClient, USE_MOCK_DATA } from './api';
import { MOCK_INVOICES } from '../data/mockInvoices';

const INVOICES_STORAGE_KEY = 'proofpay_invoices_cache';

function getStoredInvoices() {
  const cached = localStorage.getItem(INVOICES_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Use the initial mock data if the cache is invalid.
    }
  }

  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(MOCK_INVOICES));
  return [...MOCK_INVOICES];
}

export const invoiceService = {
  async getInvoices() {
    if (USE_MOCK_DATA) {
      return getStoredInvoices();
    }

    const response = await apiClient.get('/invoices');
    return response.data;
  },

  async getPayPalInvoiceDetails(milestoneId) {
    if (USE_MOCK_DATA) {
      const invoice = await this.getInvoiceById(milestoneId);
      return { invoiceUrl: invoice.paypalViewUrl || null };
    }

    const response = await apiClient.get(
      `/milestones/${milestoneId}/invoice`
    );

    return response.data;
  },
  async getInvoiceById(id) {
    const list = await this.getInvoices();
    const item = list.find(
      (inv) => inv.id === id || inv.paypalInvoiceId === id
    );

    if (!item) throw new Error('Invoice not found');
    return item;
  }
};
