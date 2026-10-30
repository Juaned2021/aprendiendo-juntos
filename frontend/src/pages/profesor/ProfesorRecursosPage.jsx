import { useState, useEffect } from 'react';
import { obtenerHorarioProfesor, listarRecursosProfesor } from '../../services/profesorService';
import { getUserId } from '../../utils/auth';
import { toast } from '../../utils/toast';
import ProfesorRecursos from './ProfesorRecursos';
import ProfesorRecursosList from './ProfesorRecursosList';
import './ProfesorRecursosPage.css';

export default function ProfesorRecursosPage() {
  const [clases, setClases] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecursos, setLoadingRecursos] = useState(true);

  useEffect(() => {
    cargarClases();
    cargarRecursos();
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

  const cargarRecursos = async () => {
    try {
      setLoadingRecursos(true);
      const data = await listarRecursosProfesor();
      setRecursos(data);
    } catch {
      toast.error('Error al cargar recursos');
    } finally {
      setLoadingRecursos(false);
    }
  };

  // Cuando se sube un recurso, refrescar lista
  const handleRecursoSubido = () => {
    cargarRecursos();
  };

  return (
    <div className="profesor-recursos-page">
      <h1>Subir Recursos a Mis Clases</h1>
      {loading ? (
        <p>Cargando clases...</p>
      ) : clases.length === 0 ? (
        <p>No tienes clases asignadas.</p>
      ) : (
        <div className="clases-lista">
          {clases.map(clase => (
            <div key={clase.idclase} className="clase-card">
              {/* Se eliminó el título de materia y grupo para no mostrar nada arriba del formulario */}
              <ProfesorRecursos idClase={clase.idclase} onRecursoSubido={handleRecursoSubido} />
            </div>
          ))}
        </div>
      )}

      <h2 style={{marginTop: '2.5rem'}}>Mis Recursos Subidos</h2>
      {loadingRecursos ? (
        <p>Cargando recursos...</p>
      ) : (
        <ProfesorRecursosList recursos={recursos} />
      )}
    </div>
  );
}
