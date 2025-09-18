// Get API base URL from environment
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
console.log('API_BASE URL:', API_BASE); // Debug log

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(method, path, token, body) {
  const opts = {
    method,
    headers: buildHeaders(token),
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = data.detail || data.message || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Get auth token from localStorage or other storage
function getAuthToken() {
  return localStorage.getItem('jwt') || localStorage.getItem('token') || sessionStorage.getItem('token') || null;
}

// API client for axios-like usage
export const api = {
  get: async (path, config = {}) => {
    const token = config.token || getAuthToken();
    const data = await request('GET', path, token);
    return { data };
  },
  post: async (path, body = null, config = {}) => {
    const token = config.token || getAuthToken();
    
    // Handle FormData (file uploads) differently
    if (body instanceof FormData) {
      const opts = {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body
      };
      const res = await fetch(`${API_BASE}${path}`, opts);
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const data = await res.json();
          msg = data.detail || data.message || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      try {
        const data = await res.json();
        return { data };
      } catch {
        return { data: null };
      }
    }
    
    const data = await request('POST', path, token, body);
    return { data };
  },
  put: async (path, body = null, config = {}) => {
    const token = config.token || getAuthToken();
    const data = await request('PUT', path, token, body);
    return { data };
  },
  delete: async (path, config = {}) => {
    const token = config.token || getAuthToken();
    const data = await request('DELETE', path, token);
    return { data };
  }
};
