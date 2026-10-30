import PropTypes from 'prop-types';
import { useHorarios } from '../hooks/useHorarios';
import { exportarPDF, exportarExcel } from '../utils/export';
import AdminHorarioFilters from './AdminHorarioFilters';
import './Horarios.css';

export default function Horarios({ userRole, fetchHorarios, title }) {
  const {
    horarios,
    loading,
    filtroProfesor,
    setFiltroProfesor,
    filtroClase,
    setFiltroClase,
    profesores,
    clases,
    horariosPorDia,
    haRealizadoPrimeraCarga,
  } = useHorarios(fetchHorarios, userRole);

  return (
    <div className="horarios-container">
      <h1>{title}</h1>

      {userRole === 'admin' && (
        <AdminHorarioFilters
          filtroProfesor={filtroProfesor}
          setFiltroProfesor={setFiltroProfesor}
          filtroClase={filtroClase}
          setFiltroClase={setFiltroClase}
          profesores={profesores}
          clases={clases}
          onExportPDF={() => exportarPDF(horariosPorDia, userRole)}
          onExportExcel={() => exportarExcel(horariosPorDia)}
        />
      )}

      {/* Para admin: mostrar mensaje inicial si no ha seleccionado filtros y no ha cargado */}
      {userRole === 'admin' && !haRealizadoPrimeraCarga && !filtroProfesor && !filtroClase ? (
        <div className="dia-card">
          <p className="sin-horarios" style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666' }}>
            Por favor, selecciona un profesor o una clase para ver los horarios.
          </p>
        </div>
      ) : loading ? (
        <div className="horarios-container"><p>Cargando horario...</p></div>
      ) : horarios.length === 0 ? (
        <div className="dia-card">
          <p className="sin-horarios">
            {userRole === 'admin' && haRealizadoPrimeraCarga 
              ? 'No se encontraron horarios para los filtros seleccionados.' 
              : 'No hay horario disponible.'
            }
          </p>
        </div>
      ) : (
        <div className="calendario">
          {horariosPorDia.map(({ dia, horarios: diaHorarios }) => (
            <div key={dia} className="dia-card">
              <h3>{dia}</h3>
              {diaHorarios.length > 0 ? (
                <div className="horarios-dia">
                  {diaHorarios.map((h, idx) => (
                    <div key={h.idHorario || idx} className="horario-item">
                      <div className="horario-time">
                        <span className="time-range">{h.HoraInicio || h.horaInicio} - {h.HoraFin || h.horaFin}</span>
                        <span className="class-type">{h.tipo}</span>
                      </div>
                      
                      <div className="horario-subject">{h.Materia || h.materia}</div>
                      
                      <div className="horario-class-info">
                        <span className="class-grade">
                          {(h.Grado || h.grado || h.clase?.grado) || 'N/A'}° {(h.Grupo || h.grupo || h.clase?.grupo) || 'N/A'}
                        </span>
                        <span className="class-room">{h.aula || 'Sin aula'}</span>
                      </div>
                      
                      {userRole === 'admin' && (h.profesor || h.Profesor) && (
                        <div className="horario-professor">Prof. {h.profesor || h.Profesor}</div>
                      )}
                      
                      {(h.Rol || h.rol) && (
                        <div className="horario-role">{h.Rol || h.rol}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sin-horarios">Sin clases</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Horarios.propTypes = {
  userRole: PropTypes.oneOf(['admin', 'profesor', 'alumno']).isRequired,
  fetchHorarios: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};
