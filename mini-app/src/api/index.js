import { ApiError } from '../utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {},
    ...options,
  };

  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, config);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', {
      status: response.status,
      fieldErrors: data.fieldErrors || {},
      errors: data.errors || [],
    });
  }

  return data;
}

export const api = {
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts?${query}`);
  },
  getPost: (id) => request(`/posts/${id}`),
  getMyPosts: (telegramId) => request(`/posts/user/${telegramId}`),
  getPostStatus: (postId, telegramId) =>
    request(`/posts/status?postId=${postId}&telegramId=${telegramId}`),
  getMyPost: (id, telegramId) => request(`/posts/my/${id}?telegramId=${telegramId}`),
  updateMyPost: (id, data) =>
    request(`/posts/my/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMyPost: (id, telegramId) =>
    request(`/posts/my/${id}`, { method: 'DELETE', body: JSON.stringify({ telegramId }) }),
  getPaymentInfo: () => request('/posts/payment-info'),
  getCategories: () => request('/categories'),
  getCities: () => request('/posts/cities'),
  createBuyerPost: (data) =>
    request('/posts/buyer', { method: 'POST', body: JSON.stringify(data) }),
  createSellerPost: (data) =>
    request('/posts/seller', { method: 'POST', body: JSON.stringify(data) }),
  uploadPayment: (formData) =>
    request('/posts/payment', { method: 'POST', body: formData }),
};

export default api;
