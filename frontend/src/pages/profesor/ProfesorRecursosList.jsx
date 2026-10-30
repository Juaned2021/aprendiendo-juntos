import React, { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import './ProfesorRecursosList.css';
import ExpandableText from '../../components/ExpandableText';

export default function ProfesorRecursosList({ recursos }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar recursos basado en búsqueda
  const filteredRecursos = useMemo(() => {
    if (!recursos || recursos.length === 0) return [];
    
    if (!debouncedSearchTerm.trim()) return recursos;

    const filtered = recursos.filter(recurso => {
      const get = (r, k) => r[k] || r[k?.toLowerCase?.()] || r[k?.toUpperCase?.()];
      
      const nombre = get(recurso, 'nombre')?.toLowerCase() || '';
      const descripcion = get(recurso, 'descripcion')?.toLowerCase() || '';
      const materia = get(recurso, 'materia')?.toLowerCase() || '';
      const clase = get(recurso, 'clase')?.toLowerCase() || '';
      const grado = get(recurso, 'grado')?.toString() || '';
      const grupo = get(recurso, 'grupo')?.toString() || '';
      
      const searchLower = debouncedSearchTerm.toLowerCase();
      
      return nombre.includes(searchLower) ||
             descripcion.includes(searchLower) ||
             materia.includes(searchLower) ||
             clase.includes(searchLower) ||
             grado.includes(searchLower) ||
             grupo.includes(searchLower);
    });

    return filtered;
  }, [debouncedSearchTerm, recursos]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredRecursos.length / itemsPerPage);
  const paginatedRecursos = filteredRecursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página si está fuera de rango
  const adjustedCurrentPage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;

  if (!recursos || recursos.length === 0) {
    return <div className="recursos-list-vacio">No hay recursos subidos.</div>;
  }

  // Normaliza campos por si vienen en minúsculas o mayúsculas
  const get = (r, k) => r[k] || r[k?.toLowerCase?.()] || r[k?.toUpperCase?.()];

  const isImage = tipo => tipo && tipo.startsWith('image/');
  const isPdf = tipo => tipo === 'application/pdf';

  return (
    <div className="profesor-recursos-list-container">
      {/* Controles de búsqueda y paginación */}
      <div className="recursos-controls">
        <div className="search-filter-group filters-grid">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="items-per-page-container">
            <select 
              value={itemsPerPage} 
              onChange={(e) => { 
                setItemsPerPage(Number(e.target.value)); 
                setCurrentPage(1); 
              }}
              className="items-per-page-select"
            >
              <option value={5}>📄 5 por página</option>
              <option value={10}>📄 10 por página</option>
              <option value={25}>📄 25 por página</option>
              <option value={50}>📄 50 por página</option>
            </select>
          </div>
        </div>
        
        <div className="results-info">
          <span>Mostrando {paginatedRecursos.length} de {filteredRecursos.length} recursos</span>
        </div>
      </div>

      {/* Lista de recursos paginados */}
      <div className="recursos-list">
        {paginatedRecursos.length === 0 ? (
          <div className="recursos-list-vacio">
            {debouncedSearchTerm.trim() 
              ? `No se encontraron recursos para "${debouncedSearchTerm}"`
              : 'No hay recursos que mostrar.'
            }
          </div>
        ) : (
          paginatedRecursos.map(r => {
            const ruta = get(r, 'ruta');
            const nombre = get(r, 'nombre');
            const descripcion = get(r, 'descripcion');
            const tipo = get(r, 'tipo');
            const clase = get(r, 'clase');
            const periodo = get(r, 'periodo');
            const fecha = get(r, 'fechaCreacion');
            const materia = get(r, 'materia');
            const grado = get(r, 'grado');
            const grupo = get(r, 'grupo');

            const isLink = nombre === 'link.txt' && tipo === 'text/plain';

            return (
              <div className="recurso-item" key={r.idRecurso}>
                <div className="recurso-header">
                  {isImage(tipo) && (
                    <a href={ruta} target="_blank" rel="noopener noreferrer">
                      <img src={ruta} alt={nombre} className="recurso-thumb" />
                    </a>
                  )}
                  {isPdf(tipo) && (
                    <a href={ruta} target="_blank" rel="noopener noreferrer">
                      <span className="recurso-pdf-icon" title="Ver PDF">📄</span>
                    </a>
                  )}
                  {!isImage(tipo) && !isPdf(tipo) && (
                    <a href={ruta} target="_blank" rel="noopener noreferrer">
                      <span className="recurso-file-icon" title={isLink ? 'Enlace' : 'Descargar'}>
                        {isLink ? '🔗' : '📁'}
                      </span>
                    </a>
                  )}
                  <div className="recurso-nombre">
                    <a href={ruta} target="_blank" rel="noopener noreferrer">{isLink ? 'Enlace externo' : nombre}</a>
                  </div>
                </div>
                <div className="recurso-body">
                  <div className="recurso-desc">
                    <ExpandableText text={descripcion} maxLength={100} />
                  </div>
                  <div className="recurso-meta">
                    {materia && <span className="recurso-materia">{materia}</span>}
                    {(grado || grupo) && <span className="recurso-grado">{grado ? `${grado}°` : ''}{grupo ? grupo : ''}</span>}
                    {clase && <span className="recurso-clase">Grupo: {clase}</span>}
                    {periodo && <span className="recurso-periodo">Periodo: {periodo}</span>}
                    <span className="recurso-fecha">{fecha ? new Date(fecha).toLocaleString() : ''}</span>
                  </div>
                </div>
                <div className="recurso-actions">
                  <a className="recurso-download" href={ruta} target="_blank" rel="noopener noreferrer" download={!isLink}>
                    {isLink ? 'Abrir Enlace' : 'Descargar'}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={adjustedCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
