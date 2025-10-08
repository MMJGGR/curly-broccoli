// API Configuration
// This ensures we always use the correct API URL regardless of environment variable issues

const getApiBaseUrl = () => {
  // Always prefer explicit env override when provided (works in Docker too)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Development default for local non-Docker runs
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  // Fallback
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Config.js loaded - API_BASE_URL:', API_BASE_URL);

// Feature flags
export const STRUCTURED_UX = String(process.env.REACT_APP_STRUCTURED_UX || '').toLowerCase() === '1' 
  || String(process.env.REACT_APP_STRUCTURED_UX || '').toLowerCase() === 'true';
console.log('🔧 Config.js loaded - STRUCTURED_UX:', STRUCTURED_UX);
