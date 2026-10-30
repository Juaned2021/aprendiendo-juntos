import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { listarMaterias } from '../services/adminService';
import { toast } from '../utils/toast';

export function useMaterias() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cargarMaterias = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await listarMaterias();
      setMaterias(data);
    } catch (error) {
      console.error('Error al cargar materias:', error);
      toast.error('Error al cargar materias');
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMaterias();
  }, [cargarMaterias]);

  const materiasFiltradas = materias.filter(m => {
    const matchBusqueda = !debouncedBusqueda ||
      m.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
      m.area.toLowerCase().includes(debouncedBusqueda.toLowerCase());
    const matchEstado = !filtroEstado || m.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalPages = Math.ceil(materiasFiltradas.length / itemsPerPage);
  const paginatedMaterias = materiasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const areas = [...new Set(materias.map(m => m.area))];

  return {
    materias,
    loading,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedMaterias,
    areas,
    cargarMaterias,
  };
}
