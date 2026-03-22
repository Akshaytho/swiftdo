import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──
export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Buyer ──
export const buyerApi = {
  createTask: (data: Record<string, unknown>) => api.post('/buyer/tasks', data),
  listTasks: (params?: Record<string, string>) => api.get('/buyer/tasks', { params }),
  getTask: (id: string) => api.get(`/buyer/tasks/${id}`),
  cancelTask: (id: string, reason?: string) => api.post(`/buyer/tasks/${id}/cancel`, { reason }),
  approveTask: (id: string, buyerNotes?: string) => api.post(`/buyer/tasks/${id}/approve`, { buyerNotes }),
  rejectTask: (id: string, reason: string) => api.post(`/buyer/tasks/${id}/reject`, { reason }),
};

// ── Worker ──
export const workerApi = {
  listOpenTasks: (params?: Record<string, string>) => api.get('/worker/tasks/open', { params }),
  getTask: (id: string) => api.get(`/worker/tasks/${id}`),
  myTasks: (params?: Record<string, string>) => api.get('/worker/my-tasks', { params }),
  acceptTask: (id: string) => api.post(`/worker/tasks/${id}/accept`),
  startTask: (id: string) => api.post(`/worker/tasks/${id}/start`),
  cancelTask: (id: string, reason: string) => api.post(`/worker/tasks/${id}/cancel`, { reason }),
  submitTask: (id: string) => api.post(`/worker/tasks/${id}/submit`),
  retryTask: (id: string) => api.post(`/worker/tasks/${id}/retry`),
  logLocation: (id: string, lat: number, lng: number, accuracy?: number) =>
    api.post(`/worker/tasks/${id}/location`, { lat, lng, accuracy }),
};

// ── Media ──
export const mediaApi = {
  upload: (taskId: string, file: File, mediaType: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', mediaType);
    return api.post(`/tasks/${taskId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (taskId: string) => api.get(`/tasks/${taskId}/media`),
};

// ── Notifications ──
export const notificationApi = {
  list: (params?: Record<string, string>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// ── Citizen ──
export const citizenApi = {
  createReport: (data: Record<string, unknown>) => api.post('/citizen/reports', data),
  listReports: (params?: Record<string, string>) => api.get('/citizen/reports', { params }),
};

// ── Payouts ──
export const payoutApi = {
  list: (params?: Record<string, string>) => api.get('/worker/payouts', { params }),
};
