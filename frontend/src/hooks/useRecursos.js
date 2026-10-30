import { useState, useEffect, useCallback } from 'react';
import { toast } from '../utils/toast';
import { useDebounce } from './useDebounce';
import { listarRecursos } from '../services/adminService';
import { listarRecursosProfesor } from '../services/profesorService';
import { obtenerMisRecursos } from '../services/alumnoService';

export function useRecursos(userRole = 'profesor') {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cargarRecursos = useCallback(async () => {
    try {
      setLoading(true);
      
      let data;
      
      if (userRole === 'admin') {
        data = await listarRecursos();
      } else if (userRole === 'profesor') {
        data = await listarRecursosProfesor();
      } else if (userRole === 'alumno') {
        data = await obtenerMisRecursos();
      }
      
      if (!Array.isArray(data)) {
        console.error('useRecursos - Los datos recibidos no son un array:', data);
        toast.error('Formato de datos incorrecto');
        setRecursos([]);
      } else {
        const formattedData = data.map(recurso => ({
          ...recurso,
          clase: recurso.clase || {
            grado: recurso.grado || 'N/A',
            grupo: recurso.grupo || ''
          },
          profesor: recurso.profesor || 'N/A',
          estado: recurso.estado || 'Activo'
        }));
        
        setRecursos(formattedData);
      }
    } catch (error) {
      console.error('useRecursos - Error al cargar recursos:', error);
      toast.error(`Error al cargar recursos: ${error.response?.data?.message || error.message}`);
      setRecursos([]);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    cargarRecursos();
  }, [cargarRecursos]);

  const recursosFiltrados = recursos.filter(r => {
    const matchBusqueda = !debouncedBusqueda ||
      r.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(debouncedBusqueda.toLowerCase());
    const matchTipo = !filtroTipo || r.tipo === filtroTipo;
    const matchEstado = !filtroEstado || r.estado === filtroEstado;
    return matchBusqueda && matchTipo && matchEstado;
  });

  const totalPages = Math.ceil(recursosFiltrados.length / itemsPerPage);
  const paginatedRecursos = recursosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tipos = [...new Set(recursos.map(r => r.tipo))];

  return {
    recursos,
    loading,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedRecursos,
    tipos,
    cargarRecursos,
  };
}
