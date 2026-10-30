import api from './api';

export const crearUsuario = async (usuario) => {
  const response = await api.post('/admin/usuarios', usuario);
  return response.data;
};

export const listarUsuarios = async () => {
  const response = await api.get('/admin/usuarios');
  return response.data;
};

export const editarUsuario = async (id, data) => {
  const response = await api.patch(`/admin/usuarios/${id}`, data);
  return response.data;
};

// Clases
export const crearClase = async (clase) => {
  const response = await api.post('/clases', clase);
  return response.data;
};

export const listarClases = async () => {
  const response = await api.get('/clases');
  return response.data;
};

export const obtenerClase = async (id) => {
  const response = await api.get(`/clases/${id}`);
  return response.data;
};

export const editarClase = async (id, clase) => {
  const response = await api.put(`/clases/${id}`, clase);
  return response.data;
};

// Materias
export const listarMaterias = async () => {
  const response = await api.get('/materias');
  return response.data;
};

export const crearMateria = async (materia) => {
  const response = await api.post('/materias', materia);
  return response.data;
};

export const editarMateria = async (id, materia) => {
  const response = await api.put(`/materias/${id}`, materia);
  return response.data;
};

// Alumnos
export const listarAlumnos = async () => {
  const response = await api.get('/alumnos');
  return response.data;
};

// Profesores
export const listarProfesores = async () => {
  const response = await api.get('/admin/usuarios/profesores');
  return response.data;
};

// Horarios
export const listarHorarios = async () => {
  const response = await api.get('/horarios');
  return response.data;
};

// Recursos
export const listarRecursos = async () => {
  const response = await api.get('/admin/recursos/admin');
  return response.data;
};

export const editarRecurso = async (id, data) => {
  const response = await api.put(`/admin/recursos/${id}`, data);
  return response.data;
};

export const cambiarEstadoRecurso = async (id, estado) => {
  const response = await api.patch(`/admin/recursos/${id}/estado?estado=${estado}`);
  return response.data;
};

export const eliminarRecurso = async (id) => {
  const response = await api.delete(`/admin/recursos/${id}`);
  return response.data;
};

export const getAllObservaciones = async () => {
    try {
        const response = await api.get('/admin/observaciones');
        return response.data;
    } catch (error) {
        console.error('Error fetching all observaciones:', error);
        throw error;
    }
};

export const updateObservacionEstado = async (id, estado) => {
  const response = await api.put(`/admin/observaciones/estado/${id}?estado=${estado}`);
  return response.data;
};

export const getUltimoAcceso = async () => {
  const response = await api.get('/accesos/admin/ultimo-acceso');
  return response.data;
};

