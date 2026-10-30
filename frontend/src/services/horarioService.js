import api from './api';

// Obtener el horario del usuario actual (detecta si es profesor o alumno)
export const obtenerMiHorario = async () => {
  const response = await api.get('/horarios/mi-horario');
  return response.data;
};

// Obtener todos los horarios (solo para admin)
export const listarHorarios = async () => {
  const response = await api.get('/horarios');
  return response.data;
};
