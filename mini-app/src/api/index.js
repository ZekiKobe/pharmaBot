import { ApiError } from '../utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = API_URL.replace(/\/api$/, '');

function buildPostFormData(data, imageFile, { removeImage } = {}) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value);
    }
  });
  if (imageFile) {
    fd.append('medicineImage', imageFile);
  } else if (removeImage) {
    fd.append('removeMedicineImage', 'true');
  }
  return fd;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const { signal, ...fetchOptions } = options;
  const config = {
    headers: {},
    ...fetchOptions,
    ...(signal ? { signal } : {}),
  };

  if (!(fetchOptions.body instanceof FormData)) {
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
  getPosts: (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts?${query}`, options);
  },
  getPost: (id) => request(`/posts/${id}`),
  getMyPosts: (telegramId) => request(`/posts/user/${telegramId}`),
  getPostStatus: (postId, telegramId) =>
    request(`/posts/status?postId=${postId}&telegramId=${telegramId}`),
  getMyPost: (id, telegramId) => request(`/posts/my/${id}?telegramId=${telegramId}`),
  updateMyPost: (id, data, imageFile, options) =>
    request(`/posts/my/${id}`, {
      method: 'PATCH',
      body:
        imageFile || options?.removeImage
          ? buildPostFormData(data, imageFile, options)
          : JSON.stringify(data),
    }),
  deleteMyPost: (id, telegramId) =>
    request(`/posts/my/${id}`, { method: 'DELETE', body: JSON.stringify({ telegramId }) }),
  getPaymentInfo: () => request('/posts/payment-info'),
  getCategories: () => request('/categories'),
  getCities: () => request('/posts/cities'),
  getUploadUrl: (path) => `${API_BASE}${path}`,
  createBuyerPost: (data, imageFile) =>
    request('/posts/buyer', {
      method: 'POST',
      body: imageFile ? buildPostFormData(data, imageFile) : JSON.stringify(data),
    }),
  createSellerPost: (data, imageFile) =>
    request('/posts/seller', {
      method: 'POST',
      body: imageFile ? buildPostFormData(data, imageFile) : JSON.stringify(data),
    }),
  uploadPayment: (formData) =>
    request('/posts/payment', { method: 'POST', body: formData }),
};

export default api;
