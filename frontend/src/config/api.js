// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }
  // Remove /api prefix if already included in endpoint
  if (endpoint.startsWith('api/')) {
    endpoint = endpoint.substring(4);
  }
  return `${API_BASE_URL}/${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token = null) => {
  const authToken = token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` })
  };
};

// Export the base URL for direct usage
export { API_BASE_URL };
export default API_BASE_URL;
