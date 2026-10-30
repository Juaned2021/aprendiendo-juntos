import { useState, useEffect, useMemo } from 'react';
import { obtenerMisRecursos } from '../../services/alumnoService';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import './AlumnoRecursos.css';

export default function AlumnoRecursosPage() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para controlar qué descripciones están expandidas
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        setLoading(true);
        
        const data = await obtenerMisRecursos();
        setRecursos(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar recursos:', err);
        setError('No se pudieron cargar los recursos.');
        setRecursos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecursos();
  }, []);

  const toggleDescription = (recursoId) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(recursoId)) {
      newExpanded.delete(recursoId);
    } else {
      newExpanded.add(recursoId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const filteredRecursos = useMemo(() => {
    if (!recursos) return [];
    let filtered = recursos;

    if (debouncedSearchTerm) {
      const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(recurso =>
        recurso.nombre?.toLowerCase().includes(lowercasedSearchTerm) ||
        recurso.descripcion?.toLowerCase().includes(lowercasedSearchTerm) ||
        recurso.materia?.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    if (filterTipo) {
      filtered = filtered.filter(recurso => recurso.tipo === filterTipo);
    }

    return filtered;
  }, [debouncedSearchTerm, filterTipo, recursos]);

  const totalPages = Math.ceil(filteredRecursos.length / itemsPerPage);
  const paginatedRecursos = filteredRecursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obtener tipos únicos para el filtro
  const tipos = useMemo(() => {
    const tiposUnicos = [...new Set(recursos.map(r => r.tipo).filter(Boolean))];
    return tiposUnicos;
  }, [recursos]);

  return (
    <div className="alumno-recursos-page">
      <header className="recursos-header">
        <div className="recursos-header-title">
          <h1>Recursos Académicos</h1>
          <p className="recursos-subtitle">Material de apoyo: PDFs, hojas de cálculo y documentos</p>
        </div>

        <div className="recursos-controls">
          <input
            type="search"
            aria-label="Buscar recursos"
            placeholder="Buscar por nombre, materia o descripción"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="rc-search"
          />

          <select
            value={filterTipo}
            onChange={(e) => { setFilterTipo(e.target.value); setCurrentPage(1); }}
            className="rc-select"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="rc-select"
            aria-label="Items por página"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
          </select>
        </div>
      </header>

      {loading && <p className="rc-status">Cargando recursos...</p>}
      {error && <div className="rc-error">{error}</div>}

      {!loading && !error && (
        <main>
          <div className="rc-summary">Total: {filteredRecursos.length} recursos</div>

          {filteredRecursos.length === 0 ? (
            <section className="empty-state">
              <div className="empty-illustration">📚</div>
              <h3>No hay recursos disponibles</h3>
              <p>{recursos.length === 0 ? 'No hay recursos cargados.' : 'No hay recursos que coincidan con los filtros.'}</p>
            </section>
          ) : (
            <section className="recursos-grid">
              {paginatedRecursos.map((recurso) => {
                const isExpanded = expandedDescriptions.has(recurso.idRecurso);
                const descripcion = recurso.descripcion || 'Sin descripción disponible';
                const shouldTruncate = descripcion.length > 140;
                const displayText = shouldTruncate && !isExpanded
                  ? descripcion.substring(0, 140) + '...'
                  : descripcion;

                const tipo = (recurso.tipo || '').toLowerCase();
                const isPdf = tipo.includes('pdf');
                const isExcel = tipo.includes('xls') || tipo.includes('excel');

                return (
                  <article key={recurso.idRecurso} className="recurso-card" aria-labelledby={`titulo-${recurso.idRecurso}`}>
                    <div className={`file-icon ${isPdf ? 'pdf' : isExcel ? 'excel' : 'other'}`}>
                      {isPdf ? 'PDF' : isExcel ? 'XLS' : 'DOC'}
                    </div>

                    <div className="card-body">
                      <h3 id={`titulo-${recurso.idRecurso}`} className="card-title">{recurso.nombre}</h3>

                      <p className="card-desc">{displayText}</p>
                      {shouldTruncate && (
                        <button className="link-more" onClick={() => toggleDescription(recurso.idRecurso)}>
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}

                      <div className="card-meta">
                        <span className="meta-item">{recurso.materia || 'Sin materia'}</span>
                        <span className="meta-item">{new Date(recurso.fechaCreacion).toLocaleDateString()}</span>
                      </div>

                      <div className="card-actions">
                        <a
                          href={recurso.ruta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-view"
                          aria-label={`Ver ${recurso.nombre}`}
                        >
                          Ver
                        </a>

                        <a
                          href={recurso.ruta}
                          download
                          className="btn btn-download"
                          aria-label={`Descargar ${recurso.nombre}`}
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      )}
    </div>
  );
}
