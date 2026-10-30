import React, { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import { editarTarea, obtenerEntregasDeTarea, calificarEntrega, obtenerEntrega } from '../../services/profesorService';
import { toast } from '../../utils/toast';
import './ProfesorTareasList.css';
import ExpandableText from '../../components/ExpandableText';

export default function ProfesorTareasList({ tareas, onTareaActualizada }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [tareaEditar, setTareaEditar] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechalimite: '',
    estado: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [modalEntregasAbierto, setModalEntregasAbierto] = useState(false);
  const [entregas, setEntregas] = useState([]);
  const [loadingEntregas, setLoadingEntregas] = useState(false);
  const [calificando, setCalificando] = useState(false);
  const [entregaCalificar, setEntregaCalificar] = useState(null);
  const [formCalificacion, setFormCalificacion] = useState({
    nota: '',
    observacion: ''
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar tareas basado en búsqueda
  const filteredTareas = useMemo(() => {
    if (!tareas || tareas.length === 0) return [];
    
    if (!debouncedSearchTerm.trim()) return tareas;

    const filtered = tareas.filter(tarea => {
      const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
      
      const titulo = get(tarea, 'titulo')?.toLowerCase() || '';
      const descripcion = get(tarea, 'descripcion')?.toLowerCase() || '';
      const materia = get(tarea, 'materia')?.toLowerCase() || '';
      const clase = get(tarea, 'clase')?.toLowerCase() || '';
      const grado = get(tarea, 'grado')?.toString() || '';
      const grupo = get(tarea, 'grupo')?.toString() || '';
      
      const searchLower = debouncedSearchTerm.toLowerCase();
      
      return titulo.includes(searchLower) ||
             descripcion.includes(searchLower) ||
             materia.includes(searchLower) ||
             clase.includes(searchLower) ||
             grado.includes(searchLower) ||
             grupo.includes(searchLower);
    });

    return filtered;
  }, [debouncedSearchTerm, tareas]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredTareas.length / itemsPerPage);
  const paginatedTareas = filteredTareas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página si está fuera de rango
  const adjustedCurrentPage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;

  if (!tareas || tareas.length === 0) {
    return <div className="tareas-list-vacio">No hay tareas creadas.</div>;
  }

  // Abrir modal de edición
  const abrirModalEditar = (tarea) => {
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const fecha = get(tarea, 'fechalimite') || get(tarea, 'fechaEntrega');
    
    setTareaEditar(tarea);
    setFormData({
      titulo: get(tarea, 'titulo') || '',
      descripcion: get(tarea, 'descripcion') || '',
      fechalimite: fecha ? new Date(fecha).toISOString().split('T')[0] : '',
      estado: get(tarea, 'estado') || ''
    });
    setModalEditarAbierto(true);
  };

  // Abrir modal de entregas
  const abrirModalEntregas = async (tarea) => {
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idTarea = get(tarea, 'idtarea') || get(tarea, 'idTarea');
    
    if (!idTarea) {
      toast.error('No se pudo obtener el ID de la tarea');
      return;
    }

    try {
      setLoadingEntregas(true);
      setModalEntregasAbierto(true);
      const data = await obtenerEntregasDeTarea(idTarea);
      setEntregas(data);
    } catch (error) {
      console.error('Error al cargar entregas:', error);
      toast.error('Error al cargar las entregas');
      setModalEntregasAbierto(false);
    } finally {
      setLoadingEntregas(false);
    }
  };

  // Cerrar modal de entregas
  const cerrarModalEntregas = () => {
    setModalEntregasAbierto(false);
    setEntregas([]);
    setEntregaCalificar(null);
    setFormCalificacion({ nota: '', observacion: '' });
  };

  // Abrir modal de calificación
  const abrirModalCalificar = async (entrega) => {
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idEntrega = get(entrega, 'identrega');
    
    if (!idEntrega) {
      toast.error('No se pudo obtener el ID de la entrega');
      return;
    }

    try {
      // Obtener detalles completos de la entrega
      const datosEntrega = await obtenerEntrega(idEntrega);
      setEntregaCalificar(datosEntrega);
      setFormCalificacion({
        nota: datosEntrega.nota || '',
        observacion: datosEntrega.observacion || ''
      });
    } catch (error) {
      console.error('Error al cargar entrega:', error);
      toast.error('Error al cargar los datos de la entrega');
    }
  };

  // Manejar calificación
  const handleSubmitCalificar = async (e) => {
    e.preventDefault();
    
    if (!entregaCalificar) return;
    
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idEntrega = get(entregaCalificar, 'identrega');
    
    if (!idEntrega) {
      toast.error('No se pudo obtener el ID de la entrega');
      return;
    }

    if (!formCalificacion.nota || isNaN(formCalificacion.nota)) {
      toast.error('Debe ingresar una nota válida');
      return;
    }

    const nota = parseFloat(formCalificacion.nota);
    if (nota < 0 || nota > 100) {
      toast.error('La nota debe estar entre 0 y 100');
      return;
    }

    try {
      setCalificando(true);
      
      await calificarEntrega(idEntrega, {
        nota: nota,
        observacion: formCalificacion.observacion
      });
      
      toast.success('Calificación guardada correctamente');
      cerrarModalCalificar();
      
      // Recargar entregas
      if (typeof onTareaActualizada === 'function') {
        onTareaActualizada();
      }
    } catch (error) {
      console.error('Error al calificar:', error);
      toast.error('Error al guardar la calificación');
    } finally {
      setCalificando(false);
    }
  };

  // Cerrar modal de calificación
  const cerrarModalCalificar = () => {
    setEntregaCalificar(null);
    setFormCalificacion({ nota: '', observacion: '' });
  };

  // Convertir fecha a ISO completo para el backend
  const convertirFechaAISO = (fechaStr) => {
    if (!fechaStr) return null;
    // Si ya viene en formato ISO completo, retornarlo
    if (fechaStr.includes('T')) return fechaStr;
    // Si viene en formato YYYY-MM-DD, convertir a ISO con hora media noche UTC
    const fecha = new Date(fechaStr + 'T00:00:00.000Z');
    return fecha.toISOString();
  };

  // Cerrar modal
  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setTareaEditar(null);
    setFormData({
      titulo: '',
      descripcion: '',
      fechalimite: '',
      estado: ''
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios
  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    
    if (!tareaEditar) return;
    
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idTarea = get(tareaEditar, 'idtarea') || get(tareaEditar, 'idTarea');
    
    if (!idTarea) {
      toast.error('No se pudo obtener el ID de la tarea');
      return;
    }

    try {
      setGuardando(true);
      
      // Preparar datos para enviar (solo campos modificados)
      const datosActualizar = {};
      if (formData.titulo.trim()) datosActualizar.titulo = formData.titulo.trim();
      if (formData.descripcion.trim()) datosActualizar.descripcion = formData.descripcion.trim();
      if (formData.fechalimite) {
        datosActualizar.fechalimite = convertirFechaAISO(formData.fechalimite);
      }
      if (formData.estado.trim()) datosActualizar.estado = formData.estado.trim();

      await editarTarea(idTarea, datosActualizar);
      
      toast.success('Tarea actualizada correctamente');
      cerrarModalEditar();
      
      // Llamar callback del componente padre para recargar datos
      if (typeof onTareaActualizada === 'function') {
        onTareaActualizada();
      }
    } catch (error) {
      console.error('Error al editar tarea:', error);
      toast.error('Error al actualizar la tarea');
    } finally {
      setGuardando(false);
    }
  };

  // Normaliza campos por si vienen en minúsculas o mayúsculas
  const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];

  return (
    <div className="profesor-tareas-list-container">
      {/* Controles de búsqueda y paginación */}
      <div className="tareas-controls">
        <div className="search-filter-group filters-grid">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="items-per-page-container">
            <select 
              value={itemsPerPage} 
              onChange={(e) => { 
                setItemsPerPage(Number(e.target.value)); 
                setCurrentPage(1); 
              }}
              className="items-per-page-select"
            >
              <option value={5}>📄 5 por página</option>
              <option value={10}>📄 10 por página</option>
              <option value={25}>📄 25 por página</option>
              <option value={50}>📄 50 por página</option>
            </select>
          </div>
        </div>
        
        <div className="results-info">
          <span>Mostrando {paginatedTareas.length} de {filteredTareas.length} tareas</span>
        </div>
      </div>

      {/* Lista de tareas paginadas */}
      <div className="tareas-list">
        {paginatedTareas.length === 0 ? (
          <div className="tareas-list-vacio">
            {debouncedSearchTerm.trim() 
              ? `No se encontraron tareas para "${debouncedSearchTerm}"`
              : 'No hay tareas que mostrar.'
            }
          </div>
        ) : (
          paginatedTareas.map(t => {
            const titulo = get(t, 'titulo');
            const descripcion = get(t, 'descripcion');
            const fechaEntrega = get(t, 'fechalimite') || get(t, 'fechaEntrega');
            const materia = get(t, 'materia');
            const clase = get(t, 'clase');
            const periodo = get(t, 'periodo');
            const grado = get(t, 'grado');
            const grupo = get(t, 'grupo');
            const fechaCreacion = get(t, 'fechacreacion') || get(t, 'fechaCreacion');
            const estado = get(t, 'estado');
            const nombreArchivo = get(t, 'nombreArchivo');
            const descripcionRecurso = get(t, 'descripcionRecurso');
            const rutaArchivo = get(t, 'rutaArchivo');
            const tipoArchivo = get(t, 'tipoArchivo');

            return (
              <div className="tarea-item" key={get(t, 'idtarea') || get(t, 'idTarea')}>
                <div className="tarea-header">
                  <div className="tarea-titulo">
                    <span className="tarea-icon">📝</span>
                    <h3>{titulo}</h3>
                  </div>
                  <div className="tarea-actions">
                    <button 
                      className="btn-editar-tarea"
                      onClick={() => abrirModalEditar(t)}
                      title="Editar tarea"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-ver-entregas"
                      onClick={() => abrirModalEntregas(t)}
                      title="Ver entregas"
                    >
                      📋 Entregas
                    </button>
                  </div>
                </div>
                <div className="tarea-body">
                  <div className="tarea-desc">
                    <ExpandableText text={descripcion} maxLength={100} />
                  </div>
                  <div className="tarea-meta">
                    {estado && <span className="tarea-estado">Estado: {estado}</span>}
                    {materia && <span className="tarea-materia">{materia}</span>}
                    {(grado || grupo) && <span className="tarea-grado">{grado ? `${grado}°` : ''}{grupo ? grupo : ''}</span>}
                    {clase && <span className="tarea-clase">Grupo: {clase}</span>}
                    {periodo && <span className="tarea-periodo">Periodo: {periodo}</span>}
                    {fechaEntrega && (
                      <span className="tarea-fecha-entrega">
                        📅 Entrega: {new Date(fechaEntrega).toLocaleDateString()}
                      </span>
                    )}
                    {fechaCreacion && (
                      <span className="tarea-fecha-creacion">
                        Creada: {new Date(fechaCreacion).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {rutaArchivo && (
                    <div className="tarea-archivo">
                      <span className="archivo-icon">📎</span>
                      <a 
                        href={rutaArchivo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="archivo-link"
                      >
                        {nombreArchivo || 'Ver archivo adjunto'}
                      </a>
                      {descripcionRecurso && (
                        <span className="archivo-descripcion"> - {descripcionRecurso}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={adjustedCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal de Entregas de Tarea */}
      {modalEntregasAbierto && (
        <div className="modal-overlay" onClick={cerrarModalEntregas}>
          <div className="modal-entregas" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Entregas de la Tarea</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalEntregas}>
                ✕
              </button>
            </div>
            
            <div className="entregas-content">
              {loadingEntregas ? (
                <div className="loading-entregas">
                  <p>Cargando entregas...</p>
                </div>
              ) : entregas.length === 0 ? (
                <div className="sin-entregas">
                  <p>📭 No hay entregas para esta tarea</p>
                </div>
              ) : (
                <div className="entregas-lista">
                  {entregas.map((entrega) => (
                    <div key={entrega.identrega} className="entrega-item">
                      <div className="entrega-header">
                        <span className="entrega-alumno">👤 {entrega.alumno}</span>
                        <span className={`entrega-estado estado-${entrega.estado?.toLowerCase()}`}>
                          {entrega.estado}
                        </span>
                      </div>
                      
                      {entrega.descripcion && (
                        <div className="entrega-descripcion">
                          <strong>Descripción:</strong> {entrega.descripcion}
                        </div>
                      )}
                      
                      <div className="entrega-meta">
                        {entrega.fechaentrega && (
                          <span className="entrega-fecha">
                            📅 {new Date(entrega.fechaentrega).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {(entrega.rutaArchivo || entrega.ruta) && (
                        <div className="entrega-archivo">
                          <span className="archivo-icon">📎</span>
                          <a 
                            href={entrega.rutaArchivo || entrega.ruta} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="archivo-link"
                          >
                            {entrega.nombreArchivo || 'Ver archivo entregado'}
                          </a>
                          {entrega.tipoArchivo && (
                            <span className="archivo-tipo">({entrega.tipoArchivo})</span>
                          )}
                        </div>
                      )}

                      <div className="entrega-actions">
                        <button 
                          className="btn-calificar"
                          onClick={() => abrirModalCalificar(entrega)}
                          title="Calificar entrega"
                        >
                          📝 Calificar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {entregaCalificar && (
        <div className="modal-overlay" onClick={cerrarModalCalificar}>
          <div className="modal-calificar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Calificar Entrega</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalCalificar}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitCalificar} className="form-calificar">
              <div className="alumno-info">
                <span className="alumno-nombre">👤 {entregaCalificar.alumno}</span>
              </div>

              <div className="form-group">
                <label htmlFor="nota">Nota (0-100) *</label>
                <input
                  type="number"
                  id="nota"
                  name="nota"
                  value={formCalificacion.nota}
                  onChange={(e) => setFormCalificacion(prev => ({
                    ...prev,
                    nota: e.target.value
                  }))}
                  placeholder="Ingrese la nota"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  className="input-nota"
                />
              </div>

              <div className="form-group">
                <label htmlFor="observacion">Observación (opcional)</label>
                <textarea
                  id="observacion"
                  name="observacion"
                  value={formCalificacion.observacion}
                  onChange={(e) => setFormCalificacion(prev => ({
                    ...prev,
                    observacion: e.target.value
                  }))}
                  placeholder="Agrega una observación o retroalimentación..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={cerrarModalCalificar}
                  disabled={calificando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-guardar-calificacion"
                  disabled={calificando}
                >
                  {calificando ? 'Guardando...' : '✅ Guardar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Tarea */}
      {modalEditarAbierto && (
        <div className="modal-overlay" onClick={cerrarModalEditar}>
          <div className="modal-editar-tarea" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Tarea</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalEditar}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditar} className="form-editar-tarea">
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Título de la tarea"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción de la tarea"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fechalimite">Fecha Límite</label>
                <input
                  type="date"
                  id="fechalimite"
                  name="fechalimite"
                  value={formData.fechalimite}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar estado...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={cerrarModalEditar}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-guardar"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
