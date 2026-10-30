import api from './api';

export const getObservacionesByAlumno = async (alumnoId) => {
  try {
    const response = await api.get(`/observaciones/alumno/${alumnoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching observaciones by alumno:', error);
    throw error;
  }
};

export const createObservacion = async (observacionData) => {
  try {
    const response = await api.post('/observaciones', observacionData);
    return response.data;
  } catch (error) {
    console.error('Error creating observacion:', error);
    throw error;
  }
};

export const getAllObservaciones = async () => {
    try {
        const response = await api.get('/observaciones');
        return response.data;
    } catch (error) {
        console.error('Error fetching all observaciones:', error);
        throw error;
    }
};

export const updateObservacion = async (id, observacionData) => {
  try {
    const response = await api.put(`/observaciones/${id}`, observacionData);
    return response.data;
  } catch (error) {
    console.error('Error updating observacion:', error);
    throw error;
  }
};

export const deleteObservacion = async (id) => {
  try {
    const response = await api.delete(`/observaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting observacion:', error);
    throw error;
  }
};
