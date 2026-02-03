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

  const response = await api.post('/api/search', requestData);
  return response.data;
};

// ========== Search History API ==========

export const getSearchHistory = async (limit = 50) => {
  const response = await api.get(`/api/history?limit=${limit}`);
  return response.data;
};

export const clearSearchHistory = async () => {
  const response = await api.delete('/api/history');
  return response.data;
};

// ========== Favorites API ==========

export const getFavorites = async () => {
  const response = await api.get('/api/favorites');
  return response.data;
};

export const createFavorite = async (partDescription, searchQuery) => {
  const response = await api.post('/api/favorites', {
    part_description: partDescription,
    search_query: searchQuery,
  });
  return response.data;
};

export const deleteFavorite = async (favoriteId) => {
  const response = await api.delete(`/api/favorites/${favoriteId}`);
  return response.data;
};

export const incrementOrderCount = async (favoriteId) => {
  const response = await api.post(`/api/favorites/${favoriteId}/increment-orders`);
  return response.data;
};

export default api;
