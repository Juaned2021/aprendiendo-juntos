import React, { useState } from 'react';
import './ObservacionModal.css';

const ObservacionModal = ({ isOpen, onClose, observacion, getStudentName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Configuración para ver más/menos
  const maxLength = 200; // Caracteres máximos antes de mostrar "ver más"
  const descripcion = observacion?.descripcion || '';
  const shouldTruncate = descripcion.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? descripcion.substring(0, maxLength) + '...' 
    : descripcion;

  // Mostrar overlay cuando esté abierto; aceptar que `observacion` pueda ser null
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content observacion-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalle de Observación</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="observation-details">
            <div className="detail-row">
              <span className="detail-label">Encabezado:</span>
              <span className="detail-value">{observacion.encabezado}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Alumno:</span>
              <span className="detail-value">{getStudentName(observacion?.idAlumnoFK)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">
                {observacion?.fechaObservacion ? new Date(observacion.fechaObservacion).toLocaleString() : 'N/A'}
              </span>
            </div>
            
            <div className="detail-row description-row">
              <span className="detail-label">Descripción:</span>
              <div className="description-container">
                <p className="description-text">{observacion?.descripcion ? displayText : 'Sin descripción'}</p>
                {shouldTruncate && (
                  <button 
                    className="ver-mas-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservacionModal;
