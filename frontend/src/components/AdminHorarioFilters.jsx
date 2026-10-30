import PropTypes from 'prop-types';

export default function AdminHorarioFilters({
  filtroProfesor,
  setFiltroProfesor,
  filtroClase,
  setFiltroClase,
  profesores,
  clases,
  onExportPDF,
  onExportExcel,
}) {
  return (
    <div className="filtros filters-grid">
      <select value={filtroProfesor} onChange={(e) => setFiltroProfesor(e.target.value)}>
        <option value="">Ninguno</option>
        {profesores.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
        <option value="">Ninguno</option>
        {clases.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button className="btn btn-secondary" onClick={onExportPDF}>Exportar PDF</button>
      <button className="btn btn-secondary" onClick={onExportExcel}>Exportar Excel</button>
    </div>
  );
}

AdminHorarioFilters.propTypes = {
  filtroProfesor: PropTypes.string.isRequired,
  setFiltroProfesor: PropTypes.func.isRequired,
  filtroClase: PropTypes.string.isRequired,
  setFiltroClase: PropTypes.func.isRequired,
  profesores: PropTypes.array.isRequired,
  clases: PropTypes.array.isRequired,
  onExportPDF: PropTypes.func.isRequired,
  onExportExcel: PropTypes.func.isRequired,
};
