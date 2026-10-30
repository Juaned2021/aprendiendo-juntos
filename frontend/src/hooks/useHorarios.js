import { useState, useEffect, useCallback } from 'react';
import { toast } from '../utils/toast';

export function useHorarios(fetchHorarios, userRole) {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [filtroClase, setFiltroClase] = useState('');
  const [haRealizadoPrimeraCarga, setHaRealizadoPrimeraCarga] = useState(false);
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [clasesDisponibles, setClasesDisponibles] = useState([]);

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  const cargarOpcionesFiltros = useCallback(async () => {
    if (userRole !== 'admin') return;
    
    try {
      const data = await fetchHorarios();
      
      const profesoresUnicos = [...new Set(data.map(h => h.profesor).filter(Boolean))].sort();
      setProfesoresDisponibles(profesoresUnicos);
      
      const clasesUnicas = [...new Set(data.map(h => {
        const grado = h.Grado || h.grado || h.clase?.grado;
        const grupo = h.Grupo || h.grupo || h.clase?.grupo;
        return `${grado || 'N/A'}° ${grupo || 'N/A'}`;
      }))].sort();
      setClasesDisponibles(clasesUnicas);
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
      toast.error(`Error al cargar opciones: ${error.message}`);
      setProfesoresDisponibles([]);
      setClasesDisponibles([]);
    }
  }, [fetchHorarios, userRole]);

  const cargarHorarios = useCallback(async () => {
    if (userRole === 'admin' && !filtroProfesor && !filtroClase) {
      setHorarios([]);
      setHaRealizadoPrimeraCarga(false);
      return;
    }
    
    try {
      setLoading(true);
      
      let data;
      if (userRole === 'admin') {
        data = await fetchHorarios();
      } else {
        if (typeof fetchHorarios === 'function') {
          data = await fetchHorarios();
        } else {
          throw new Error('Función de fetchHorarios no proporcionada');
        }
      }
      
      setHorarios(data);
      setHaRealizadoPrimeraCarga(true);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast.error(`Error al cargar horarios: ${error.message}`);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  }, [fetchHorarios, userRole, filtroProfesor, filtroClase]);

  useEffect(() => {
    if (userRole === 'admin') {
      cargarOpcionesFiltros();
    } else {
      cargarHorarios();
    }
  }, [userRole, cargarOpcionesFiltros, cargarHorarios]);

  useEffect(() => {
    if (userRole === 'admin' && (filtroProfesor || filtroClase)) {
      cargarHorarios();
    }
  }, [filtroProfesor, filtroClase, userRole, cargarHorarios]);

  useEffect(() => {
    if (userRole === 'admin' && !filtroProfesor && !filtroClase && haRealizadoPrimeraCarga) {
      setHorarios([]);
      setHaRealizadoPrimeraCarga(false);
    }
  }, [filtroProfesor, filtroClase, userRole, haRealizadoPrimeraCarga]);

  const profesores = userRole === 'admin' ? profesoresDisponibles : [...new Set(horarios.map(h => h.profesor).filter(Boolean))].sort();
  const clases = userRole === 'admin' ? clasesDisponibles : [...new Set(horarios.map(h => {
    const grado = h.Grado || h.grado || h.clase?.grado;
    const grupo = h.Grupo || h.grupo || h.clase?.grupo;
    return `${grado || 'N/A'}° ${grupo || 'N/A'}`;
  }))].sort();

  const horariosFiltrados = userRole === 'admin'
    ? horarios.filter(h => {
        const matchProfesor = !filtroProfesor || h.profesor === filtroProfesor;
        const grado = h.Grado || h.grado || h.clase?.grado;
        const grupo = h.Grupo || h.grupo || h.clase?.grupo;
        const className = `${grado || 'N/A'}° ${grupo || 'N/A'}`;
        const matchClase = !filtroClase || className === filtroClase;
        return matchProfesor && matchClase;
      })
    : horarios;

  const horariosPorDia = dias.map(dia => ({
    dia,
    horarios: horariosFiltrados.filter(h => (h.DiaSemana || h.diaSemana) === dia).sort((a, b) => {
      const horaA = a.HoraInicio || a.horaInicio;
      const horaB = b.HoraInicio || b.horaInicio;
      return horaA.localeCompare(horaB);
    })
  }));

  return {
    horarios,
    loading,
    filtroProfesor,
    setFiltroProfesor,
    filtroClase,
    setFiltroClase,
    profesores,
    clases,
    horariosPorDia,
    cargarHorarios,
    haRealizadoPrimeraCarga
  };
}
