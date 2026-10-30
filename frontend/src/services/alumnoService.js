import api from './api';

// Obtener el horario del alumno autenticado
export const obtenerMiHorario = async () => {
  const response = await api.get('/horarios/mi-horario');
  return response.data;
};

// Obtener las observaciones del alumno autenticado
export const obtenerMisObservaciones = async () => {
  const response = await api.get('/alumno/observaciones');
  return response.data;
};

// Obtener los recursos del alumno autenticado
export const obtenerMisRecursos = async () => {
  const response = await api.get('/recursos/mis-recursos');
  return response.data;
};

// Obtener las tareas del alumno autenticado
export const obtenerMisTareas = async () => {
  const response = await api.get('/alumnos/tareas');
  return response.data;
};

// Obtener mi entrega de una tarea (alumno)
export const obtenerMiEntrega = async (idTarea) => {
  const response = await api.get(`/alumnos/tareas/${idTarea}/mi-entrega`);
  return response.data;
};

// Editar entrega (alumno) - reemplaza archivo
// La descripción va como query parameter, el archivo en el body como FormData
export const editarEntrega = async (idEntrega, archivo, descripcion) => {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const params = new URLSearchParams();
  if (descripcion) {
    params.append('descripcion', descripcion);
  }

  const url = `/alumnos/entregas/${idEntrega}?${params.toString()}`;

  const response = await api.patch(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Entregar tarea (alumno) - sube archivo
// La descripción va como query parameter, el archivo en el body como FormData
export const entregarTarea = async (idTarea, archivo, descripcion) => {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const params = new URLSearchParams();
  if (descripcion) {
    params.append('descripcion', descripcion);
  }

  const url = `/alumnos/tareas/${idTarea}/entrega?${params.toString()}`;

  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
