import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getObservacionesProfesor, getMisEstudiantes, createObservacion } from '../../services/profesorService';
import { toast } from '../../utils/toast';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import '../../styles/tables.css';
import '../../styles/forms.css';
import './Observaciones.css';

const ObservacionesProfesor = () => {
    const [observaciones, setObservaciones] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estado para el formulario de nueva observación
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [encabezado, setEncabezado] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para filtros y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Estado para controlar "ver más/menos" en la tabla
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [obsData, estData] = await Promise.all([
                    getObservacionesProfesor(),
                    getMisEstudiantes()
                ]);
                setObservaciones(obsData);
                setEstudiantes(estData);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || 'No se pudieron cargar los datos.';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStudentName = useCallback((idAlumno) => {
        const student = estudiantes.find(est => est.idAlumno === idAlumno);
        return student ? student.nombreCompleto : 'N/A';
    }, [estudiantes]);

    const filteredObservaciones = useMemo(() => {
        if (!debouncedSearchTerm) {
            return observaciones;
        }
        return observaciones.filter(obs => {
            const studentName = getStudentName(obs.idAlumnoFK).toLowerCase();
            return (
                obs.encabezado.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                obs.descripcion.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                studentName.includes(debouncedSearchTerm.toLowerCase())
            );
        });
    }, [debouncedSearchTerm, observaciones, getStudentName]);

    const paginatedObservaciones = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredObservaciones.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredObservaciones, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredObservaciones.length / itemsPerPage);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setSelectedEstudiante('');
        setEncabezado('');
        setDescripcion('');
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEstudiante('');
        setEncabezado('');
        setDescripcion('');
        setError(null);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEstudiante || !encabezado.trim() || !descripcion.trim()) {
            toast.error('Por favor, seleccione un estudiante y complete todos los campos.');
            return;
        }
        setIsSubmitting(true);
        try {
            const newObservacionData = {
                idAlumno: parseInt(selectedEstudiante),
                encabezado,
                descripcion
            };
            const newObservacion = await createObservacion(newObservacionData);
            
            const observationToAdd = { 
                ...newObservacion,
                encabezado,
                descripcion,
                idAlumnoFK: parseInt(selectedEstudiante),
                fechaObservacion: new Date().toISOString()
            };
            setObservaciones(prevObs => [observationToAdd, ...prevObs]);
            
            toast.success('Observación creada con éxito.');
            handleCloseModal();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'No se pudo crear la observación.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="container observaciones-page">
            <div className="page-header">
                <h1 className="text-3xl font-bold text-gray-800">Mis Observaciones</h1>
                <button onClick={handleOpenModal} className="btn-crear-obs">
                    &#43; Crear Nueva Observación
                </button>
            </div>

            {/* Modal para Crear Observación */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Crear Nueva Observación">
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                            <label htmlFor="estudiante-select-modal">Estudiante</label>
                            <select
                                id="estudiante-select-modal"
                            value={selectedEstudiante}
                            onChange={(e) => setSelectedEstudiante(e.target.value)}
                            required
                        >
                            <option value="" disabled>Seleccione un estudiante</option>
                            {estudiantes.map(est => (
                                <option key={est.idAlumno} value={est.idAlumno}>
                                    {est.nombreCompleto}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="encabezado">Encabezado</label>
                        <input
                            id="encabezado"
                            type="text"
                            value={encabezado}
                            onChange={(e) => setEncabezado(e.target.value)}
                            placeholder="Ej. Comportamiento en clase"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describa la observación detalladamente."
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creando...' : 'Crear Observación'}
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="filters-container filters-grid">
                <div className="form-group filter-search">
                     <input
                        id="observaciones-search"
                        aria-label="Buscar observaciones"
                        type="text"
                        placeholder="Buscar..."
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
                            setCurrentPage(1); // Reset page on changing items per page
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
                                        <th>Alumno</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedObservaciones.map((obs) => (
                                        <tr key={obs.idObservacion}>
                                            <td data-label="Encabezado">{obs.encabezado}</td>
                                            <td data-label="Descripción" className="description-cell">
                                                {renderDescription(obs.descripcion, obs.idObservacion)}
                                            </td>
                                            <td data-label="Alumno">{getStudentName(obs.idAlumnoFK)}</td>
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
                                No se encontraron observaciones con los filtros actuales.
                            </p>
                        )}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default ObservacionesProfesor;
