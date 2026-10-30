import React, { useState, useEffect, useMemo } from 'react';
import { getAllObservaciones, updateObservacionEstado } from '../../services/adminService';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';
import './Observaciones.css';

const ObservacionesAdmin = () => {
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('alumno');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado para controlar "ver más/menos" en la tabla
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

    useEffect(() => {
        const fetchObservaciones = async () => {
            try {
                setLoading(true);
                
                // Usar la API real para admin
                const data = await getAllObservaciones();
                setObservaciones(data);
                setError(null);
            } catch (err) {
                console.error('Error al cargar observaciones:', err);
                setError('No se pudieron cargar las observaciones.');
                setObservaciones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchObservaciones();
    }, []);

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

    const handleUpdateEstado = (id, estado) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                updateObservacion(id, estado);
            }
        });
    };

    const updateObservacion = async (id, estado) => {
        try {
            await updateObservacionEstado(id, estado);
            setObservaciones(observaciones.map(obs => 
                obs.idObservacion === id ? { ...obs, estado } : obs
            ));
            Swal.fire(
                '¡Eliminado!',
                'La observación ha sido eliminada.',
                'success'
            );
        } catch {
            Swal.fire(
                'Error',
                'Hubo un problema al eliminar la observación.',
                'error'
            );
        }
    };

    const filteredObservaciones = useMemo(() => {
        console.log('Filtrando observaciones:', { observaciones, debouncedSearchTerm, filterRole });
        if (!observaciones) return [];
        let filtered = observaciones;

        if (debouncedSearchTerm) {
            const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
            if (filterRole === 'alumno') {
                filtered = observaciones.filter(obs =>
                    obs.alumno?.toLowerCase().includes(lowercasedSearchTerm)
                );
            } else if (filterRole === 'profesor') {
                filtered = observaciones.filter(obs =>
                    obs.profesor?.toLowerCase().includes(lowercasedSearchTerm)
                );
            }
        }

        return filtered;
    }, [debouncedSearchTerm, filterRole, observaciones]);

    const totalPages = Math.ceil(filteredObservaciones.length / itemsPerPage);
    const paginatedObservaciones = filteredObservaciones.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Panel de Observaciones</h1>

            {loading && <p className="text-center text-gray-600">Cargando...</p>}
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            {!loading && !error && (
                <>
                    <div className="filters-grid mb-6">
                        <div className="form-group">
                            <label htmlFor="search-input">Buscar</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaSearch className="text-gray-400" />
                                </span>
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder={`Buscar por ${filterRole === 'alumno' ? 'alumno' : 'profesor'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="filter-role">Filtrar por</label>
                            <select
                                id="filter-role"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                style={{ width: '50%' }}
                            >
                                <option value="alumno">Alumno</option>
                                <option value="profesor">Profesor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Items por página</label>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-4 text-gray-600">
                        Total de observaciones: {filteredObservaciones.length}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Alumno</th>
                                    <th>Profesor</th>
                                    <th>Encabezado</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedObservaciones.length > 0 ? (
                                    paginatedObservaciones.map((obs) => (
                                        <tr key={obs.idObservacion}>
                                            <td data-label="ID">{obs.idObservacion}</td>
                                            <td data-label="Alumno">{obs.alumno || 'N/A'}</td>
                                            <td data-label="Profesor">{obs.profesor || 'N/A'}</td>
                                            <td data-label="Encabezado">
                                                {obs.encabezado?.length > 50 
                                                    ? obs.encabezado.substring(0, 50) + '...' 
                                                    : obs.encabezado}
                                            </td>
                                            <td data-label="Descripción">
                                                {renderDescription(obs.descripcion, obs.idObservacion)}
                                            </td>
                                            <td data-label="Fecha">{obs.fechaObservacion ? new Date(obs.fechaObservacion).toLocaleDateString() : 'N/A'}</td>
                                            <td data-label="Estado">
                                                <span className={`status status-${(obs.estado || '').toLowerCase()}`}>
                                                    {obs.estado || 'N/A'}
                                                </span>
                                            </td>
                                            <td data-label="Acciones">
                                                <button
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleUpdateEstado(obs.idObservacion, 'Eliminado')}
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            {observaciones.length === 0 ? 'No hay observaciones cargadas.' : 'No hay observaciones que coincidan con los filtros.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )}

        </div>
    );
};

export default ObservacionesAdmin;
