import axios from 'axios';

// Use relative path in development to leverage Vite proxy
// In production, set VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== Search API ==========

export const searchParts = async (query, vendors = null) => {
  const requestData = {
    query,
    ...(vendors && { vendors }),
  };

  const response = await api.post('/search', requestData);
  return response.data;
};

// Note: Search history and favorites are now managed in localStorage
// See frontend/src/services/storage.js for the new implementation

export default api;
