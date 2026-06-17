import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { API_BASE_URL } from '../config';

function ReportDetail({ report, onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        description: '',
        categoria_id: '',
        estado_id: ''
    });
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (report) {
            setFormData({
                titulo: report.title || '',
                description: report.description || '',
                categoria_id: report.categoryId || '',
                estado_id: report.statusId || ''
            });
        }
    }, [report, isEditing]);

    useEffect(() => {
        const apiBase = API_BASE_URL;

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${apiBase}/categorias`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchStatuses = async () => {
            try {
                const response = await fetch(`${apiBase}/estados`);
                const data = await response.json();
                setStatuses(data);
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };

        fetchCategories();
        fetchStatuses();
    }, []);

    if (!report) return null;

    const handleEditClick = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const apiBase = API_BASE_URL;
            const payload = {
                titulo: formData.titulo,
                description: formData.description,
                estado_id: formData.estado_id,
                categoria_id: formData.categoria_id || null
            };

            const response = await fetch(`${apiBase}/reportes/${report.fullId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsEditing(false);
                setShowSuccess(true);
            } else {
                alert("Error al actualizar el reporte");
            }
        } catch (error) {
            console.error('Error updating report:', error);
            alert("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#102216] text-slate-100 overflow-hidden">
            {/* Header / Nav */}
            <nav className="flex-shrink-0 bg-[#162a1d]/90 backdrop-blur-md border-b border-[#1f3a28] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-[#13ec5b] transition-colors cursor-pointer group flex-shrink-0"
                    >
                        <span className="material-icons text-lg sm:text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-semibold text-xs sm:text-sm hidden xs:inline">Volver</span>
                    </button>
                    <div className="h-4 w-px bg-slate-800 mx-1 sm:mx-2 hidden xs:block"></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 truncate">#{report.id}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all border border-white/10 hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#13ec5b] hover:brightness-110 text-[#102216] px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                            >
                                {isSaving ? '...' : 'Guardar'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleEditClick}
                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold text-xs flex items-center gap-2 border border-white/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <span className="hidden sm:inline">Editar</span>
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row bg-[#102216]">
                {/* Evidence Section - Scrollable independently on desktop, stacks on mobile */}
                <section className="w-full lg:w-3/5 lg:h-full lg:overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#0c1a11]">
                    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-[4/3] sm:aspect-auto sm:h-[500px]">
                            <img
                                alt={report.title}
                                className="w-full h-full object-cover"
                                src={report.foto_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6 text-white">
                                <div>
                                    <span className="bg-[#13ec5b]/20 text-[#13ec5b] text-[9px] font-black uppercase px-2 py-0.5 rounded mb-1 inline-block border border-[#13ec5b]/30">Evidencia Registrada</span>
                                    <p className="text-xs sm:text-sm font-medium opacity-80">{report.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Grid Placeholders */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square sm:aspect-video rounded-xl border border-white/5 bg-[#162a1d] flex items-center justify-center">
                                <span className="text-slate-600 text-[10px] sm:text-xs font-mono">DETALLE-01</span>
                            </div>
                            <div className="aspect-square sm:aspect-video rounded-xl border border-white/5 bg-[#162a1d] flex items-center justify-center">
                                <span className="text-slate-600 text-[10px] sm:text-xs font-mono">DETALLE-02</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Info Section - Fixed scroll on desktop, stacks on mobile */}
                <section className="w-full lg:w-2/5 lg:h-full lg:overflow-y-auto bg-[#102216] border-t lg:border-t-0 lg:border-l border-white/5 p-4 sm:p-8 custom-scrollbar">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                {isEditing ? (
                                    <div className="min-w-[150px]">
                                        <CustomSelect
                                            name="estado_id"
                                            value={formData.estado_id}
                                            onChange={handleChange}
                                            options={statuses.map(s => ({ value: s.id, label: s.nombre }))}
                                        />
                                    </div>
                                ) : (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${report.statusText || 'text-slate-300 border-slate-700'}`}>
                                        {report.status}
                                    </span>
                                )}

                                {report.priority === 'Alta' && (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/20">
                                        Alta Prioridad
                                    </span>
                                )}
                            </div>

                            {isEditing ? (
                                <input
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xl sm:text-3xl font-extrabold text-white leading-tight focus:ring-2 ring-[#13ec5b]/50 outline-none"
                                />
                            ) : (
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight break-words">{report.title}</h1>
                            )}

                            <p className="text-slate-400 mt-2 flex items-center gap-1 text-sm sm:text-base">
                                <span className="material-icons text-sm text-[#13ec5b]">location_on</span>
                                {report.location}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                            {[
                                { label: 'Categoría', value: report.category, icon: 'category', field: 'categoria_id', isCat: true },
                                { label: 'Reportado por', value: report.reporter, icon: 'person' },
                                { label: 'Fecha', value: report.submitted, icon: 'event' },
                                { label: 'Hora', value: report.time, icon: 'schedule' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 sm:p-4 rounded-xl bg-[#162a1d] border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <span className="material-symbols-outlined text-sm sm:text-base text-[#13ec5b]">{item.icon}</span>
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    {isEditing && item.isCat ? (
                                        <CustomSelect
                                            name="categoria_id"
                                            value={formData.categoria_id}
                                            onChange={handleChange}
                                            options={categories.map(cat => ({ value: cat.id, label: cat.nombre }))}
                                        />
                                    ) : (
                                        <p className="text-sm sm:text-base font-bold text-slate-200">{item.value}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="mb-8 bg-[#162a1d]/40 p-5 sm:p-6 rounded-xl border border-white/5">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#13ec5b] mb-4 border-l-2 border-[#13ec5b] pl-3">Descripción</h3>
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-300 outline-none min-h-[120px]"
                                />
                            ) : (
                                <p className="text-slate-300 leading-relaxed text-sm">{report.description}</p>
                            )}
                        </div>

                        {/* Location Preview (Simplified for sidebar) */}
                        <div className="mb-8 p-4 rounded-xl border border-white/5 bg-[#0c1a11]">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Ubicación Precisa</h3>
                            <div className="w-full h-32 rounded-lg bg-black/40 relative overflow-hidden flex items-center justify-center">
                                <span className="material-icons text-[#13ec5b] text-4xl animate-bounce">place</span>
                                <div className="absolute inset-0 border border-white/5 pointer-events-none"></div>
                                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400">
                                    {report.coordinates?.[1].toFixed(4)}, {report.coordinates?.[0].toFixed(4)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#102216] border border-[#13ec5b]/30 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in">
                        <div className="h-1 bg-[#13ec5b]"></div>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons text-[#13ec5b] text-4xl">check_circle</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Cambios Guardados</h2>
                            <p className="text-slate-400 text-xs mb-6">El reporte ha sido actualizado con éxito.</p>
                            <button
                                onClick={onBack}
                                className="w-full bg-[#13ec5b] text-[#102216] font-bold py-3 rounded-xl transition-all"
                            >
                                Volver al listado
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportDetail;
