import React, { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import { entregarTarea, obtenerMiEntrega, editarEntrega } from '../../services/alumnoService';
import { toast } from '../../utils/toast';
import './AlumnoTareasList.css';
import ExpandableText from '../../components/ExpandableText';

export default function AlumnoTareasList({ tareas, onTareaEntregada }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalEntregaAbierto, setModalEntregaAbierto] = useState(false);
  const [tareaEntrega, setTareaEntrega] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [descripcionEntrega, setDescripcionEntrega] = useState('');
  const [entregando, setEntregando] = useState(false);
  const [miEntrega, setMiEntrega] = useState(null);
  const [cargandoEntrega, setCargandoEntrega] = useState(false);
  const [editandoEntrega, setEditandoEntrega] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar tareas basado en búsqueda
  const filteredTareas = useMemo(() => {
    if (!tareas || tareas.length === 0) return [];
    
    if (!debouncedSearchTerm.trim()) return tareas;

    const filtered = tareas.filter(tarea => {
      const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
      
      const titulo = get(tarea, 'titulo')?.toLowerCase() || '';
      const descripcion = get(tarea, 'descripcion')?.toLowerCase() || '';
      
      const searchLower = debouncedSearchTerm.toLowerCase();
      
      return titulo.includes(searchLower) ||
             descripcion.includes(searchLower);
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
    return <div className="tareas-list-vacio">No tienes tareas asignadas.</div>;
  }

  // Normaliza campos por si vienen en minúsculas o mayúsculas
  const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];

  // Abrir modal de entrega
  const abrirModalEntrega = async (tarea) => {
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idTarea = get(tarea, 'idtarea') || get(tarea, 'idTarea');
    
    setTareaEntrega(tarea);
    setArchivoSeleccionado(null);
    setDescripcionEntrega('');
    setMiEntrega(null);
    setModalEntregaAbierto(true);

    // Intentar cargar la entrega existente
    if (idTarea) {
      try {
        setCargandoEntrega(true);
        const entrega = await obtenerMiEntrega(idTarea);
        setMiEntrega(entrega);
      } catch (error) {
        // Si no existe la entrega, está bien (404 es esperado)
        console.log('No hay entrega previa');
      } finally {
        setCargandoEntrega(false);
      }
    }
  };

  // Cerrar modal de entrega
  const cerrarModalEntrega = () => {
    setModalEntregaAbierto(false);
    setTareaEntrega(null);
    setArchivoSeleccionado(null);
    setDescripcionEntrega('');
    setMiEntrega(null);
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (ejemplo: máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe superar los 10MB');
        e.target.value = null;
        return;
      }
      setArchivoSeleccionado(file);
    }
  };

  // Manejar edición de entrega
  const handleSubmitEditarEntrega = async (e) => {
    e.preventDefault();
    
    if (!tareaEntrega || !miEntrega) return;
    
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idEntrega = get(miEntrega, 'identrega');
    
    if (!idEntrega) {
      toast.error('No se pudo obtener el ID de la entrega');
      return;
    }

    if (!archivoSeleccionado) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    try {
      setEntregando(true);
      
      await editarEntrega(idEntrega, archivoSeleccionado, descripcionEntrega);
      
      toast.success('Entrega actualizada correctamente');
      cerrarModalEntrega();
      
      // Llamar callback del componente padre para recargar datos
      if (typeof onTareaEntregada === 'function') {
        onTareaEntregada();
      }
    } catch (error) {
      console.error('Error al editar entrega:', error);
      const mensajeError = error.response?.data?.mensaje || 'Error al actualizar la entrega';
      toast.error(mensajeError);
    } finally {
      setEntregando(false);
    }
  };

  // Manejar entrega de tarea
  const handleSubmitEntrega = async (e) => {
    e.preventDefault();
    
    if (!tareaEntrega) return;
    
    const get = (t, k) => t[k] || t[k?.toLowerCase?.()] || t[k?.toUpperCase?.()];
    const idTarea = get(tareaEntrega, 'idtarea') || get(tareaEntrega, 'idTarea');
    
    if (!idTarea) {
      toast.error('No se pudo obtener el ID de la tarea');
      return;
    }

    if (!archivoSeleccionado) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    try {
      setEntregando(true);
      
      await entregarTarea(idTarea, archivoSeleccionado, descripcionEntrega);
      
      toast.success('Tarea entregada correctamente');
      cerrarModalEntrega();
      
      // Llamar callback del componente padre para recargar datos
      if (typeof onTareaEntregada === 'function') {
        onTareaEntregada();
      }
    } catch (error) {
      console.error('Error al entregar tarea:', error);
      const mensajeError = error.response?.data?.mensaje || 'Error al entregar la tarea';
      toast.error(mensajeError);
    } finally {
      setEntregando(false);
    }
  };

  // Función para obtener el color del estado de entrega
  const getEstadoEntregaColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#fff3cd';
      case 'entregada': return '#d1ecf1';
      case 'revisada': return '#d4edda';
      case 'calificada': return '#d1ecf1';
      default: return '#ecf0f1';
    }
  };

  const getEstadoEntregaTextoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#856404';
      case 'entregada': return '#0c5460';
      case 'revisada': return '#155724';
      case 'calificada': return '#004085';
      default: return '#666';
    }
  };

  return (
    <div className="alumno-tareas-list-container">
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
            const fechaLimite = get(t, 'fechalimite');
            const fechaCreacion = get(t, 'fechacreacion');
            const estado = get(t, 'estado');
            const nombreArchivo = get(t, 'nombreArchivo');
            const rutaArchivo = get(t, 'rutaArchivo');
            const tipoArchivo = get(t, 'tipoArchivo');
            const yaEntregada = get(t, 'yaEntregada');
            const fechaEntrega = get(t, 'fechaEntrega');
            const estadoEntrega = get(t, 'estadoEntrega');

            return (
              <div className="tarea-item" key={get(t, 'idtarea') || get(t, 'idTarea')}>
                <div className="tarea-header">
                  <div className="tarea-titulo">
                    <span className="tarea-icon">📝</span>
                    <h3>{titulo}</h3>
                  </div>
                  {yaEntregada && estadoEntrega && (
                    <span 
                      className="tarea-estado-entrega"
                      style={{
                        backgroundColor: getEstadoEntregaColor(estadoEntrega),
                        color: getEstadoEntregaTextoColor(estadoEntrega)
                      }}
                    >
                      {estadoEntrega}
                    </span>
                  )}
                </div>
                <div className="tarea-body">
                  <div className="tarea-desc">
                    <ExpandableText text={descripcion} maxLength={100} />
                  </div>
                  {estado !== 'Eliminada' && (
                    <button 
                      className={yaEntregada ? "btn-ver-entrega" : "btn-entregar-tarea"}
                      onClick={() => abrirModalEntrega(t)}
                      title={yaEntregada ? "Ver mi entrega" : "Entregar tarea"}
                    >
                      {yaEntregada ? '📋 Ver Mi Entrega' : '📤 Entregar Tarea'}
                    </button>
                  )}
                  <div className="tarea-meta">
                    {fechaLimite && (
                      <span className="tarea-fecha-limite">
                        📅 Límite: {new Date(fechaLimite).toLocaleDateString()}
                      </span>
                    )}
                    {fechaCreacion && (
                      <span className="tarea-fecha-creacion">
                        Creada: {new Date(fechaCreacion).toLocaleDateString()}
                      </span>
                    )}
                    {yaEntregada && fechaEntrega && (
                      <span className="tarea-fecha-entrega">
                        ✅ Entregada: {new Date(fechaEntrega).toLocaleDateString()}
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
                      {tipoArchivo && (
                        <span className="archivo-tipo">({tipoArchivo})</span>
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

      {/* Modal de Entrega de Tarea */}
      {modalEntregaAbierto && (
        <div className="modal-overlay" onClick={cerrarModalEntrega}>
          <div className="modal-entregar-tarea" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{miEntrega ? 'Mi Entrega' : 'Entregar Tarea'}</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalEntrega}>
                ✕
              </button>
            </div>
            
            {tareaEntrega && (
              <div className="tarea-info-entrega">
                <h3>{get(tareaEntrega, 'titulo')}</h3>
                <p className="tarea-descripcion-entrega">
                  {get(tareaEntrega, 'descripcion')}
                </p>
              </div>
            )}

            <div className="form-entregar-tarea">
              {(!cargandoEntrega && miEntrega && !editandoEntrega) ? (
                <div className="entrega-info">
                  <div className="entrega-estado-badge">
                    <span className={`estado-badge estado-${miEntrega.estado?.toLowerCase() || 'default'}`}>
                      {miEntrega.estado}
                    </span>
                  </div>

                  {miEntrega.descripcion && (
                    <div className="entrega-descripcion">
                      <strong>Descripción:</strong> {miEntrega.descripcion}
                    </div>
                  )}

                  <div className="entrega-meta">
                    {miEntrega.fechaentrega && (
                      <span className="entrega-fecha">
                        📅 Entregada: {new Date(miEntrega.fechaentrega).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {(miEntrega.rutaArchivo || miEntrega.archivo) && (
                    <div className="entrega-archivo">
                      <span className="archivo-icon">📎</span>
                      <a 
                        href={miEntrega.rutaArchivo || miEntrega.archivo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="archivo-link"
                      >
                        {miEntrega.archivo || 'Ver archivo entregado'}
                      </a>
                      {miEntrega.tipoArchivo && (
                        <span className="archivo-tipo">({miEntrega.tipoArchivo})</span>
                      )}
                    </div>
                  )}

                  {miEntrega.nota !== null && miEntrega.nota !== undefined && (
                    <div className="entrega-calificacion">
                      <div className="calificacion-item">
                        <span className="calificacion-label">📊 Nota:</span>
                        <span className="calificacion-valor">{miEntrega.nota}</span>
                      </div>
                      {miEntrega.observacion && (
                        <div className="calificacion-observacion">
                          <strong>Observación:</strong> {miEntrega.observacion}
                        </div>
                      )}
                      {miEntrega.fechacalificacion && (
                        <div className="calificacion-fecha">
                          Calificada: {new Date(miEntrega.fechacalificacion).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-cancelar"
                      onClick={cerrarModalEntrega}
                    >
                      Cerrar
                    </button>
                    <button 
                      type="button" 
                      className="btn-reemplazar"
                      onClick={() => {
                        setEditandoEntrega(true);
                      }}
                    >
                      🔄 Reemplazar Entrega
                    </button>
                  </div>
                </div>
              ) : editandoEntrega ? (
                <form onSubmit={handleSubmitEditarEntrega}>
                  <div className="form-group">
                    <label htmlFor="archivo">Nuevo archivo de entrega *</label>
                    <input
                      type="file"
                      id="archivo"
                      name="archivo"
                      onChange={handleFileChange}
                      required
                      className="input-file"
                    />
                    {archivoSeleccionado && (
                      <p className="archivo-seleccionado">
                        ✓ {archivoSeleccionado.name} ({(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="descripcion">Nueva descripción (opcional)</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={descripcionEntrega}
                      onChange={(e) => setDescripcionEntrega(e.target.value)}
                      placeholder="Agrega una descripción o comentario sobre tu entrega..."
                      rows="4"
                    />
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-cancelar"
                      onClick={() => {
                        setEditandoEntrega(false);
                        setArchivoSeleccionado(null);
                        setDescripcionEntrega('');
                      }}
                      disabled={entregando}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-reemplazar"
                      disabled={entregando || !archivoSeleccionado}
                    >
                      {entregando ? 'Actualizando...' : '✅ Actualizar Entrega'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitEntrega}>
                  <div className="form-group">
                    <label htmlFor="archivo">Archivo de entrega *</label>
                    <input
                      type="file"
                      id="archivo"
                      name="archivo"
                      onChange={handleFileChange}
                      required
                      className="input-file"
                    />
                    {archivoSeleccionado && (
                      <p className="archivo-seleccionado">
                        ✓ {archivoSeleccionado.name} ({(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción (opcional)</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={descripcionEntrega}
                      onChange={(e) => setDescripcionEntrega(e.target.value)}
                      placeholder="Agrega una descripción o comentario sobre tu entrega..."
                      rows="4"
                    />
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-cancelar"
                      onClick={cerrarModalEntrega}
                      disabled={entregando}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-entregar"
                      disabled={entregando || !archivoSeleccionado}
                    >
                      {entregando ? 'Entregando...' : '📤 Entregar Tarea'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
