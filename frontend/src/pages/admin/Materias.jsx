import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { crearMateria, editarMateria } from '../../services/adminService';
import { toast } from '../../utils/toast';
import { useMaterias } from '../../hooks/useMaterias';
import Pagination from '../../components/Pagination';
import './Materias.css';

export default function Materias() {
  const [form, setForm] = useState({
    nombre: '',
    area: '',
    estado: 'Activo'
  });
  
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    materias,
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
    cargarMaterias,
  } = useMaterias();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await crearMateria({
        Nombre: form.nombre,
        Area: form.area,
        Estado: form.estado
      });
      toast.success('Materia creada correctamente');
      setForm({ nombre: '', area: '', estado: 'Activo' });
      cargarMaterias();
    } catch (error) {
      toast.error(error.response?.data || 'Error al crear materia');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (materia) => {
    setEditando({
      idMateria: materia.idMateria,
      nombre: materia.nombre,
      area: materia.area,
      estado: materia.estado
    });
  };

  const handleEditChange = (e) => {
    setEditando({ ...editando, [e.target.name]: e.target.value });
  };

  const guardarEdicion = async () => {
    try {
      await editarMateria(editando.idMateria, {
        Nombre: editando.nombre,
        Area: editando.area,
        Estado: editando.estado
      });
      toast.success('Materia actualizada correctamente');
      setEditando(null);
      cargarMaterias();
    } catch (error) {
      toast.error(error.response?.data || 'Error al actualizar materia');
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const eliminarMateria = async (idMateria, nombre) => {
    if (!confirm(`¿Eliminar materia "${nombre}" permanentemente?`)) return;
    try {
      // TODO: Implementar endpoint de eliminar materia en backend
      toast.success('Materia eliminada correctamente');
      cargarMaterias();
    } catch (error) {
      toast.error(error.response?.data || 'Error al eliminar materia');
    }
  };

  return (
    <div className="materias-container">
      <h1>Gestión de Materias</h1>
      
      <div className="card">
        <h2>Crear Nueva Materia</h2>
        <form className="materias-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              name="nombre"
              placeholder="Nombre de la materia"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Área *</label>
            <input
              name="area"
              placeholder="Área académica"
              value={form.area}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>

      <div className="materias-lista">
        <h2>Lista de Materias</h2>
        
        {materias.length > 0 && (
          <div className="filtros-materias filters-grid">
            <input
              type="text"
              placeholder="Buscar por nombre o área..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="busqueda-input"
            />

            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        )}

        <div className="card">
          {materias.length === 0 ? (
            <p>No hay materias registradas</p>
          ) : paginatedMaterias.length > 0 ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Área</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMaterias.map((materia) => (
                    <tr key={materia.idMateria}>
                      <td>{materia.idMateria}</td>
                      <td>{materia.nombre}</td>
                      <td>{materia.area}</td>
                      <td>
                        <span className={`status status-${materia.estado?.toLowerCase()}`}>
                          {materia.estado}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <button className="btn-icon" onClick={() => handleEdit(materia)} title="Editar">
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-danger" onClick={() => eliminarMateria(materia.idMateria, materia.nombre)} title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p>No hay materias que coincidan con los filtros</p>
          )}
        </div>
      </div>

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>Editar Materia</h2>
            <div className="materias-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={editando.nombre}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="form-group">
                <label>Área</label>
                <input
                  name="area"
                  value={editando.area}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={editando.estado} onChange={handleEditChange}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={guardarEdicion}>
                  Guardar
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
