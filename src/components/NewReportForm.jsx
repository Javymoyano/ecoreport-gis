import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import SuccessModal from './SuccessModal';
import { API_BASE_URL } from '../config';
import { compressImage } from '../utils/image';

function NewReportForm({ lat, lng, onCancel, onSubmitSuccess }) {
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [submittedReport, setSubmittedReport] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        categoria_id: '',
        description: '',
        foto_url: '',
        estado_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const USER_ID = "d794da38-a394-4036-8495-cbaf3d594c97"; // Default for now

    useEffect(() => {
        const apiBase = API_BASE_URL;

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${apiBase}/categorias`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchStatuses = async () => {
            try {
                const response = await fetch(`${apiBase}/estados`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setStatuses(data);
                    // Set default status to 'Pendiente'
                    const pendingStatus = data.find(s => s.nombre.toLowerCase() === 'pendiente');
                    if (pendingStatus) {
                        setFormData(prev => ({ ...prev, estado_id: pendingStatus.id }));
                    }
                }
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };

        fetchCategories();
        fetchStatuses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoria_id) {
            alert("Por favor selecciona una categoría");
            return;
        }

        setIsSubmitting(true);
        const reportData = {
            titulo: formData.titulo,
            categoria_id: formData.categoria_id,
            description: formData.description,
            estado_id: formData.estado_id,
            geom: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            usuario_id: USER_ID,
            foto_url: formData.foto_url || `https://placehold.co/600x400?text=${formData.titulo}`
        };

        const apiBase = API_BASE_URL;

        try {
            const response = await fetch(`${apiBase}/reportes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                const result = await response.json();
                const catName = categories.find(c => c.id === formData.categoria_id)?.nombre || 'General';

                setSubmittedReport({
                    ...reportData,
                    id: result[0]?.id,
                    categoria_nombre: catName
                });
            } else {
                alert(`Error al guardar el reporte: ${response.status}`);
            }
        } catch (error) {
            console.error('Error de red al enviar reporte:', error);
            alert("Error de conexión al servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedReport) {
        return (
            <SuccessModal
                reportData={submittedReport}
                onBackToMap={() => onSubmitSuccess('map')}
                onViewAllReports={() => onSubmitSuccess('reports')}
            />
        );
    }

    return (
        <div className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 h-full w-full sm:max-w-md bg-white dark:bg-[#0c1a11] shadow-2xl z-[100] flex flex-col border-l border-[#13ec5b]/10 animate-fade-in-left">
            {/* Header */}
            <header className="flex-shrink-0 p-4 sm:p-6 border-b border-[#13ec5b]/10 flex items-center justify-between bg-white/5 backdrop-blur-sm">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        <span className="material-icons text-[#13ec5b] text-sm">edit_note</span>
                        Nuevo Reporte
                    </h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold truncate">
                        Ubicación: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-[#13ec5b]/10 rounded-full transition-colors group flex-shrink-0"
                >
                    <span className="material-icons text-slate-400 group-hover:text-[#13ec5b]">close</span>
                </button>
            </header>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Section: Basic Information */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-3 sm:h-4 bg-[#13ec5b] rounded-full"></span>
                        <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-400 tracking-wider">Información Básica</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Título del Reporte</label>
                            <input
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50 dark:bg-[#102216]/50 border border-slate-200 dark:border-[#13ec5b]/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] outline-none transition-all placeholder:text-slate-500 text-white"
                                placeholder="Ej: Avistamiento de fauna, Incendio..."
                                type="text"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-medium mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-widest">Categoría</label>
                                <CustomSelect
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleChange}
                                    placeholder="Selecciona una categoría"
                                    options={categories.map(cat => ({ value: cat.id, label: cat.nombre }))}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-widest">Estado Inicial</label>
                                <CustomSelect
                                    name="estado_id"
                                    value={formData.estado_id}
                                    onChange={handleChange}
                                    options={statuses.map(s => ({ value: s.id, label: s.nombre }))}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Details & Media */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-3 sm:h-4 bg-[#13ec5b] rounded-full"></span>
                        <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-400 tracking-wider">Detalles y Notas</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-[#102216]/50 border border-slate-200 dark:border-[#13ec5b]/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] outline-none transition-all resize-none placeholder:text-slate-500 text-white"
                                placeholder="Describe el incidente o avistamiento en detalle..."
                                rows="4"
                            ></textarea>
                            <p className="text-[10px] text-right text-slate-500 mt-1">{formData.description.length} / 500</p>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Fotografía del Incidente</label>

                            <div className="flex flex-col gap-3">
                                {formData.foto_url && (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#13ec5b]/30">
                                        <img src={formData.foto_url} alt="Vista previa" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, foto_url: '' }))}
                                            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"
                                        >
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#13ec5b]/20 hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 rounded-xl p-4 transition-all cursor-pointer group">
                                        <span className="material-icons text-[#13ec5b]/50 group-hover:text-[#13ec5b] mb-1">add_a_photo</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-[#13ec5b]">Cargar Imagen</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                try {
                                                    // Compresor de imagen nativo
                                                    const compressedFile = await compressImage(file);
                                                    const uploadData = new FormData();
                                                    uploadData.append('file', compressedFile);

                                                    const apiBase = API_BASE_URL;
                                                    const response = await fetch(`${apiBase}/upload`, {
                                                        method: 'POST',
                                                        body: uploadData
                                                    });
                                                    const result = await response.json();
                                                    if (result.url) {
                                                        setFormData(prev => ({ ...prev, foto_url: result.url }));
                                                    }
                                                } catch (err) {
                                                    console.error("Error al subir:", err);
                                                    alert("Error al subir la imagen.");
                                                }
                                            }}
                                        />
                                    </label>

                                    <div className="flex-1">
                                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 ml-1 opacity-60">O vía URL</label>
                                        <input
                                            name="foto_url"
                                            value={formData.foto_url}
                                            onChange={handleChange}
                                            className="w-full bg-[#102216]/50 border border-[#13ec5b]/20 rounded-lg p-3 text-xs focus:border-[#13ec5b] outline-none transition-all placeholder:text-slate-500 text-white"
                                            placeholder="https://..."
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Geospatial Confirmation */}
                <section className="space-y-4 pb-4">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#13ec5b]/20 h-32 sm:h-40 relative group bg-black/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-8 h-8 bg-[#13ec5b]/30 rounded-full animate-ping"></div>
                                <span className="material-icons text-[#13ec5b] drop-shadow-lg text-2xl sm:text-3xl">location_on</span>
                            </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-[#102216]/80 backdrop-blur-md rounded px-2 py-1 text-[9px] sm:text-[10px] text-[#13ec5b] font-mono flex justify-between items-center border border-[#13ec5b]/20">
                            <span>{parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</span>
                            <span className="font-bold">UBICACIÓN CONFIRMADA</span>
                        </div>
                    </div>
                </section>
            </form>

            {/* Footer Actions */}
            <footer className="flex-shrink-0 p-4 sm:p-6 bg-slate-50 dark:bg-[#102216]/80 border-t border-[#13ec5b]/10 flex items-center gap-3 sm:gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#13ec5b]/10 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold bg-[#13ec5b] text-[#102216] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
                >
                    {isSubmitting ? 'Guardando...' : 'Enviar Reporte'}
                </button>
            </footer>
        </div>
    );
}

export default NewReportForm;
