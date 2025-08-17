// Centralized API base URL helper for deployment flexibility
// Usage: import { apiBase, apiUrl } from './apiClient';
// apiUrl('/auth/login') => `${apiBase}/auth/login`

export const apiBase = import.meta?.env?.VITE_API_URL || (typeof window !== 'undefined' ? window.__API_BASE__ : '') || (import.meta?.env?.MODE === 'production' ? 'https://findmyspot-grxt.onrender.com/api' : 'http://localhost:4000/api');

// Warn if deployed host not localhost but apiBase still points to localhost
try {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && /localhost:5?000/.test(apiBase)) {
      console.warn('[FindMySpot] WARNING: Using localhost API base from deployed host', host, '=>', apiBase);
    }
  }
} catch { /* ignore */ }

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
