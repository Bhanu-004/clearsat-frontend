// frontend/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/users/login', null, { params: { email, password } }),
  
  register: (userData: { email: string; password: string; full_name: string }) =>
    api.post('/users/register', userData),
  
  guestLogin: () => api.post('/users/guest-login'),
  
  getCurrentUser: () => api.get('/users/me'),
};

export const analysisAPI = {
  create: (data: any) => api.post('/analysis/', data),
  
  getAll: () => api.get('/analysis/'),
  
  getById: (id: string) => api.get(`/analysis/${id}`),
  
  delete: (id: string) => api.delete(`/analysis/${id}`),
};

export const reportsAPI = {
  generatePDF: (analysisId: string) =>
    api.post(`/reports/${analysisId}/pdf`, {}, { responseType: 'blob' }),
};

export const profileAPI = {
  getOverview: () => api.get('/profile/overview'),
  
  updateProfile: (data: any) => api.put('/users/me/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/users/me/change-password', data),
  
  getPreferences: () => api.get('/users/me/preferences'),
  
  updatePreferences: (data: any) => api.put('/users/me/preferences', data),
  
  getStats: () => api.get('/users/stats'),
};

export const adminAPI = {
  getUsers: (skip: number = 0, limit: number = 50) =>
    api.get(`/users/admin/users?skip=${skip}&limit=${limit}`),
  
  getAdminStats: () => api.get('/users/admin/stats'),
};