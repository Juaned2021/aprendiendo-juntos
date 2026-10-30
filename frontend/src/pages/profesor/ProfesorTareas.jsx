import React, { useState, useEffect } from 'react';
import { crearTarea, getClasesPorProfesor } from '../../services/profesorService';
import { toast } from '../../utils/toast';
import './ProfesorTareas.css';
import { getUserId } from '../../utils/auth';

const ProfesorTareas = ({ idClase: idClaseProp, onTareaCreada }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [descripcionRecurso, setDescripcionRecurso] = useState('');
  const [creando, setCreando] = useState(false);
  const [clases, setClases] = useState([]);
  const [idClase, setIdClase] = useState(idClaseProp || '');
  const [loadingClases, setLoadingClases] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!idClaseProp) {
      cargarClases();
    } else {
      setIdClase(idClaseProp);
    }
  }, [idClaseProp]);

  const cargarClases = async () => {
    try {
      setLoadingClases(true);
      const idUsuario = getUserId();
      const data = await getClasesPorProfesor(idUsuario);
      setClases(data);
      setIdClase('');
    } catch {
      toast.error('Error al cargar clases');
    } finally {
      setLoadingClases(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrores = {};
    if (!idClase) newErrores.clase = 'Selecciona una clase';
    if (!titulo || titulo.trim().length < 3) newErrores.titulo = 'Agrega un título (mínimo 3 caracteres)';
    if (!descripcion || descripcion.trim().length < 5) newErrores.descripcion = 'Agrega una descripción (mínimo 5 caracteres)';
    if (!fechaEntrega) newErrores.fechaEntrega = 'Selecciona una fecha de entrega';
    setErrores(newErrores);
    if (Object.keys(newErrores).length > 0) return;
    setCreando(true);

    try {
      // Convertir fecha YYYY-MM-DD a ISO 8601 completo
      const fechaISO = new Date(fechaEntrega + 'T00:00:00.000Z').toISOString();

      await crearTarea(idClase, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fechaLimite: fechaISO,
        archivo: archivo,
        descripcionRecurso: descripcionRecurso || undefined
      });
      toast.success('Tarea creada correctamente');
      setTitulo('');
      setDescripcion('');
      setFechaEntrega('');
      setArchivo(null);
      setDescripcionRecurso('');
      setErrores({});
      if (onTareaCreada) onTareaCreada();
    } catch (err) {
      console.error('Error al crear tarea:', err);
      let errorMessage = 'Error al crear tarea';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = err.response.data.message || err.response.data.error || 'Error desconocido';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setCreando(false);
    }
  };

  return (
    <form className="profesor-tareas-form" onSubmit={handleSubmit}>
      <h2 className="form-titulo">Crear nueva tarea</h2>
      {!idClaseProp && (
        <label>
          Clase:
          <select value={idClase} onChange={e => setIdClase(e.target.value)} disabled={loadingClases || creando}>
            <option value="" disabled hidden>Selecciona una clase</option>
            {clases.map(c => (
              <option key={c.idclase} value={String(c.idclase)}>
                {c.materia} - {c.grado}°{c.grupo}
              </option>
            ))}
          </select>
          {errores.clase && <span className="form-error">{errores.clase}</span>}
        </label>
      )}

      <label>
        Título:
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          disabled={creando}
          placeholder="Título de la tarea"
          maxLength={100}
        />
        {errores.titulo && <span className="form-error">{errores.titulo}</span>}
      </label>

      <label>
        Descripción:
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          disabled={creando}
          rows={4}
          maxLength={500}
          placeholder="Describe la tarea (máx. 500 caracteres)"
        />
        {errores.descripcion && <span className="form-error">{errores.descripcion}</span>}
      </label>

      <label>
        Fecha de entrega:
        <input
          type="date"
          value={fechaEntrega}
          onChange={e => setFechaEntrega(e.target.value)}
          disabled={creando}
          min={new Date().toISOString().split('T')[0]}
        />
        {errores.fechaEntrega && <span className="form-error">{errores.fechaEntrega}</span>}
      </label>

      <label>
        Archivo adjunto (opcional):
        <input
          type="file"
          onChange={e => setArchivo(e.target.files[0])}
          disabled={creando}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />
      </label>

      {archivo && (
        <label>
          Descripción del recurso:
          <input
            type="text"
            value={descripcionRecurso}
            onChange={e => setDescripcionRecurso(e.target.value)}
            disabled={creando}
            placeholder="Describe el archivo adjunto"
            maxLength={200}
          />
        </label>
      )}

      <button type="submit" disabled={creando || loadingClases}>
        {creando ? 'Creando...' : 'Crear Tarea'}
      </button>
    </form>
  );
};

export default ProfesorTareas;