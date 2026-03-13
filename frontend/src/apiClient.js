import { API_BASE_URL, getApiUrl } from './config/api';

export const apiBase = API_BASE_URL;

export function apiUrl(path = '') {
  return getApiUrl(path);
}

export function withAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}
