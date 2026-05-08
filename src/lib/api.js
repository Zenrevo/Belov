const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'belov_access_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.error || 'Request failed';
    throw new Error(Array.isArray(message) ? message[0]?.msg || 'Request failed' : message);
  }

  return data;
};

export const authApi = {
  me: () => apiRequest('/auth/me'),
  requestOtp: (payload) => apiRequest('/auth/otp/request', { method: 'POST', body: payload }),
  verifyOtp: (payload) => apiRequest('/auth/otp/verify', { method: 'POST', body: payload })
};

export const cartApi = {
  get: () => apiRequest('/cart'),
  add: (payload) => apiRequest('/cart/items', { method: 'POST', body: payload }),
  update: (itemId, payload) => apiRequest(`/cart/items/${itemId}`, { method: 'PATCH', body: payload }),
  remove: (itemId) => apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clear: () => apiRequest('/cart', { method: 'DELETE' })
};

export const orderApi = {
  create: (payload) => apiRequest('/orders', { method: 'POST', body: payload }),
  list: () => apiRequest('/orders'),
  get: (orderId) => apiRequest(`/orders/${encodeURIComponent(orderId)}`)
};

export const profileApi = {
  get: () => apiRequest('/profile'),
  update: (payload) => apiRequest('/profile', { method: 'PUT', body: payload })
};

export const catalogApi = {
  products: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  product: (id) => apiRequest(`/products/${id}`),
  brands: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/brands${query ? `?${query}` : ''}`);
  },
  filters: () => apiRequest('/filters'),
  recommendations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/recommendations${query ? `?${query}` : ''}`);
  }
};

export const sellerApi = {
  dashboard: () => apiRequest('/seller/dashboard')
};
