import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject Bearer token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Error de conexion. Verifica que el servidor este activo.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('No tienes permisos para realizar esta accion.');
    } else if (status === 400) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
      toast.error(message || 'Solicitud invalida.');
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta mas tarde.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
