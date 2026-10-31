import axios from 'axios';

const TOKEN_KEY = 'kmrs_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Attach JWT to every request when logged in.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Extract a readable message from any API error.
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.request && !err?.response ? 'Cannot reach the server.' : fallback);

// Turn a stored upload path (e.g. "/uploads/gallery/a.jpg") into a usable URL.
export const fileUrl = (path) => (path ? path : '');

export default api;