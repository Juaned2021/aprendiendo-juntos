import PropTypes from 'prop-types';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import ExpandableText from './ExpandableText';

export default function RecursosList({
  recursos,
  userRole,
  onEdit,
  onDelete,
}) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Clase</th>
          <th>Profesor</th>
          {userRole === 'admin' && <th>Estado</th>}
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {recursos.map((r) => (
          <tr key={r.idRecurso}>
            <td data-label="Nombre">{r.nombre}</td>
            <td data-label="Descripción">
              <ExpandableText text={r.descripcion} maxLength={50} />
            </td>
            <td data-label="Clase">{`${r.clase.grado}° ${r.clase.grupo}`}</td>
            <td data-label="Profesor">{r.profesor}</td>
            {userRole === 'admin' && (
              <td data-label="Estado">
                <span className={`badge ${r.estado === 'Activo' ? 'badge-success' : 'badge-danger'}`}>
                  {r.estado}
                </span>
              </td>
            )}
            <td data-label="Fecha">{new Date(r.fechaCreacion).toLocaleDateString()}</td>
            <td data-label="Acciones" className="table-actions">
              <a href={r.ruta} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ver Recurso">
                <FaEye />
              </a>
              {userRole === 'admin' && (
                <>
                  <button className="btn-icon" onClick={() => onEdit(r)} title="Editar Recurso">
                    <FaEdit />
                  </button>
                  <button className="btn-icon btn-danger" onClick={() => onDelete(r.idRecurso)} title="Eliminar Recurso">
                    <FaTrash />
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

RecursosList.propTypes = {
  recursos: PropTypes.array.isRequired,
  userRole: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
