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
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    throw new Error(data.message || 'Request failed');
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

  getDashboard: () => request('/admin/dashboard'),

  getAnalytics: () => request('/admin/analytics'),

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

  getUploadUrl: (path) => `${API_BASE}${path}`,
};

export { getToken, setToken, clearToken };
