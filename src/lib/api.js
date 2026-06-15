const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'belov_access_token';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: options.body && !isFormData && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body
    });
  } catch {
    throw new Error(
      'Cannot reach the API. Start the backend (uvicorn on port 8000) and reload this page.'
    );
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text ? { detail: text } : null;
  }

  if (!response.ok) {
    const message = data?.detail || data?.error || 'Request failed';
    throw new Error(Array.isArray(message) ? message[0]?.msg || 'Request failed' : message);
  }

  return data;
};

export const apiAssetUrl = (url) => {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/')) return `${API_ORIGIN}${url}`;
  return url;
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
  update: (payload) => apiRequest('/profile', { method: 'PUT', body: payload }),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/profile/photos', { method: 'POST', body: formData });
  },
  analyzeSkinTone: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/profile/skin-tone', { method: 'POST', body: formData });
  }
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
  brand: (id) => apiRequest(`/brands/${encodeURIComponent(id)}`),
  filters: () => apiRequest('/filters'),
  categories: () => apiRequest('/categories'),
  recommendations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/recommendations${query ? `?${query}` : ''}`);
  },
  recommendationChoice: (payload) => (
    apiRequest('/recommendations/choices', { method: 'POST', body: payload })
  )
};

export const sellerApi = {
  dashboard: () => apiRequest('/seller/dashboard')
};

export const tryOnApi = {
  create: ({ productId, personImage, productImage, numberOfImages = 1 }) => {
    const formData = new FormData();
    formData.append('productId', productId);
    if (personImage) formData.append('personImage', personImage);
    if (productImage) formData.append('productImage', productImage);
    formData.append('numberOfImages', numberOfImages);
    return apiRequest('/try-on/sessions', { method: 'POST', body: formData });
  },
  list: () => apiRequest('/try-on/sessions'),
  get: (sessionId) => apiRequest(`/try-on/sessions/${sessionId}`)
};
