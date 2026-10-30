import React, { useState, useEffect, useMemo } from 'react';
import { obtenerMisObservaciones } from '../../services/alumnoService';
import Pagination from '../../components/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import '../../styles/tables.css';
import '../../styles/forms.css';
import '../profesor/Observaciones.css';
import './Observaciones.css';

const Observaciones = () => {
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para filtros y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Estado para controlar "ver más/menos" en la tabla
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

    useEffect(() => {
        const fetchObservaciones = async () => {
            try {
                const data = await obtenerMisObservaciones();
                setObservaciones(data);
            } catch {
                setError('No se pudieron cargar las observaciones.');
            } finally {
                setLoading(false);
            }
        };
        fetchObservaciones();
    }, []);

    const filteredObservaciones = useMemo(() => {
        if (!debouncedSearchTerm) {
            return observaciones;
        }
        return observaciones.filter(obs =>
            (obs.encabezado?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
            (obs.descripcion?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
        );
    }, [debouncedSearchTerm, observaciones]);

    const paginatedObservaciones = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredObservaciones.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredObservaciones, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredObservaciones.length / itemsPerPage);

    // Función para toggle de "ver más/menos" en la tabla
    const toggleDescriptionExpansion = (idObservacion) => {
        const newExpanded = new Set(expandedDescriptions);
        if (newExpanded.has(idObservacion)) {
            newExpanded.delete(idObservacion);
        } else {
            newExpanded.add(idObservacion);
        }
        setExpandedDescriptions(newExpanded);
    };

    // Función para renderizar descripción con "ver más/menos"
    const renderDescription = (descripcion, idObservacion) => {
        const isExpanded = expandedDescriptions.has(idObservacion);
        const maxLength = 100; // Caracteres máximos antes de truncar
        
        if (!descripcion || descripcion.length <= maxLength) {
            return <span className="description-text">{descripcion}</span>;
        }

        return (
            <div className={`description-container ${isExpanded ? 'expanded' : ''}`}>
                <span className="description-text">
                    {isExpanded ? descripcion : descripcion.substring(0, maxLength) + '...'}
                </span>
                <button 
                    className="ver-mas-btn-table"
                    onClick={() => toggleDescriptionExpansion(idObservacion)}
                >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                </button>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="text-3xl font-bold text-gray-800">Mis Observaciones</h1>
            </div>

            <div className="filters-container filters-grid">
                <div className="form-group filter-search">
                     <input
                        type="text"
                        placeholder="Buscar por encabezado o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="filter-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="items-per-page">Mostrar:</label>
                    <select
                        id="items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {loading ? (
                 <p>Cargando observaciones...</p>
            ) : error && filteredObservaciones.length === 0 ? (
                <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
            ) : (
                <>
                    <div className="table-container">
                        {paginatedObservaciones.length > 0 ? (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Encabezado</th>
                                        <th>Descripción</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedObservaciones.map((obs, index) => (
                                        <tr key={obs.idObservacion || index}>
                                            <td data-label="Encabezado">{obs.encabezado}</td>
                                            <td data-label="Descripción" className="description-cell">
                                                {renderDescription(obs.descripcion, obs.idObservacion || index)}
                                            </td>
                                            <td data-label="Fecha">
                                                {obs.fechaObservacion
                                                    ? new Date(obs.fechaObservacion).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-600">
                                {debouncedSearchTerm
                                    ? 'No se encontraron observaciones con los filtros actuales.'
                                    : 'No tienes observaciones por el momento.'}
                            </p>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Observaciones;
