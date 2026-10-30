import React, { useState, useEffect } from 'react';
import { subirRecurso, getClasesPorProfesor } from '../../services/profesorService';
import { toast } from '../../utils/toast';
import './ProfesorRecursos.css';


import { getUserId } from '../../utils/auth';

const ProfesorRecursos = ({ idClase: idClaseProp, onRecursoSubido }) => {
  const [archivo, setArchivo] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [inputType, setInputType] = useState('file'); // 'file' o 'link'
  const [archivoPreview, setArchivoPreview] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo] = useState(false);
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
      // No seleccionar ningún curso por defecto
      setIdClase('');
    } catch {
      toast.error('Error al cargar clases');
    } finally {
      setLoadingClases(false);
    }
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setLinkUrl('');
    setArchivoPreview(null);
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setArchivoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else if (file && file.type === 'application/pdf') {
      setArchivoPreview('pdf');
    } else if (file && (
      file.type === 'application/vnd.ms-powerpoint' || // .ppt
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || // .pptx
      file.type === 'application/msword' || // .doc
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
      file.type === 'application/vnd.ms-excel' || // .xls
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
      file.type === 'application/zip' || // .zip
      file.type === 'application/x-rar-compressed' || // .rar
      file.type === 'text/plain' // .txt
    )) {
      setArchivoPreview('document');
    } else {
      setArchivoPreview(null);
    }
  };
  const handleLinkChange = (e) => {
    setLinkUrl(e.target.value);
    setArchivo(null);
    setArchivoPreview(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrores = {};
    if (inputType === 'file' && !archivo) newErrores.archivo = 'Selecciona un archivo';
    if (inputType === 'link' && !linkUrl) newErrores.link = 'Ingresa una URL';
    if (!idClase) newErrores.clase = 'Selecciona una clase';
    if (!descripcion || descripcion.length < 3) newErrores.descripcion = 'Agrega una descripción (mínimo 3 caracteres)';
    setErrores(newErrores);
    if (Object.keys(newErrores).length > 0) return;
    setSubiendo(true);

    // Debugging detallado del archivo
    if (inputType === 'file') {
      if (!(archivo instanceof File)) {
        console.error('El archivo no es un objeto File válido');
      }
      
      if (archivo?.size === 0) {
        console.error('El archivo está vacío');
      }
    }

    let recursoParaSubir;
    if (inputType === 'file') {
      recursoParaSubir = archivo;
    } else {
      // Crear un Blob con el link para simular un archivo
      const blob = new Blob([linkUrl], { type: 'text/plain' });
      // Usar un nombre de archivo descriptivo para que el backend lo pueda identificar
      recursoParaSubir = new File([blob], `link.txt`, { type: 'text/plain' });
    }

    try {
      await subirRecurso(idClase, recursoParaSubir, descripcion);
      toast.success('Recurso subido correctamente');
      setArchivo(null);
      setLinkUrl('');
      setArchivoPreview(null);
      setDescripcion('');
      setErrores({});
      if (onRecursoSubido) onRecursoSubido();
    } catch (err) {
      console.error('Error al subir recurso:', err);
      
      // Mostrar error específico
      let errorMessage = 'Error al subir recurso';
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
      setSubiendo(false);
    }
  };

  return (
    <form className="profesor-recursos-form" onSubmit={handleSubmit}>
      <h2 className="form-titulo">Subir nuevo recurso</h2>
      {!idClaseProp && (
        <label>
          Clase:
          <select value={idClase} onChange={e => setIdClase(e.target.value)} disabled={loadingClases || subiendo}>
            <option value="" disabled hidden>Selecciona una clase</option>
            {clases.map(c => (
              <option key={c.idclase} value={String(c.idclase)}>
                {c.materia} - {c.grado}°{c.grupo} ({c.periodo})
              </option>
            ))}
          </select>
          {errores.clase && <span className="form-error">{errores.clase}</span>}
        </label>
      )}

      <div className="input-type-selector">
        <button type="button" className={inputType === 'file' ? 'active' : ''} onClick={() => setInputType('file')}>
          Subir Archivo
        </button>
        <button type="button" className={inputType === 'link' ? 'active' : ''} onClick={() => setInputType('link')}>
          Enlace Externo
        </button>
      </div>

      {inputType === 'file' ? (
        <label>
          Archivo:
          <input type="file" onChange={handleArchivoChange} disabled={subiendo} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
          {errores.archivo && <span className="form-error">{errores.archivo}</span>}
        </label>
      ) : (
        <label>
          URL del Enlace:
          <input
            type="text"
            value={linkUrl}
            onChange={handleLinkChange}
            placeholder="https://ejemplo.com/recurso"
            disabled={subiendo}
          />
          {errores.link && <span className="form-error">{errores.link}</span>}
        </label>
      )}

      {archivoPreview && (
        <div className="archivo-preview">
          {archivoPreview === 'pdf' ? (
            <span className="archivo-preview-pdf">📄 Vista previa PDF</span>
          ) : archivoPreview === 'document' ? (
            <span className="archivo-preview-document">📄 Documento seleccionado</span>
          ) : (
            <img src={archivoPreview} alt="Vista previa" className="archivo-preview-img" />
          )}
        </div>
      )}
      <label>
        Descripción:
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          disabled={subiendo}
          rows={3}
          maxLength={200}
          placeholder="Describe brevemente el recurso (máx. 200 caracteres)"
        />
        {errores.descripcion && <span className="form-error">{errores.descripcion}</span>}
      </label>
      <button type="submit" disabled={subiendo || loadingClases}>
        {subiendo ? 'Subiendo...' : 'Subir Recurso'}
      </button>
    </form>
  );
};

export default ProfesorRecursos;
