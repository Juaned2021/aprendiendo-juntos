import { useState, useEffect } from 'react';
import { obtenerHorarioProfesor, listarTareasProfesor } from '../../services/profesorService';
import { getUserId } from '../../utils/auth';
import { toast } from '../../utils/toast';
import ProfesorTareas from './ProfesorTareas';
import ProfesorTareasList from './ProfesorTareasList';
import './ProfesorTareasPage.css';

export default function ProfesorTareasPage() {
  const [clases, setClases] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);

  useEffect(() => {
    cargarClases();
    cargarTareas();
  }, []);

  const cargarClases = async () => {
    try {
      setLoading(true);
      const idUsuario = getUserId();
      const data = await obtenerHorarioProfesor(idUsuario);
      const clasesUnicas = Object.values(
        data.reduce((acc, h) => {
          if (!acc[h.idclase]) {
            acc[h.idclase] = {
              idclase: h.idclase,
              materia: h.materia,
              grupo: h.grupo,
              grado: h.grado
            };
          }
          return acc;
        }, {})
      );
      setClases(clasesUnicas);
    } catch {
      toast.error('Error al cargar clases');
    } finally {
      setLoading(false);
    }
  };

  const cargarTareas = async () => {
    try {
      setLoadingTareas(true);
      const data = await listarTareasProfesor();
      setTareas(data);
    } catch {
      toast.error('Error al cargar tareas');
    } finally {
      setLoadingTareas(false);
    }
  };

  // Cuando se crea una tarea, refrescar lista
  const handleTareaCreada = () => {
    cargarTareas();
  };

  return (
    <div className="profesor-tareas-page">
      <h1>Gestionar Tareas de Mis Clases</h1>
      {loading ? (
        <p>Cargando clases...</p>
      ) : clases.length === 0 ? (
        <p>No tienes clases asignadas.</p>
      ) : (
        <div className="clases-lista">
          {clases.map(clase => (
            <div key={clase.idclase} className="clase-card">
              <ProfesorTareas idClase={clase.idclase} onTareaCreada={handleTareaCreada} />
            </div>
          ))}
        </div>
      )}

      <h2 style={{marginTop: '2.5rem'}}>Mis Tareas Creadas</h2>
      {loadingTareas ? (
        <p>Cargando tareas...</p>
      ) : (
        <ProfesorTareasList 
          tareas={tareas} 
          onTareaActualizada={cargarTareas} 
        />
      )}
    </div>
  );
}