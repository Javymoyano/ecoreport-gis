import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';

function ReportDetail({ report, onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        description: '',
        categoria_id: '',
        estado: ''
    });
    const [categories, setCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (report) {
            setFormData({
                titulo: report.title || '',
                description: report.description || '',
                categoria_id: report.categoryId || '',
                estado: report.rawStatus || 'pendiente'
            });
        }
    }, [report, isEditing]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const apiBase = `http://${window.location.hostname}:8001`;
                const response = await fetch(`${apiBase}/categorias`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
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
            const apiBase = `http://${window.location.hostname}:8001`;
            const payload = {
                titulo: formData.titulo,
                description: formData.description,
                estado: formData.estado,
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
                // No llamamos a onBack() inmediatamente para permitir ver el éxito
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
        <div className="h-full flex flex-col bg-earth-dark font-display text-slate-100 overflow-hidden">
            {/* Header / Nav */}
            <nav className="sticky top-0 z-50 bg-earth-dark/90 backdrop-blur-md border-b border-primary-accent/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                        <span className="material-icons text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-semibold text-sm">Volver al Historial</span>
                    </button>
                    <div className="h-6 w-px bg-slate-800 mx-2"></div>
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Reporte #{report.id}</span>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all border border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary-forest hover:bg-primary-accent text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/40 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all border border-white/10">
                                <span className="material-icons text-lg">share</span>
                                Compartir
                            </button>
                            <button
                                onClick={handleEditClick}
                                className="bg-primary-forest hover:bg-primary-accent text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/40 transition-all"
                            >
                                <span className="material-icons text-lg">edit</span>
                                Editar Reporte
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
                {/* Evidence Section (Left) */}
                <section className="w-full lg:w-3/5 h-1/2 lg:h-full bg-black/20 overflow-y-auto custom-scrollbar p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="relative group">
                            <img
                                alt={report.title}
                                className="w-full h-[500px] object-cover rounded-xl shadow-2xl border border-white/5"
                                src={report.foto_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity rounded-xl flex items-end p-6">
                                <div>
                                    <span className="bg-urgent-red text-[10px] font-black uppercase px-2 py-1 rounded mb-2 inline-block tracking-tighter shadow-lg">Evidencia Crítica</span>
                                    <p className="text-white text-sm font-medium">Foto de observación principal - {report.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Evidence Grids (Placeholders) */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-earth-card aspect-video flex items-center justify-center">
                                <span className="text-slate-500 text-xs font-mono">EV-DET-01</span>
                                <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-earth-card aspect-video flex items-center justify-center">
                                <span className="text-slate-500 text-xs font-mono">EV-DET-02</span>
                                <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-xl border-2 border-dashed border-primary-accent/20 flex flex-col items-center justify-center text-slate-500 hover:border-primary-accent/50 hover:text-slate-300 transition-all cursor-pointer group">
                            <span className="material-icons text-4xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                            <p className="text-sm font-medium">Agregar más evidencia de impacto</p>
                        </div>
                    </div>
                </section>

                {/* Info Section (Right) */}
                <section className="w-full lg:w-2/5 h-1/2 lg:h-full overflow-y-auto bg-earth-dark border-l border-white/5 p-8 custom-scrollbar">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                {isEditing ? (
                                    <CustomSelect
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'pendiente', label: 'Pendiente' },
                                            { value: 'en proceso', label: 'En proceso' },
                                            { value: 'aprobado', label: 'Aprobado' },
                                            { value: 'resuelto', label: 'Resuelto' },
                                            { value: 'rechazado', label: 'Rechazado' }
                                        ]}
                                    />
                                ) : (
                                    <span className="bg-primary-forest/40 text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-accent/30">
                                        {report.status}
                                    </span>
                                )}

                                {report.priority === 'Alta' && (
                                    <span className="bg-urgent-red text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse shadow-lg shadow-urgent-red/20">
                                        Alta Prioridad
                                    </span>
                                )}
                            </div>

                            {isEditing ? (
                                <input
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-3xl font-extrabold text-white leading-tight focus:ring-2 ring-primary-accent/50 outline-none"
                                    placeholder="Título del reporte"
                                />
                            ) : (
                                <h1 className="text-3xl font-extrabold text-white leading-tight">{report.title}</h1>
                            )}

                            <p className="text-slate-400 mt-2 flex items-center gap-1">
                                <span className="material-icons text-sm text-urgent-red">location_on</span>
                                {report.location}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-4 rounded-xl bg-earth-card border border-white/5 shadow-inner">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <span className="material-icons text-lg text-primary-accent">category</span>
                                    <span className="text-xs font-bold uppercase">Categoría</span>
                                </div>
                                {isEditing ? (
                                    <CustomSelect
                                        name="categoria_id"
                                        value={formData.categoria_id}
                                        onChange={handleChange}
                                        placeholder="Editar categoría"
                                        options={categories.map(cat => ({ value: cat.id, label: cat.nombre }))}
                                    />
                                ) : (
                                    <p className="font-bold text-slate-200">{report.category}</p>
                                )}
                            </div>
                            <div className="p-4 rounded-xl bg-earth-card border border-white/5 shadow-inner">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <span className="material-icons text-lg text-primary-accent">person</span>
                                    <span className="text-xs font-bold uppercase">Reportado por</span>
                                </div>
                                <p className="font-bold text-slate-200">{report.reporter}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-earth-card border border-white/5 shadow-inner">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <span className="material-icons text-lg text-primary-accent">event</span>
                                    <span className="text-xs font-bold uppercase">Fecha</span>
                                </div>
                                <p className="font-bold text-slate-200">{report.submitted}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-earth-card border border-white/5 shadow-inner">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <span className="material-icons text-lg text-primary-accent">schedule</span>
                                    <span className="text-xs font-bold uppercase">Hora</span>
                                </div>
                                <p className="font-bold text-slate-200">{report.time}</p>
                            </div>
                        </div>

                        <div className="mb-10 bg-earth-card/50 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-l-2 border-urgent-red pl-3">Descripción del Reporte</h3>
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:ring-2 ring-primary-accent/50 outline-none min-h-[150px]"
                                    placeholder="Descripción del reporte"
                                />
                            ) : (
                                <div className="text-slate-300 leading-relaxed text-sm">
                                    {report.description}
                                </div>
                            )}
                        </div>

                        <div className="mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Ubicación Precisa</h3>
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-slate-900 group shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/hybrid/static/-64.442,31.675,12/400x200.png?key=wxRpMoRkMeIY1OWMwquv')] bg-cover bg-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700"></div>
                                <div className="absolute inset-0 bg-primary-forest/20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <span className="material-icons text-urgent-red text-5xl drop-shadow-[0_0_15px_rgba(217,4,41,0.6)] animate-bounce">place</span>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/40 rounded-full blur-sm"></div>
                                    </div>
                                </div>
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button className="bg-earth-dark/90 text-white p-2 rounded-lg shadow-md hover:bg-primary-accent transition-colors border border-white/10">
                                        <span className="material-icons text-sm">zoom_in</span>
                                    </button>
                                    <button className="bg-earth-dark/90 text-white p-2 rounded-lg shadow-md hover:bg-primary-accent transition-colors border border-white/10">
                                        <span className="material-icons text-sm">fullscreen</span>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-xs font-mono text-slate-500">
                                <span>{report.coordinates}</span>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-8 mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Historial de Flujo de Trabajo</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-urgent-red/20 text-urgent-red flex items-center justify-center">
                                        <span className="material-icons text-sm">priority_high</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white">Chief Ranger Mark</span>
                                            <span className="text-[10px] text-slate-500">hace 2 horas</span>
                                        </div>
                                        <p className="text-xs text-slate-300 bg-earth-card p-3 rounded-lg rounded-tl-none border border-white/5 shadow-sm leading-relaxed">
                                            He notificado al equipo de mantenimiento para instalar barreras temporales. Necesitamos reforestar esta área antes de la temporada de lluvias.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 text-slate-400 flex items-center justify-center border border-white/5">
                                        <span className="material-icons text-sm">history</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-400">Sistema</span>
                                            <span className="text-[10px] text-slate-500">{report.submitted}</span>
                                        </div>
                                        <p className="text-xs italic text-slate-500">
                                            Estado del reporte cambiado de <span className="font-bold">Nuevo</span> a <span className="text-primary-accent font-bold">En Revisión</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {!isEditing && (
                                <div className="mt-8">
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Agregar Nota Interna</label>
                                    <div className="relative">
                                        <textarea className="w-full bg-earth-card/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 ring-urgent-red/50 focus:border-transparent outline-none min-h-[100px] shadow-inner" placeholder="Agregar una actualización de acción urgente..."></textarea>
                                        <button className="absolute bottom-3 right-3 bg-urgent-red text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-urgent-red/80 transition-all shadow-lg shadow-urgent-red/20">
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Success Notification Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#102216] border border-[#13ec5b]/30 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(19,236,91,0.15)] overflow-hidden animate-in zoom-in duration-300">
                        <div className="h-1.5 bg-[#13ec5b] shadow-[0_0_15px_rgba(19,236,91,0.5)]"></div>
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-[#13ec5b]/5">
                                <span className="material-icons text-[#13ec5b] text-5xl">task_alt</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Cambios guardados</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                El reporte se ha actualizado correctamente en el servidor central de la reserva.
                            </p>

                            <button
                                onClick={onBack}
                                className="w-full bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#081C15] font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#13ec5b]/20 active:scale-95"
                            >
                                <span className="material-icons text-sm uppercase">arrow_back</span>
                                <span className="text-xs uppercase tracking-widest">Regresar al historial</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportDetail;
