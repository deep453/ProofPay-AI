import axios from 'axios';

// Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

// Central Axios Client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('proofpay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network request failed';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response
    });
  }
);

/*
 * =========================================================================
 * BACKEND ENDPOINT MAPPING & SCHEMA VERIFICATION STATUS
 * =========================================================================
 * 1. GET /health
 *    - Purpose: Health check
 *    - Auth: None
 * 
 * 2. POST /api/auth/register
 *    - Payload: { name: string, email: string, password: string (12-72), role: 'client'|'developer' }
 *    - Response: { message, user: { id, name, email, role } }
 * 
 * 3. POST /api/auth/login
 *    - Payload: { email: string, password: string }
 *    - Response: { message, token, expiresIn, user: { id, name, email, role } }
 * 
 * 4. GET /api/auth/me
 *    - Auth: Bearer JWT
 *    - Response: { id, name, email, role }
 * 
 * 5. GET /api/milestones
 *    - Auth: Bearer JWT
 *    - Response: Milestone[]
 * 
 * 6. POST /api/milestones
 *    - Auth: Bearer JWT (role: client)
 *    - Payload: { title, description, githubRepo (owner/repo), amount, currency, developerEmail, acceptanceCriteria: [{ title, description }] }
 *    - Response: Created Milestone
 * 
 * 7. POST /api/milestones/:id/verify
 *    - Auth: Bearer JWT (role: developer)
 *    - Precondition: milestone.status === 'verifying'
 *    - Response: { message, milestoneId, status: 'evidence_ready', evidenceReport }
 * 
 * 8. PATCH /api/milestones/:id/action
 *    - Auth: Bearer JWT
 *    - Client Actions: 'client_approve' (requires acknowledgeInconclusive: true if inconclusive), 'request_revision'
 *    - Developer Actions: 'start_verification', 'restart_verification', 'request_client_approval'
 * 
 * 9. POST /api/milestones/:id/invoice
 *    - Auth: Bearer JWT (role: client)
 *    - Precondition: milestone.status === 'approved_for_invoice'
 *    - Response: { message, milestoneId, invoiceId, status: 'invoice_sent' }
 * 
 * NOTE: POST /api/webhooks/paypal is a server-to-server webhook endpoint.
 * IT MUST NEVER BE CALLED DIRECTLY FROM THE BROWSER.
 * =========================================================================
 */
