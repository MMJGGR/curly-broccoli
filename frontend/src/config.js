// API Configuration
// This ensures we always use the correct API URL regardless of environment variable issues

const getApiBaseUrl = () => {
  // In development, always use localhost:8000
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Use environment variable if available, otherwise fallback to localhost
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Config.js loaded - API_BASE_URL:', API_BASE_URL);