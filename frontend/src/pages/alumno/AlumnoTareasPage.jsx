import { useState, useEffect } from 'react';
import { obtenerMisTareas } from '../../services/alumnoService';
import { toast } from '../../utils/toast';
import AlumnoTareasList from './AlumnoTareasList';
import './AlumnoTareasList.css';

export default function AlumnoTareasPage() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisTareas();
      setTareas(data);
    } catch {
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alumno-tareas-page">
      <h1>Mis Tareas</h1>
      {loading ? (
        <p className="loading-message">Cargando tareas...</p>
      ) : (
        <AlumnoTareasList 
          tareas={tareas} 
          onTareaEntregada={cargarTareas} 
        />
      )}
    </div>
  );
}