// Unified auth-aware fetch helper for the frontend
// - Injects Authorization header when a token exists
// - Normalizes base URL when given a relative path
// - On 401, clears token and redirects to /auth (if not already there)

import { API_BASE_URL } from '../config';

export const getAuthToken = () => {
  try {
    return (
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken') ||
      null
    );
  } catch (e) {
    // LocalStorage may be unavailable in some environments
    return null;
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem('jwt');
    localStorage.removeItem('authToken');
    // Optional related entries
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
  } catch (e) {
    // Ignore storage clear errors
  }
};

const isAbsolute = (url) => /^https?:\/\//i.test(url);

export const authFetch = async (url, options = {}) => {
  const fullUrl = isAbsolute(url) ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Authorization')) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(fullUrl, { ...options, headers });

  if (response.status === 401) {
    clearAuthToken();
    // Avoid loop if already on auth route
    try {
      if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/auth') {
        window.location.replace('/auth');
      }
    } catch (e) {
      // Ignore navigation errors
    }
  }

  return response;
};
