import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const orderService = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  updateStatus: (id: number, status: string, rider_id?: number) =>
    api.put(`/orders/${id}/status`, { status, rider_id }),
};

export const deliveryService = {
  getAssignedOrders: () => api.get('/delivery/orders'),
  updateStatus: (id: number, status: string) =>
    api.put(`/delivery/orders/${id}/status`, { status }),
  updateLocation: (id: number, lat: number, lng: number) =>
    api.post(`/delivery/orders/${id}/location`, { lat, lng }),
  getRiders: () => api.get('/delivery/riders'),
};

export default api;
