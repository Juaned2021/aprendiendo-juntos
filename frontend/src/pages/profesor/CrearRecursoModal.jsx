import React, { useState, useEffect } from 'react';
import { subirRecurso, getClasesPorProfesor } from '../../services/profesorService';
import { getUserId } from '../../utils/auth';
import { toast } from '../../utils/toast';
import './CrearRecursoModal.css';

const CrearRecursoModal = ({ isOpen, onClose, onRecursoCreado, clases: clasesProp }) => {
  const [archivo, setArchivo] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [inputType, setInputType] = useState('file');
  const [archivoPreview, setArchivoPreview] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [clases, setClases] = useState([]);
  const [idClase, setIdClase] = useState('');
  const [loadingClases, setLoadingClases] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (clasesProp && clasesProp.length > 0) {
        // Usar clases pasadas como prop
        setClases(clasesProp);
      } else {
        // Cargar clases si no se pasaron como prop
        cargarClases();
      }
    }
  }, [isOpen, clasesProp]);

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

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setArchivo(null);
    setLinkUrl('');
    setInputType('file');
    setArchivoPreview(null);
    setDescripcion('');
    setIdClase('');
    setErrores({});
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

    let recursoParaSubir;
    if (inputType === 'file') {
      recursoParaSubir = archivo;
    } else {
      // Para enlaces, crear un archivo .txt con el URL
      // El backend espera IFormFile, así que creamos un File real
      const urlTexto = linkUrl.trim();
      const blob = new Blob([urlTexto], { type: 'text/plain' });
      
      // Crear un File con un nombre descriptivo que incluya timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      recursoParaSubir = new File([blob], `enlace_${timestamp}.txt`, { 
        type: 'text/plain',
        lastModified: Date.now()
      });
    }

    try {
      await subirRecurso(idClase, recursoParaSubir, descripcion);
      toast.success('Recurso subido correctamente');
      resetForm();
      if (onRecursoCreado) onRecursoCreado();
    } catch (err) {
      console.error('Error al subir recurso:', err);
      
      let errorMessage = 'Error al subir recurso';
      if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data.message || err.response.data.error || 'Error desconocido';
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Archivo inválido o no tienes permisos para subir recursos a esta clase.';
      } else if (err.response?.status === 403) {
        errorMessage = 'No tienes permisos para subir recursos a esta clase.';
      }
      
      toast.error(errorMessage);
    } finally {
      setSubiendo(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nuevo Recurso</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Clase:</label>
            <select 
              value={idClase} 
              onChange={e => setIdClase(e.target.value)} 
              disabled={loadingClases || subiendo}
              className="form-control"
            >
              <option value="" disabled hidden>Selecciona una clase</option>
              {clases.map(c => (
                <option key={c.idclase} value={String(c.idclase)}>
                  {c.materia} - {c.grado}°{c.grupo} ({c.periodo})
                </option>
              ))}
            </select>
            {errores.clase && <span className="form-error">{errores.clase}</span>}
          </div>

          <div className="form-group">
            <label>Tipo de Recurso:</label>
            <div className="input-type-selector">
              <button 
                type="button" 
                className={`type-btn ${inputType === 'file' ? 'active' : ''}`} 
                onClick={() => setInputType('file')}
                disabled={subiendo}
              >
                📁 Subir Archivo
              </button>
              <button 
                type="button" 
                className={`type-btn ${inputType === 'link' ? 'active' : ''}`} 
                onClick={() => setInputType('link')}
                disabled={subiendo}
              >
                🔗 Enlace Externo
              </button>
            </div>
          </div>

          {inputType === 'file' ? (
            <div className="form-group">
              <label>Archivo:</label>
              <input 
                type="file" 
                onChange={handleArchivoChange} 
                disabled={subiendo} 
                className="form-control"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              />
              {errores.archivo && <span className="form-error">{errores.archivo}</span>}
            </div>
          ) : (
            <div className="form-group">
              <label>URL del Enlace:</label>
              <input
                type="text"
                value={linkUrl}
                onChange={handleLinkChange}
                placeholder="https://ejemplo.com/recurso"
                disabled={subiendo}
                className="form-control"
              />
              {errores.link && <span className="form-error">{errores.link}</span>}
            </div>
          )}

          {archivoPreview && (
            <div className="form-group">
              <label>Vista Previa:</label>
              <div className="archivo-preview">
                {archivoPreview === 'pdf' ? (
                  <div className="preview-pdf">
                    📄 Documento PDF
                  </div>
                ) : (
                  <img src={archivoPreview} alt="Vista previa" className="preview-img" />
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              disabled={subiendo}
              className="form-control"
              rows={3}
              maxLength={200}
              placeholder="Describe brevemente el recurso (máx. 200 caracteres)"
            />
            {errores.descripcion && <span className="form-error">{errores.descripcion}</span>}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={subiendo}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={subiendo || loadingClases}
            >
              {subiendo ? 'Subiendo...' : 'Subir Recurso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRecursoModal;
