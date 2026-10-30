import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { crearUsuario, listarUsuarios, editarUsuario, getUltimoAcceso } from '../../services/adminService';
import { toast } from '../../utils/toast';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import './Usuarios.css';

export default function Usuarios() {
  const [form, setForm] = useState({
    nombre: '',
    apellido1: '',
    apellido2: '',
    usuario: '',
    contrasena: '',
    identificacion: '',
    direccion: '',
    rol: 'Alumno'
  });
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [usuarioOriginal, setUsuarioOriginal] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const [usersData, accesosData] = await Promise.all([
        listarUsuarios(),
        getUltimoAcceso()
      ]);

      const accesosMap = new Map(accesosData.map(acceso => [acceso.idUsuario, acceso.ultimoAcceso]));

      const usuariosConAcceso = usersData.map(user => ({
        ...user,
        ultimoAcceso: accesosMap.get(user.idUsuario) || 'N/A'
      }));

      setUsuarios(usuariosConAcceso);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = !debouncedBusqueda || 
      u.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
      u.apellido1.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
      u.usuario.toLowerCase().includes(debouncedBusqueda.toLowerCase());
    
    const matchRol = !filtroRol || u.roles?.includes(filtroRol);
    const matchEstado = !filtroEstado || u.estado === filtroEstado;
    
    return matchBusqueda && matchRol && matchEstado;
  });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(inicio, inicio + itemsPorPagina);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!form.apellido1.trim()) {
      toast.error('El apellido es requerido');
      return;
    }
    if (!form.usuario.trim()) {
      toast.error('El usuario es requerido');
      return;
    }
    if (!form.contrasena.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }
    if (form.contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!form.identificacion.trim()) {
      toast.error('La identificación es requerida');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        Nombre: form.nombre.trim(),
        Apellido1: form.apellido1.trim(),
        Apellido2: form.apellido2.trim(),
        Usuario: form.usuario.trim(),
        Contrasena: form.contrasena,
        Identificacion: form.identificacion.trim(),
        Direccion: form.direccion.trim(),
        Rol: form.rol,
        Estado: 'Activo'
      };

      await crearUsuario(payload);
      toast.success('Usuario creado correctamente');
      setForm({
        nombre: '',
        apellido1: '',
        apellido2: '',
        usuario: '',
        contrasena: '',
        identificacion: '',
        direccion: '',
        rol: 'Alumno'
      });
      cargarUsuarios();
    } catch (error) {
      console.error('Error creando usuario:', error);
      toast.error(error.response?.data?.message || error.response?.data || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    setUsuarioOriginal(u);
    setEditando({ 
      ...u,
      direccion: u.direccion || ''
    });
  };

  const handleEditChange = (e) => {
    setEditando({
      ...editando,
      [e.target.name]: e.target.value
    });
  };

  const guardar = async () => {
    try {
      const datosParaActualizar = {};

      if (editando.nombre !== usuarioOriginal.nombre) {
        datosParaActualizar.Nombre = editando.nombre;
      }
      if (editando.apellido1 !== usuarioOriginal.apellido1) {
        datosParaActualizar.Apellido1 = editando.apellido1;
      }
      // Handle optional fields that can be null
      if ((editando.apellido2 || '') !== (usuarioOriginal.apellido2 || '')) {
        datosParaActualizar.Apellido2 = editando.apellido2 || '';
      }
      if ((editando.direccion || '') !== (usuarioOriginal.direccion || '')) {
        datosParaActualizar.Direccion = editando.direccion || '';
      }
      if (editando.estado !== usuarioOriginal.estado) {
        datosParaActualizar.Estado = editando.estado;
      }
      if (editando.identificacion !== usuarioOriginal.identificacion) {
        datosParaActualizar.Identificacion = editando.identificacion;
      }
      
      if (editando.contrasena) {
        if (editando.contrasena.length < 6) {
          toast.error('La nueva contraseña debe tener al menos 6 caracteres');
          return;
        }
        datosParaActualizar.Contrasena = editando.contrasena;
      }

      if (Object.keys(datosParaActualizar).length === 0) {
        toast.info('No hay cambios para guardar.');
        setEditando(null);
        setUsuarioOriginal(null);
        return;
      }

      await editarUsuario(editando.idUsuario, datosParaActualizar);
      toast.success('Usuario actualizado correctamente');
      setEditando(null);
      setUsuarioOriginal(null);
      cargarUsuarios();
    } catch (error) {
      let errorMessage = 'Error al actualizar usuario';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message && typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setUsuarioOriginal(null);
  };

  const eliminar = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea cambiar el estado del usuario "${usuario.nombre}" a "Eliminado"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const datosParaActualizar = {
        Nombre: usuario.nombre,
        Apellido1: usuario.apellido1,
        Apellido2: usuario.apellido2 || '',
        Direccion: usuario.direccion || '',
        Estado: 'Eliminado',
        Identificacion: usuario.identificacion,
      };

      try {
        await editarUsuario(usuario.idUsuario, datosParaActualizar);
        Swal.fire(
          '¡Estado cambiado!',
          'El estado del usuario ha sido cambiado a "Eliminado".',
          'success'
        );
        cargarUsuarios();
      } catch (error) {
        Swal.fire(
          'Error',
          error.response?.data?.message || 'Error al cambiar el estado del usuario.',
          'error'
        );
      }
    }
  };

  return (
    <div className="usuarios-container">
      <h1>Gestión de Usuarios</h1>
      
      <div className="card">
        <h2>Crear Nuevo Usuario</h2>
        <form className="usuarios-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Primer Apellido *</label>
            <input
              name="apellido1"
              placeholder="Primer Apellido"
              value={form.apellido1}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Segundo Apellido</label>
            <input
              name="apellido2"
              placeholder="Segundo Apellido"
              value={form.apellido2}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Usuario *</label>
            <input
              name="usuario"
              placeholder="Usuario"
              value={form.usuario}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Identificación *</label>
            <input
              name="identificacion"
              placeholder="Identificación"
              value={form.identificacion}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Dirección</label>
            <input
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Rol *</label>
            <select name="rol" value={form.rol} onChange={handleChange}>
              <option value="Alumno">Alumno</option>
              <option value="Profesor">Profesor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>

      <div className="usuarios-lista">
        <h2>Lista de Usuarios</h2>
        
        <div className="filtros-usuarios filters-grid">
          <div className="form-group">
            <input
              className="busqueda-input"
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
            />
          </div>
          <div className="form-group">
            <select value={filtroRol} onChange={(e) => { setFiltroRol(e.target.value); setPaginaActual(1); }}>
              <option value="">Todos los roles</option>
              <option value="Admin">Admin</option>
              <option value="Profesor">Profesor</option>
              <option value="Alumno">Alumno</option>
            </select>
          </div>
          <div className="form-group">
            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}>
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Eliminado">Eliminado</option>
            </select>
          </div>
          <div className="form-group">
            <select value={itemsPorPagina} onChange={(e) => { setItemsPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
            </select>
          </div>
        </div>

        <div className="card">
          {usuariosPaginados.length > 0 ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Roles</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPaginados.map(u => (
                    <tr key={u.idUsuario}>
                      <td data-label="Nombre">{`${u.nombre} ${u.apellido1} ${u.apellido2 || ''}`}</td>
                      <td data-label="Usuario">{u.usuario}</td>
                      <td data-label="Roles">{u.roles?.join(', ')}</td>
                      <td data-label="Estado">
                        <span className={`estado-usuario ${u.estado?.toLowerCase()}`}>
                          {u.estado}
                        </span>
                      </td>
                      <td data-label="Último Acceso">{u.ultimoAcceso}</td>
                      <td data-label="Acciones">
                        <button className="btn-icon" onClick={() => handleEdit(u)} title="Editar">
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-danger" type="button" onClick={() => eliminar(u)} title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={paginaActual}
                totalPages={totalPaginas}
                onPageChange={setPaginaActual}
              />
            </>
          ) : (
            <p>No hay usuarios que coincidan con los filtros</p>
          )}
        </div>
      </div>

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>Editar Usuario</h2>
            <div className="usuarios-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={editando.nombre}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="form-group">
                <label>Primer Apellido</label>
                <input
                  name="apellido1"
                  value={editando.apellido1}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input
                  name="apellido2"
                  value={editando.apellido2 || ''}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="form-group">
                <label>Dirección</label>
                <input
                  name="direccion"
                  value={editando.direccion || ''}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Identificación</label>
                <input
                  name="identificacion"
                  value={editando.identificacion || ''}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="contrasena"
                  placeholder="Dejar en blanco para no cambiar"
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={editando.estado} onChange={handleEditChange}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Eliminado">Eliminado</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={guardar}>
                  Guardar
                </button>
                <button type="button" className="btn btn-danger" onClick={cancelarEdicion}>
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
