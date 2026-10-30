import { useState } from 'react';
import { useRecursos } from '../hooks/useRecursos';
import RecursosList from '../components/RecursosList';
import Pagination from '../components/Pagination';
import { editarRecurso, eliminarRecurso } from '../services/adminService';
import { toast } from '../utils/toast';
import './RecursosPage.css';

export default function RecursosPage({ userRole, title }) {
  const {
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
  } = useRecursos(userRole);

  const [editando, setEditando] = useState(null);

  const handleEdit = (r) => {
    setEditando({ ...r });
  };

  const handleEditChange = (e) => {
    setEditando({ ...editando, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    try {
      await editarRecurso(editando.idRecurso, {
        Nombre: editando.nombre,
        Descripcion: editando.descripcion,
        Ruta: editando.ruta,
        Tipo: editando.tipo,
        estado: editando.estado,
      });
      toast.success('Recurso actualizado correctamente');
      setEditando(null);
      cargarRecursos();
    } catch (error) {
      toast.error(error.response?.data || 'Error al actualizar recurso');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este recurso permanentemente?')) return;
    try {
      await eliminarRecurso(id);
      toast.success('Recurso eliminado correctamente');
      cargarRecursos();
    } catch {
      toast.error('Error al eliminar recurso');
    }
  };

  if (loading) {
    return <div className="recursos-container"><p>Cargando recursos...</p></div>;
  }

  return (
    <div className="recursos-container">
      <h1>{title}</h1>

      {recursos.length === 0 ? (
        <div className="card">
          <p>No hay recursos registrados aún</p>
        </div>
      ) : (
        <>
          <div className="filtros-recursos filters-grid">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="busqueda-input"
            />

            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {userRole === 'admin' && (
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            )}

            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="card">
            {paginatedRecursos.length > 0 ? (
              <>
                <RecursosList
                  recursos={paginatedRecursos}
                  userRole={userRole}
                  onEdit={handleEdit}
                  onDelete={eliminar}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <p>No hay recursos que coincidan con los filtros</p>
            )}
          </div>
        </>
      )}

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>Editar Recurso</h2>
            <div className="recursos-form">
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={editando.nombre} onChange={handleEditChange} />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={editando.descripcion || ''} onChange={handleEditChange} rows="3" />
              </div>

              <div className="form-group">
                <label>Ruta/URL</label>
                <input name="ruta" value={editando.ruta} onChange={handleEditChange} />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <input name="tipo" value={editando.tipo} onChange={handleEditChange} />
              </div>

              {userRole === 'admin' && (
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" value={editando.estado} onChange={handleEditChange}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-primary" onClick={guardar}>Guardar</button>
                <button className="btn btn-danger" onClick={() => setEditando(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
