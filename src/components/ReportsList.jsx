import { useState, useEffect } from 'react';

function ReportsList({ onSelectReport, onNewReport, onViewOnMap }) {
    const [reports, setReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const apiBase = `http://${window.location.hostname}:8001`;
            const response = await fetch(`${apiBase}/reportes`);
            if (!response.ok) throw new Error('Failed to fetch reports');
            const data = await response.json();

            // Map backend data to UI format
            const mappedReports = data.map(report => {
                const dateObj = new Date(report.created_at);

                // Category styling mapping
                const categoryStyles = {

                    'Incendio': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                    'Trampa': 'bg-red-500/10 text-red-500 border-red-500/20',
                    'Evento': 'bg-green-500/10 text-green-500 border-green-500/20',
                    'Tala de árboles': 'bg-red-700/10 text-red-700 border-red-700/20',
                };

                const statusMap = {
                    'pendiente': { dot: 'bg-yellow-500', text: 'text-yellow-500', label: 'Pendiente' },
                    'en progreso': { dot: 'bg-blue-500', text: 'text-blue-500', label: 'In Progress' },
                    'aprobado': { dot: 'bg-[#13ec5b]', text: 'text-[#13ec5b]', label: 'Aprobado' },
                    'rechazado': { dot: 'bg-red-500', text: 'text-red-500', label: 'Rechazado' },
                    'resuelto': { dot: 'bg-[#13ec5b]', text: 'text-[#13ec5b]', label: 'Resuelto' },
                };

                const status = statusMap[report.estado?.toLowerCase()] || { dot: 'bg-slate-400', text: '', label: report.estado || 'Open' };
                const categoryName = report.categorias?.nombre || 'General';

                return {
                    id: report.id.substring(0, 8), // Use short ID for display
                    fullId: report.id,
                    title: report.titulo,
                    submitted: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    category: categoryName,
                    categoryColor: categoryStyles[categoryName] || 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                    status: status.label,
                    statusDot: status.dot,
                    statusText: status.text,
                    observations: report.notas || 'Sin descripción',
                    foto_url: report.foto_url,
                    coordinates: report.geom?.coordinates, // [lng, lat]
                    locationName: `${report.geom?.coordinates?.[1].toFixed(4)}, ${report.geom?.coordinates?.[0].toFixed(4)}`,
                    reporter: report.perfiles?.nombre_completo || 'Javier Moyano',
                    date: dateObj.toLocaleDateString('en-US'),
                    priority: report.titulo?.toLowerCase().includes('fuego') || report.estado === 'flagged' ? 'Alta' : 'Media',
                };
            });

            setReports(mappedReports);
            if (mappedReports.length > 0) {
                setSelectedReportId(mappedReports[0].id);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas las categorías');
    const [filterStatus, setFilterStatus] = useState('Todos los estados');
    const [filterTime, setFilterTime] = useState('Últimos 30 días');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporter.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'Todas las categorías' || report.category === filterCategory;
        const matchesStatus = filterStatus === 'Todos los estados' || report.status === filterStatus;

        // Simple time filter logic
        let matchesTime = true;
        const now = new Date();
        const reportDate = new Date(report.date);
        if (filterTime === 'Últimos 7 días') {
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
            matchesTime = reportDate >= sevenDaysAgo;
        } else if (filterTime === 'Este mes') {
            matchesTime = reportDate.getMonth() === new Date().getMonth() && reportDate.getFullYear() === new Date().getFullYear();
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesTime;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchTerm, filterCategory, filterStatus, filterTime]);

    const selectedReport = filteredReports.find(r => r.id === selectedReportId) || paginatedReports[0];

    return (
        <div className="h-full flex bg-[#102216]">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-16 border-b border-[#1f3a28] bg-[#162a1d]/80 backdrop-blur-md flex items-center justify-between px-8">
                    <h1 className="text-xl font-bold">Historial de Reportes</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar reporte por ID, titulo o rango..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[#102216] border-transparent focus:border-[#13ec5b] focus:ring-0 rounded-lg text-sm w-72 text-white placeholder-slate-500"
                            />
                        </div>
                        <button
                            onClick={onNewReport}
                            className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-sm">Nuevo Reporte</span>
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="px-8 py-4 bg-[#102216]/30 flex flex-wrap items-center gap-4 border-b border-[#1f3a28]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtros:</span>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-[#162a1d] border-[#1f3a28] rounded-lg text-xs py-3 px-1 text-white focus:ring-[#13ec5b] focus:border-[#13ec5b]"
                        >
                            <option>Todas las categorías</option>
                            <option>Incendio</option>
                            <option>Trampa</option>
                            <option>Evento</option>
                            <option>Tala de árboles</option>
                            <option>Basura</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-[#162a1d] border-[#1f3a28] rounded-lg text-xs py-3 px-1 text-white focus:ring-[#13ec5b] focus:border-[#13ec5b]"
                        >
                            <option>Todos los estados</option>
                            <option>Pendiente</option>
                            <option>In Progress</option>
                            <option>Aprobado</option>
                            <option>Resuelto</option>
                            <option>Flaggeado</option>
                        </select>
                        <select
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                            className="bg-[#162a1d] border-[#1f3a28] rounded-lg text-xs py-3 px-1 text-white focus:ring-[#13ec5b] focus:border-[#13ec5b]"
                        >
                            <option>Últimos 30 días</option>
                            <option>Últimos 7 días</option>
                            <option>Este mes</option>
                        </select>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
                        <span>Mostrando <b className="text-white">{Math.min(filteredReports.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredReports.length, currentPage * itemsPerPage)}</b> de <b className="text-white">{filteredReports.length}</b> resultados</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-12 h-12 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-medium animate-pulse">Cargando reportes históricos...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-500 gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <div className="text-center">
                                <p className="font-bold text-lg">Error al cargar datos</p>
                                <p className="text-sm opacity-70">{error}</p>
                            </div>
                            <button
                                onClick={fetchReports}
                                className="mt-4 px-6 py-2 bg-[#13ec5b] text-[#102216] font-bold rounded-lg hover:bg-[#13ec5b]/90 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-30">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                            <p className="font-medium text-lg">No se encontraron reportes</p>
                            <p className="text-sm">El historial de la base de datos está vacío.</p>
                        </div>
                    ) : (
                        <div className="bg-[#162a1d] border border-[#1f3a28] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-[#1f3a28] bg-white/5">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID del reporte</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha de envío</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Observaciones</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1f3a28]">
                                        {paginatedReports.map((report) => (
                                            <tr
                                                key={report.fullId}
                                                onClick={() => {
                                                    setSelectedReportId(report.id);
                                                    // Opcional: onSelectReport(report); // Si queremos que al click abra directo
                                                }}
                                                onDoubleClick={() => onSelectReport(report)}
                                                className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedReportId === report.id ? 'bg-[#13ec5b]/5' : ''}`}
                                            >
                                                <td className="px-6 py-4 font-mono text-sm text-[#13ec5b] font-medium">#{report.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-white">{report.submitted}</div>
                                                    <div className="text-xs text-slate-500">{report.time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${report.categoryColor}`}>
                                                        {report.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${report.statusDot}`}></span>
                                                        <span className={`text-sm ${report.statusText}`}>{report.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-300 max-w-[400px] whitespace-normal break-words leading-relaxed" title={report.observations}>
                                                        {report.observations}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onViewOnMap(report.coordinates); }}
                                                            className="p-2 hover:bg-[#13ec5b]/20 hover:text-[#13ec5b] rounded-lg text-slate-400"
                                                            title="View on Map"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onSelectReport(report); }}
                                                            className="p-2 hover:bg-[#13ec5b]/20 hover:text-[#13ec5b] rounded-lg text-slate-400"
                                                            title="View Details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 bg-white/5 border-t border-[#1f3a28] flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 bg-[#102216] border border-[#1f3a28] rounded-md text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#13ec5b] transition-colors"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 bg-[#102216] border border-[#1f3a28] rounded-md text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#13ec5b] transition-colors"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${currentPage === page ? 'bg-[#13ec5b] text-[#102216]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#13ec5b]/5 border border-[#13ec5b]/20 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-[#13ec5b]/5">
                            <div className="w-12 h-12 bg-[#13ec5b] rounded-lg flex items-center justify-center text-[#102216] shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'Resuelto' || r.status === 'Aprobado').length}</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Reportes Resueltos</p>
                            </div>
                        </div>
                        <div className="bg-[#162a1d]/40 border border-[#1f3a28] p-4 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'In Progress' || r.status === 'Pendiente').length}</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Reportes Actuales</p>
                            </div>
                        </div>
                        <div className="bg-[#162a1d]/40 border border-[#1f3a28] p-4 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{reports.filter(r => r.category === 'Incendio' || r.category === 'Tala de árboles').length}</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Problemas de Alta Prioridad</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Location Preview */}
            <div className="w-80 border-l border-[#1f3a28] bg-[#162a1d] hidden xl:flex flex-col">
                <div className="p-6 border-b border-[#1f3a28]">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-white">Vista previa de la ubicación</h3>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                    <div className="h-64 rounded-xl bg-[#102216] relative overflow-hidden mb-6 group cursor-crosshair">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#13ec5b] rounded-full flex items-center justify-center shadow-lg shadow-[#13ec5b]/40">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#102216]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-[#102216]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] border border-white/10 text-white">
                            {selectedReport ? selectedReport.coordinates : '◎ -- / --'}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-[#102216] p-4 rounded-xl border border-[#1f3a28]">
                            <h4 className="text-xs font-bold text-[#13ec5b] uppercase mb-2">Información del reporte seleccionado</h4>
                            {selectedReport ? (
                                <>
                                    <p className="text-sm font-semibold mb-1 text-white">#{selectedReport.id} {selectedReport.title}</p>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{selectedReport.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-[#1f3a28]">
                                        <span className="text-[10px] text-slate-500">Reported by: {selectedReport.reporter}</span>
                                        <button
                                            onClick={() => onSelectReport(selectedReport)}
                                            className="text-[#13ec5b] text-[10px] font-bold uppercase hover:underline"
                                        >
                                            Ver detalles completos
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-slate-500">Seleccione un reporte para ver detalles.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <button className="w-full bg-[#102216] text-slate-300 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#13ec5b] hover:text-[#102216] transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        Abrir mapa interactivo
                    </button>
                </div>
            </div>
        </div >
    );
}

export default ReportsList;
