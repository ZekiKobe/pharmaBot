import { ApiError } from '../utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api$/, '');
function getToken() {
  return localStorage.getItem('admin_token');
}

function setToken(token) {
  localStorage.setItem('admin_token', token);
}

function clearToken() {
  localStorage.removeItem('admin_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    throw new ApiError(data.message || 'Request failed', {
      status: response.status,
      fieldErrors: data.fieldErrors || {},
      errors: data.errors || [],
    });
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getProfile: () => request('/auth/me'),

  changePassword: (payload) =>
    request('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getDashboard: () => request('/admin/dashboard'),

  getAnalytics: () => request('/admin/analytics'),

  getSettings: () => request('/admin/settings'),

  updateSettings: (payload) =>
    request('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getPendingPosts: (page = 1) => request(`/admin/posts/pending?page=${page}`),

  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/posts?${query}`);
  },

  getPost: (id) => request(`/admin/posts/${id}`),

  approvePost: (id) =>
    request(`/admin/posts/${id}/approve`, { method: 'PATCH' }),

  rejectPost: (id, reason) =>
    request(`/admin/posts/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  deletePost: (id) => request(`/admin/posts/${id}`, { method: 'DELETE' }),

  setPostActive: (id, isActive) =>
    request(`/admin/posts/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getChannels: () => request('/admin/channels'),

  createChannel: (data) =>
    request('/admin/channels', { method: 'POST', body: JSON.stringify(data) }),

  updateChannel: (id, data) =>
    request(`/admin/channels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteChannel: (id) => request(`/admin/channels/${id}`, { method: 'DELETE' }),

  getUploadUrl: (path) => `${API_BASE}${path}`,
};

export { getToken, setToken, clearToken };
