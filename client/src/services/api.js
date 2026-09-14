import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired tokens or common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 on an admin route, clear invalid token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Events Endpoints
export const eventsAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  create: async (eventData) => {
    const res = await api.post('/events', eventData);
    return res.data;
  },
  update: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};

// Feedback Endpoints
export const feedbackAPI = {
  submit: async (feedbackData) => {
    const res = await api.post('/feedback', feedbackData);
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get('/feedback', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/feedback/${id}`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/feedback/${id}`);
    return res.data;
  },
};

// Stats Endpoints
export const statsAPI = {
  getDashboardStats: async () => {
    const res = await api.get('/stats');
    return res.data;
  },
};

export default api;
