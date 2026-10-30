import { useState, useEffect } from 'react';
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaWindowClose 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { crearClase, listarClases, obtenerClase, editarClase, listarMaterias, listarAlumnos, listarProfesores } from '../../services/adminService';
import { toast } from '../../utils/toast';
import Pagination from '../../components/Pagination';
import './Clases.css';

export default function Clases() {
  const [form, setForm] = useState({
    periodo: '',
    grupo: '',
    modalidad: 'Presencial',
    grado: '',
    ano: new Date().getFullYear(),
    idMateria: '',
    idProfesor: '',
    estado: 'Activo'
  });

  const [horarios, setHorarios] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [clases, setClases] = useState([]);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroAlumnosDisponibles, setFiltroAlumnosDisponibles] = useState('');
  const [alumnoParaAgregar, setAlumnoParaAgregar] = useState('');

  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroProfesor, setFiltroProfesor] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const normalizeMaterias = (data) => data.map((item) => ({
    idMateria: item.idMateria ?? item.id ?? item.idMateriaFK,
    nombre: item.nombre ?? item.nombreMateria ?? item.nombreMateria ?? item.descripcion ?? '',
    area: item.area ?? item.nombreArea ?? ''
  }));

  const normalizeProfesores = (data) => data.map((item) => ({
    idProfesor: item.idProfesor ?? item.idUsuario ?? item.id ?? item.idProfesorFK,
    nombre: (item.nombreCompleto ?? ([item.nombre, item.apellido1 ?? item.apellidoPaterno, item.apellido2 ?? item.apellidoMaterno]
      .filter(Boolean)
      .join(' '))) || item.usuario || ''
  }));

  const normalizeAlumnos = (data) => data.map((item) => ({
    idAlumno: item.idAlumno ?? item.idUsuario ?? item.id ?? item.idAlumnoFK,
    nombreCompleto: (item.nombreCompleto ?? ([item.nombre, item.apellido1 ?? item.apellidoPaterno, item.apellido2 ?? item.apellidoMaterno]
      .filter(Boolean)
      .join(' '))) || item.usuario || ''
  }));

  const isEmptyRouteError = (error) => {
    const status = error?.response?.status;
    return status === 404 || status === 204 || (status === undefined && error?.message?.includes('No se pudo encontrar')); 
  };

  const cargarDatos = async () => {
    const resultados = await Promise.allSettled([
      listarProfesores(),
      listarMaterias(),
      listarAlumnos(),
      listarClases()
    ]);

    const errores = [];

    if (resultados[0].status === 'fulfilled') {
      setProfesores(normalizeProfesores(resultados[0].value));
    } else if (isEmptyRouteError(resultados[0].reason)) {
      setProfesores([]);
      console.warn('Profesores vacío o ruta no encontrada', resultados[0].reason);
    } else {
      errores.push('profesores');
      console.error('Error cargando profesores:', resultados[0].reason);
    }

    if (resultados[1].status === 'fulfilled') {
      setMaterias(normalizeMaterias(resultados[1].value));
    } else if (isEmptyRouteError(resultados[1].reason)) {
      setMaterias([]);
      console.warn('Materias vacío o ruta no encontrada', resultados[1].reason);
    } else {
      errores.push('materias');
      console.error('Error cargando materias:', resultados[1].reason);
    }

    if (resultados[2].status === 'fulfilled') {
      setAlumnosDisponibles(normalizeAlumnos(resultados[2].value));
    } else if (isEmptyRouteError(resultados[2].reason)) {
      setAlumnosDisponibles([]);
      console.warn('Alumnos vacío o ruta no encontrada', resultados[2].reason);
    } else {
      errores.push('alumnos');
      console.error('Error cargando alumnos:', resultados[2].reason);
    }

    if (resultados[3].status === 'fulfilled') {
      setClases(resultados[3].value);
    } else if (isEmptyRouteError(resultados[3].reason)) {
      setClases([]);
      console.warn('Clases vacío o ruta no encontrada', resultados[3].reason);
    } else {
      errores.push('clases');
      console.error('Error cargando clases:', resultados[3].reason);
    }

    if (errores.length > 0) {
      toast.error(`Error al cargar: ${errores.join(', ')}`);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarHorario = () => {
    setHorarios([...horarios, {
      diaSemana: 'Lunes',
      horaInicio: '08:00',
      horaFin: '10:00',
      aula: '',
      tipo: 'Teorica'
    }]);
  };

  const actualizarHorario = (index, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][campo] = valor;
    setHorarios(nuevosHorarios);
  };

  const eliminarHorario = (index) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const agregarAlumno = (idAlumno) => {
    const id = parseInt(idAlumno);
    if (!alumnos.some(a => a.idAlumno === id)) {
      const alumno = alumnosDisponibles.find(a => a.idAlumno === id);
      if (alumno) {
        setAlumnos([...alumnos, alumno]);
      }
    }
  };

  const eliminarAlumno = (idAlumno) => {
    setAlumnos(alumnos.filter(a => a.idAlumno !== idAlumno));
  };

  const handleAgregarAlumnoPorNombre = () => {
    if (!alumnoParaAgregar) return;

    const alumnoEncontrado = alumnosDisponibles.find(
        a => a.nombreCompleto.toLowerCase() === alumnoParaAgregar.toLowerCase()
    );

    if (alumnoEncontrado) {
        if (alumnos.some(a => a.idAlumno === alumnoEncontrado.idAlumno)) {
            toast.warn('El alumno ya ha sido agregado.');
        } else {
            agregarAlumno(alumnoEncontrado.idAlumno);
            setAlumnoParaAgregar('');
        }
    } else {
        toast.error('Alumno no encontrado. Por favor, selecciona un nombre de la lista.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        Periodo: form.periodo,
        Grupo: form.grupo,
        Modalidad: form.modalidad,
        Grado: form.grado,
        Ano: form.ano.toString(),
        Estado: form.estado,
        IdMateria: parseInt(form.idMateria),
        IdProfesor: parseInt(form.idProfesor),
        Alumnos: alumnos.map(a => a.idAlumno),
        Horarios: horarios.map(h => ({
          DiaSemana: h.diaSemana,
          HoraInicio: h.horaInicio,
          HoraFin: h.horaFin,
          Aula: h.aula,
          Tipo: h.tipo
        }))
      };
      
      await crearClase(payload);
      
      toast.success('Clase creada correctamente');
      setForm({
        periodo: '',
        grupo: '',
        modalidad: 'Presencial',
        grado: '',
        ano: new Date().getFullYear(),
        idMateria: '',
        idProfesor: '',
        estado: 'Activo'
      });
      setHorarios([]);
      setAlumnos([]);
      cargarDatos();
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje 
        || error.response?.data?.inner
        || error.response?.data 
        || error.message 
        || 'Error al crear clase';
      toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg, null, 2) : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (idClase) => {
    try {
      const claseData = await obtenerClase(idClase);
      
      // Convertir formato de horas
      const horariosConvertidos = claseData.horarios?.map(h => ({
        diaSemana: h.diaSemana,
        horaInicio: convertirHora12a24(h.horaInicio),
        horaFin: convertirHora12a24(h.horaFin),
        aula: h.aula,
        tipo: h.tipo
      })) || [];
      
      const alumnosSeleccionados = claseData.alumnos?.map(a => a.idAlumno ?? a.idUsuario ?? a.id) || [];
      
      const estadoFinal = {
        ...claseData,
        estado: claseData.estado || 'Activo',
        horarios: horariosConvertidos,
        alumnos: claseData.alumnos || [],
        alumnosSeleccionados,
        idMateriaFK: claseData.idMateriaFK ?? claseData.idMateria ?? claseData.idMateriaId,
        idProfesorFK: claseData.idProfesorFK ?? claseData.idProfesor ?? claseData.idProfesorId
      };
      
      setEditando(estadoFinal);
    } catch (error) {
      toast.error(error.response?.data || 'Error al cargar clase');
    }
  };

  const convertirHora12a24 = (hora) => {
    if (!hora) return '';
    
    // Si ya está en formato 24h (HH:mm o HH:mm:ss), extraer solo HH:mm
    if (!hora.includes('AM') && !hora.includes('PM')) {
      const partes = hora.split(':');
      return `${partes[0].padStart(2, '0')}:${partes[1]}`;
    }
    
    // Convertir de 12h a 24h
    try {
      const [time, modifier] = hora.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = modifier === 'AM' ? '00' : '12';
      } else if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      return `${hours.padStart(2, '0')}:${minutes}`;
    } catch {
      return hora;
    }
  };

  const actualizarHorarioEdit = (index, campo, valor) => {
    const nuevosHorarios = [...editando.horarios];
    nuevosHorarios[index][campo] = valor;
    setEditando({ ...editando, horarios: nuevosHorarios });
  };

  const agregarHorarioEdit = () => {
    const nuevosHorarios = [...(editando.horarios || []), {
      diaSemana: 'Lunes',
      horaInicio: '08:00',
      horaFin: '10:00',
      aula: '',
      tipo: 'Teorica'
    }];
    setEditando({ ...editando, horarios: nuevosHorarios });
  };

  const eliminarHorarioEdit = (index) => {
    const nuevosHorarios = editando.horarios.filter((_, i) => i !== index);
    setEditando({ ...editando, horarios: nuevosHorarios });
  };

  const guardarEdicion = async () => {
    try {
      const payload = {
        Periodo: editando.periodo,
        Grupo: editando.grupo,
        Modalidad: editando.modalidad,
        Grado: editando.grado,
        Ano: editando.ano,
        Estado: editando.estado,
        IdMateria: editando.idMateriaFK,
        IdProfesor: editando.idProfesorFK,
        Alumnos: editando.alumnosSeleccionados || editando.alumnos.map(a => a.idAlumno),
        Horarios: editando.horarios.map(h => ({
          DiaSemana: h.diaSemana,
          HoraInicio: h.horaInicio,
          HoraFin: h.horaFin,
          Aula: h.aula,
          Tipo: h.tipo
        }))
      };

      await editarClase(editando.idclase, payload);
      toast.success('Clase actualizada correctamente');
      setEditando(null);
      cargarDatos();
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Error al actualizar clase';
      toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const eliminarClase = async (clase) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea cambiar el estado de la clase "${clase.grupo}" a "Eliminado"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const claseCompleta = await obtenerClase(clase.idClase);

        const payload = {
          Periodo: claseCompleta.periodo,
          Grupo: claseCompleta.grupo,
          Modalidad: claseCompleta.modalidad,
          Grado: claseCompleta.grado,
          Ano: claseCompleta.ano,
          Estado: 'Eliminado',
          IdMateria: claseCompleta.idMateriaFK,
          IdProfesor: claseCompleta.idProfesorFK,
          Alumnos: claseCompleta.alumnos.map(a => a.idAlumno),
          Horarios: claseCompleta.horarios.map(h => ({
            ...h,
            HoraInicio: convertirHora12a24(h.horaInicio),
            HoraFin: convertirHora12a24(h.horaFin)
          }))
        };

        await editarClase(clase.idClase, payload);

        Swal.fire(
          '¡Estado cambiado!',
          `El estado de la clase "${clase.grupo}" ha sido cambiado a "Eliminado".`,
          'success'
        );
        cargarDatos();
      } catch (error) {
        const errorMsg = error.response?.data?.mensaje 
            || error.response?.data 
            || 'Error al cambiar el estado de la clase.';
            
        Swal.fire(
          'Error',
          typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg,
          'error'
        );
      }
    }
  }

  const CARGAR_CLASES_DATA = async () => {
    try {
      const data = await listarClases();
      setClases(data);
    } catch {
      toast.error('Error al cargar clases');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredClases = clases
    .filter(clase => !filtroEstado || clase.estado === filtroEstado)
    .filter(clase => !filtroGrupo || clase.grupo?.toLowerCase().includes(filtroGrupo.toLowerCase()))
    .filter(clase => !filtroGrado || clase.grado?.toLowerCase().includes(filtroGrado.toLowerCase()))
    .filter(clase => !filtroProfesor || clase.profesor?.toLowerCase().includes(filtroProfesor.toLowerCase()));

  const totalPages = Math.ceil(filteredClases.length / itemsPerPage);

  const paginatedClases = filteredClases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="clases-container">
      <h1>Gestión de Clases</h1>

      <div className="card">
        <h2>Crear Nueva Clase</h2>
        <form className="clases-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Período *</label>
            <input name="periodo" value={form.periodo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Grupo *</label>
            <input name="grupo" value={form.grupo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Modalidad *</label>
            <select name="modalidad" value={form.modalidad} onChange={handleChange}>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Hibrida">Híbrida</option>
            </select>
          </div>

          <div className="form-group">
            <label>Grado *</label>
            <input name="grado" value={form.grado} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Estado *</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Eliminado">Eliminado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Año *</label>
            <input type="number" name="ano" value={form.ano} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Materia *</label>
            <select name="idMateria" value={form.idMateria} onChange={handleChange} required>
              <option value="">Seleccionar materia</option>
              {materias.map(m => (
                <option key={m.idMateria} value={m.idMateria}>
                  {m.nombre} - {m.area}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Profesor *</label>
            <select name="idProfesor" value={form.idProfesor} onChange={handleChange} required>
              <option value="">Seleccionar profesor</option>
              {profesores.map(p => (
                <option key={p.idProfesor} value={p.idProfesor}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h3>Horarios</h3>
            <div className="horarios-list">
              {horarios.map((h, index) => (
                <div key={index} className="horario-item">
                  <div className="form-group">
                    <label>Día</label>
                    <select value={h.diaSemana} onChange={(e) => actualizarHorario(index, 'diaSemana', e.target.value)}>
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miercoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sabado">Sábado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hora Inicio</label>
                    <input type="time" value={h.horaInicio} onChange={(e) => actualizarHorario(index, 'horaInicio', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Hora Fin</label>
                    <input type="time" value={h.horaFin} onChange={(e) => actualizarHorario(index, 'horaFin', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Aula</label>
                    <input value={h.aula} onChange={(e) => actualizarHorario(index, 'aula', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select value={h.tipo} onChange={(e) => actualizarHorario(index, 'tipo', e.target.value)}>
                      <option value="Teorica">Teórica</option>
                      <option value="Practica">Práctica</option>
                    </select>
                  </div>
                  <button type="button" className="btn-icon btn-danger" onClick={() => eliminarHorario(index)}><FaTimes /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add" onClick={agregarHorario}><FaPlus /> Agregar Horario</button>
          </div>

          <div className="form-section">
            <h3>Alumnos</h3>
            <div className="form-group-row">
              <div className="form-group">
                <label>Buscar y Agregar Alumno</label>
                <input 
                  list="alumnos-data"
                  placeholder="Escribe para buscar..."
                  value={alumnoParaAgregar}
                  onChange={(e) => setAlumnoParaAgregar(e.target.value)}
                />
                <datalist id="alumnos-data">
                  {alumnosDisponibles
                    .filter(a => !alumnos.some(al => al.idAlumno === a.idAlumno))
                    .map(a => (
                      <option key={a.idAlumno} value={a.nombreCompleto} />
                    ))
                  }
                </datalist>
              </div>
              <button type="button" className="btn-add-inline" onClick={handleAgregarAlumnoPorNombre}>
                <FaPlus /> Agregar
              </button>
            </div>
            
            <h4>Alumnos Añadidos ({alumnos.length})</h4>
            <div className="alumnos-list">
              {alumnos.map(alumno => (
                <div key={alumno.idAlumno} className="alumno-item">
                  <span>{alumno.nombreCompleto}</span>
                  <button type="button" className="btn-icon btn-danger" onClick={() => eliminarAlumno(alumno.idAlumno)}><FaTimes /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Clase'}
            </button>
          </div>
        </form>
      </div>

      <div className="clases-lista">
        <h2>Lista de Clases</h2>
        
        {/* filtros moved into the table card below for better layout */}

        <div className="card">
          <div className="filtros-container filters-grid">
            <div className="form-group">
              <label htmlFor="filtro-estado">Filtrar por Estado</label>
              <select id="filtro-estado" className="input" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Eliminado">Eliminado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filtro-grupo">Filtrar por Grupo</label>
              <input id="filtro-grupo" className="input" type="text" value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} placeholder="Grupo..."/>
            </div>
            <div className="form-group">
              <label htmlFor="filtro-grado">Filtrar por Grado</label>
              <input id="filtro-grado" className="input" type="text" value={filtroGrado} onChange={(e) => setFiltroGrado(e.target.value)} placeholder="Grado..."/>
            </div>
            <div className="form-group">
              <label htmlFor="filtro-profesor">Filtrar por Profesor</label>
              <input id="filtro-profesor" className="input" type="text" value={filtroProfesor} onChange={(e) => setFiltroProfesor(e.target.value)} placeholder="Profesor..."/>
            </div>
            <div className="form-group">
              <label htmlFor="items-per-page">Items por página</label>
              <select id="items-per-page" className="input" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          {paginatedClases.length > 0 ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Grado</th>
                    <th>Materia</th>
                    <th>Profesor</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th>Alumnos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClases.map((clase) => (
                    <tr key={clase.idClase}>
                      <td data-label="Grupo">{clase.grupo}</td>
                      <td data-label="Grado">{clase.grado}</td>
                      <td data-label="Materia">{clase.materia || 'N/A'}</td>
                      <td data-label="Profesor">{clase.profesor || 'N/A'}</td>
                      <td data-label="Modalidad">{clase.modalidad || 'N/A'}</td>
                      <td data-label="Estado">{clase.estado || 'N/A'}</td>
                      <td data-label="Alumnos">{clase.alumnos?.length || 0}</td>
                      <td data-label="Acciones">
                        <button className="btn-icon" onClick={() => handleEdit(clase.idClase)} aria-label="Editar">
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-danger" onClick={() => eliminarClase(clase)} aria-label="Eliminar">
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
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <p>No hay clases que coincidan con los filtros.</p>
          )}
        </div>
      </div>

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content card modal-large">
            <h2>Editar Clase</h2>
            <div className="clases-form">
              <div className="form-group">
                <label>Período</label>
                <input value={editando.periodo} onChange={(e) => setEditando({...editando, periodo: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Grupo</label>
                <input value={editando.grupo} onChange={(e) => setEditando({...editando, grupo: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Modalidad</label>
                <select value={editando.modalidad} onChange={(e) => setEditando({...editando, modalidad: e.target.value})}>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Hibrida">Híbrida</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Grado</label>
                <input value={editando.grado} onChange={(e) => setEditando({...editando, grado: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select value={editando.estado || 'Activo'} onChange={(e) => setEditando({...editando, estado: e.target.value})}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Eliminado">Eliminado</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Materia</label>
                <select 
                  value={editando.idMateriaFK || ''} 
                  onChange={(e) => setEditando({...editando, idMateriaFK: parseInt(e.target.value)})}
                >
                  <option value="">Seleccionar materia</option>
                  {materias.map(m => (
                    <option key={m.idMateria} value={m.idMateria}>
                      {m.nombre} - {m.area}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Profesor</label>
                <select 
                  value={editando.idProfesorFK || ''} 
                  onChange={(e) => setEditando({...editando, idProfesorFK: parseInt(e.target.value)})}
                >
                  <option value="">Seleccionar profesor</option>
                  {profesores.map(p => (
                    <option key={p.idProfesor} value={p.idProfesor}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-section">
                <h3>Horarios</h3>
                <div className="horarios-list">
                  {editando.horarios?.map((h, index) => (
                    <div key={index} className="horario-item">
                      <div className="form-group">
                        <label>Día</label>
                        <select value={h.diaSemana} onChange={(e) => actualizarHorarioEdit(index, 'diaSemana', e.target.value)}>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miercoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sabado">Sábado</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Hora Inicio</label>
                        <input type="time" value={h.horaInicio} onChange={(e) => actualizarHorarioEdit(index, 'horaInicio', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Hora Fin</label>
                        <input type="time" value={h.horaFin} onChange={(e) => actualizarHorarioEdit(index, 'horaFin', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Aula</label>
                        <input value={h.aula} onChange={(e) => actualizarHorarioEdit(index, 'aula', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Tipo</label>
                        <select value={h.tipo} onChange={(e) => actualizarHorarioEdit(index, 'tipo', e.target.value)}>
                          <option value="Teorica">Teórica</option>
                          <option value="Practica">Práctica</option>
                        </select>
                      </div>
                      <button type="button" className="btn-icon btn-danger" onClick={() => eliminarHorarioEdit(index)}><FaTimes /></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add" onClick={agregarHorarioEdit}><FaPlus /> Agregar Horario</button>
              </div>
              
              <div className="form-section">
                <h3>Alumnos</h3>
                <div className="alumnos-gestion">
                  <div className="alumnos-disponibles">
                    <h4>Disponibles</h4>
                    <input 
                      type="text"
                      placeholder="Buscar alumno..."
                      value={filtroAlumnosDisponibles}
                      onChange={(e) => setFiltroAlumnosDisponibles(e.target.value)}
                    />
                    <div className="alumnos-list-scroll">
                      {alumnosDisponibles
                        .filter(a => !editando.alumnosSeleccionados?.includes(a.idAlumno))
                        .filter(a => a.nombreCompleto.toLowerCase().includes(filtroAlumnosDisponibles.toLowerCase()))
                        .map(a => (
                          <div key={a.idAlumno} className="alumno-item-simple">
                            <span>{a.nombreCompleto}</span>
                            <button 
                              type="button" 
                              className="btn-icon"
                              onClick={() => {
                                const nuevosAlumnos = [...(editando.alumnos || []), a];
                                const nuevosSeleccionados = [...(editando.alumnosSeleccionados || []), a.idAlumno];
                                setEditando({ ...editando, alumnos: nuevosAlumnos, alumnosSeleccionados: nuevosSeleccionados });
                              }}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="alumnos-seleccionados">
                    <h4>Inscritos ({editando.alumnos?.length || 0})</h4>
                    <div className="alumnos-list-scroll">
                      {editando.alumnos?.map(alumno => (
                        <div key={alumno.idAlumno} className="alumno-item-simple">
                          <span>{alumno.nombreCompleto || alumnosDisponibles.find(a => a.idAlumno === alumno.idAlumno)?.nombreCompleto}</span>
                          <button 
                            type="button" 
                            className="btn-icon btn-danger" 
                            onClick={() => {
                              const nuevosAlumnos = editando.alumnos.filter(a => a.idAlumno !== alumno.idAlumno);
                              const nuevosSeleccionados = editando.alumnosSeleccionados.filter(id => id !== alumno.idAlumno);
                              setEditando({ ...editando, alumnos: nuevosAlumnos, alumnosSeleccionados: nuevosSeleccionados });
                            }}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={guardarEdicion}>
                  <FaSave /> Guardar Cambios
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
                  <FaWindowClose /> Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
