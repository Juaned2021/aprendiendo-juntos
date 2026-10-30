import PropTypes from 'prop-types';
import { FaEye, FaFileAlt, FaVideo, FaImage, FaLink, FaBook, FaGraduationCap, FaCalendar } from 'react-icons/fa';

export default function AlumnoRecursosList({ recursos }) {
  const getIconForType = (tipo) => {
    const iconMap = {
      'PDF': <FaFileAlt />,
      'Video': <FaVideo />,
      'Imagen': <FaImage />,
      'Link': <FaLink />,
      'Documento': <FaBook />,
      'text/plain': <FaFileAlt />,
      'application/pdf': <FaFileAlt />,
      'video/mp4': <FaVideo />,
      'image/jpeg': <FaImage />,
      'image/png': <FaImage />,
      'default': <FaFileAlt />
    };
    return iconMap[tipo] || iconMap.default;
  };

  const formatDate = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getClaseInfo = (recurso) => {
    // Manejar diferentes formatos de datos de clase
    if (recurso.clase && typeof recurso.clase === 'object') {
      return `${recurso.clase.grado || 'N/A'}° ${recurso.clase.grupo || ''}`;
    }
    // Si viene como propiedades individuales
    if (recurso.grado && recurso.grupo) {
      return `${recurso.grado}° ${recurso.grupo}`;
    }
    return 'N/A';
  };

  if (recursos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3>No hay recursos disponibles</h3>
        <p>No se encontraron recursos para mostrar en este momento.</p>
      </div>
    );
  }

  return (
    <div className="recursos-grid">
      {recursos.map((recurso) => (
        <div key={recurso.idRecurso} className="recurso-card">
          <div className="recurso-icon">
            {getIconForType(recurso.tipo)}
          </div>
          
          <div className="recurso-header">
            <h3 className="recurso-titulo">{recurso.nombre}</h3>
          </div>
          
          <p className="recurso-descripcion">
            {recurso.descripcion || 'Sin descripción disponible'}
          </p>
          
          <div className="recurso-meta">
            <div className="recurso-meta-item">
              <FaGraduationCap />
              <span>{getClaseInfo(recurso)}</span>
            </div>
            <div className="recurso-meta-item">
              <FaCalendar />
              <span>{formatDate(recurso.fechaCreacion)}</span>
            </div>
            {recurso.profesor && recurso.profesor !== 'N/A' && (
              <div className="recurso-meta-item">
                <FaBook />
                <span>{recurso.profesor}</span>
              </div>
            )}
            {recurso.materia && (
              <div className="recurso-meta-item">
                <FaBook />
                <span>{recurso.materia}</span>
              </div>
            )}
          </div>
          
          <a 
            href={recurso.ruta} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="recurso-accion"
          >
            <FaEye />
            <span>Ver Recurso</span>
          </a>
        </div>
      ))}
    </div>
  );
}

AlumnoRecursosList.propTypes = {
  recursos: PropTypes.array.isRequired,
};
