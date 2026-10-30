import api from '../services/api';

export const login = async (usuario, contrasena) => {
  const response = await api.post('/auth/login', {
    usuario,
    contrasena
  });
  
  const { token, idUsuario, roles, tokenExpira } = response.data;
  
  // Store authentication data in sessionStorage
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('idUsuario', idUsuario);
  sessionStorage.setItem('roles', JSON.stringify(roles));
  if (tokenExpira) {
    sessionStorage.setItem('tokenExpira', tokenExpira);
  }
  
  return response.data;
};

export const isAuthenticated = () => {
  const token = sessionStorage.getItem('token');
  const tokenExpira = sessionStorage.getItem('tokenExpira');
  
  if (!token) return false;
  
  if (tokenExpira) {
    const expirationTime = new Date(tokenExpira).getTime();
    const currentTime = new Date().getTime();
    return currentTime < expirationTime;
  }
  
  return true;
};

export const clearAuthData = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('idUsuario');
  sessionStorage.removeItem('roles');
  sessionStorage.removeItem('tokenExpira');
};

export const getRoles = () => {
  try {
    return JSON.parse(sessionStorage.getItem('roles') || '[]');
  } catch {
    return [];
  }
};

export const hasRole = (role) => {
  const roles = getRoles();
  return roles.includes(role);
};

export const getUserId = () => {
  return sessionStorage.getItem('idUsuario');
};

export const getUserRole = () => {
  const roles = getRoles();
  if (roles.includes('Admin')) return 'admin';
  if (roles.includes('Profesor')) return 'profesor';
  if (roles.includes('Alumno')) return 'alumno';
  return null;
};
