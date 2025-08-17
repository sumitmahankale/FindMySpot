// Centralized API base URL helper for deployment flexibility
// Usage: import { apiBase, apiUrl } from './apiClient';
// apiUrl('/auth/login') => `${apiBase}/auth/login`

export const apiBase = import.meta?.env?.VITE_API_URL || (typeof window !== 'undefined' ? window.__API_BASE__ : '') || 'http://localhost:5000/api';

export function apiUrl(path = '') {
  if (!path.startsWith('/')) path = '/' + path;
  // Avoid duplicating /api if caller already includes it
  if (path.startsWith('/api/')) return (import.meta?.env?.VITE_API_ORIGIN || apiBase.replace(/\/api$/,'')) + path;
  return apiBase + path;
}

export function withAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}
