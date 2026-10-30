import axios from 'axios';
import { clearAuthData } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL no está definida. Por favor, cree un archivo .env.development y defina la variable.");
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 y no estamos en la página de login, redirigir
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
