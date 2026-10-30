import api from './api';

// Obtener clases por profesor (para select)
export const getClasesPorProfesor = async (idUsuario) => {
  const response = await api.get(`/clases/profesor/${idUsuario}`);
  return response.data;
};
// Listar recursos del profesor
export const listarRecursosProfesor = async () => {
  const response = await api.get('/recursos/mis-recursos');
  return response.data;
};

export const obtenerHorarioProfesor = async (idUsuario) => {
  const response = await api.get(`/horarios/profesor/usuario/${idUsuario}`);
  return response.data;
};

export const listarAlumnosProfesor = async (idUsuario) => {
  const response = await api.get(`/alumnos/profesor/alumnos/${idUsuario}`);
  return response.data;
};

export const getObservacionesProfesor = async () => {
    const response = await api.get('/profesor/observaciones');
    return response.data;
};

export const getMisEstudiantes = async () => {
    const response = await api.get('/Profesor/mis-estudiantes');
    return response.data;
};

export const createObservacion = async (observacionData) => {
    const response = await api.post('/profesor/observaciones', observacionData);
    return response.data;
};


// Subir recurso a una clase (profesor)
// Esta función puede manejar tanto un archivo real como un Blob que simula un archivo (para los enlaces).
export const subirRecurso = async (idClase, archivo, descripcion) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  // descripcion va como query param, no en el body
  const response = await api.post(
    `/recursos/${idClase}/recurso?descripcion=${encodeURIComponent(descripcion)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Listar tareas del profesor
export const listarTareasProfesor = async () => {
  const response = await api.get('/Tareas/tareas');
  return response.data;
};

// Editar tarea (profesor) - actualización parcial
export const editarTarea = async (idTarea, tareaData) => {
  const response = await api.patch(`/Tareas/tareas/${idTarea}`, tareaData);
  return response.data;
};

// Obtener entregas de una tarea (profesor)
export const obtenerEntregasDeTarea = async (idTarea) => {
  const response = await api.get(`/EntregaTareas/tareas/${idTarea}/entregas`);
  return response.data;
};

// Obtener detalles de una entrega específica (profesor)
export const obtenerEntrega = async (idEntrega) => {
  const response = await api.get(`/EntregaTareas/entregas/${idEntrega}`);
  return response.data;
};

// Calificar/editar calificación de una entrega (profesor)
export const calificarEntrega = async (idEntrega, calificacionData) => {
  const response = await api.patch(
    `/CalificacionTareas/entregas/${idEntrega}/calificacion`,
    calificacionData
  );
  return response.data;
};

// Crear tarea para una clase (profesor) - soporta archivo adjunto
// Los parámetros van como query string, el archivo va en el body como FormData
export const crearTarea = async (idClase, tareaData) => {
  const formData = new FormData();
  if (tareaData.archivo) {
    formData.append('archivo', tareaData.archivo);
  }

  const params = new URLSearchParams();
  params.append('titulo', tareaData.titulo);
  params.append('descripcion', tareaData.descripcion);
  params.append('fechaLimite', tareaData.fechaLimite);
  if (tareaData.descripcionRecurso) {
    params.append('descripcionRecurso', tareaData.descripcionRecurso);
  }

  const url = `/tareas/${idClase}/CrearTarea?${params.toString()}`;
  console.log('URL relativa:', url);
  console.log('Query params:', params.toString());

  const response = await api.post(
    url,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
