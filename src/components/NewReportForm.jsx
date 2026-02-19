import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import SuccessModal from './SuccessModal';

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
        const apiBase = `http://${window.location.hostname}:8001`;

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
                    // Set default status to 'pendiente'
                    const pendingStatus = data.find(s => s.nombre === 'pendiente');
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
        console.log('Iniciando envío de reporte...', formData);

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

        const apiBase = `http://${window.location.hostname}:8001`;

        try {
            console.log(`Enviando a ${apiBase}/reportes...`);
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
                console.log('Reporte creado exitosamente:', result);

                // Obtenemos el nombre de la categoría para el modal
                const catName = categories.find(c => c.id === formData.categoria_id)?.nombre || 'General';

                setSubmittedReport({
                    ...reportData,
                    id: result[0]?.id,
                    categoria_nombre: catName
                });
            } else {
                const errorText = await response.text();
                console.error('Error del servidor:', response.status, errorText);
                alert(`Error al guardar el reporte: ${response.status}`);
            }
        } catch (error) {
            console.error('Error de red al enviar reporte:', error);
            alert("Error de conexión al servidor. Por favor verifica que el backend esté corriendo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedReport) {
        return (
            <SuccessModal
                reportData={submittedReport}
                onBackToMap={() => onSubmitSuccess('map')} // Asumimos que onSubmitSuccess maneja la navegación
                onViewAllReports={() => onSubmitSuccess('reports')}
            />
        );
    }

    return (
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0c1a11] shadow-2xl z-[100] flex flex-col border-l border-[#13ec5b]/10 animate-fade-in-left">
            {/* Header */}
            <header className="p-6 border-b border-[#13ec5b]/10 flex items-center justify-between bg-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons text-[#13ec5b] text-sm">edit_note</span>
                        Nuevo Reporte
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">Ubicación Seleccionada · {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-[#13ec5b]/10 rounded-full transition-colors group"
                >
                    <span className="material-icons text-slate-400 group-hover:text-[#13ec5b]">close</span>
                </button>
            </header>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Section: Basic Information */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-4 bg-[#13ec5b] rounded-full"></span>
                        <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Información Básica</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Título del Reporte</label>
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
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]">Categoría</label>
                            <CustomSelect
                                name="categoria_id"
                                value={formData.categoria_id}
                                onChange={handleChange}
                                placeholder="Selecciona una categoría"
                                options={categories.map(cat => ({ value: cat.id, label: cat.nombre }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]">Estado Inicial</label>
                            <CustomSelect
                                name="estado_id"
                                value={formData.estado_id}
                                onChange={handleChange}
                                options={statuses.map(s => ({
                                    value: s.id,
                                    label: s.nombre
                                }))}
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Details & Media */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-4 bg-[#13ec5b] rounded-full"></span>
                        <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Detalles y Notas</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-[#102216]/50 border border-slate-200 dark:border-[#13ec5b]/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] outline-none transition-all resize-none placeholder:text-slate-500 text-white"
                                placeholder="Describe el incidente o avistamiento en detalle..."
                                rows="4"
                            ></textarea>
                            <p className="text-[10px] text-right text-slate-500 mt-1">{formData.description.length} / 500 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">URL de Imagen (Opcional)</label>
                            <input
                                name="foto_url"
                                value={formData.foto_url}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-[#102216]/50 border border-slate-200 dark:border-[#13ec5b]/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] outline-none transition-all placeholder:text-slate-500 text-white"
                                placeholder="Direct link to image..."
                                type="text"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Geospatial Confirmation */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-4 bg-[#13ec5b] rounded-full"></span>
                        <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Verificación de Ubicación</h2>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#13ec5b]/20 h-40 relative group bg-black/20">
                        {/* Center Pin Visual */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-8 h-8 bg-[#13ec5b]/30 rounded-full animate-ping"></div>
                                <span className="material-icons text-[#13ec5b] drop-shadow-lg text-3xl">location_on</span>
                            </div>
                        </div>
                        {/* Coordinates Overlay */}
                        <div className="absolute bottom-2 left-2 right-2 bg-[#102216]/80 backdrop-blur-md rounded px-2 py-1 text-[10px] text-[#13ec5b] font-mono flex justify-between items-center border border-[#13ec5b]/20">
                            <span>LAT: {parseFloat(lat).toFixed(6)}</span>
                            <span>LNG: {parseFloat(lng).toFixed(6)}</span>
                            <span className="bg-[#13ec5b]/10 px-1.5 py-0.5 rounded uppercase font-bold text-[9px]">CONFIRMADO</span>
                        </div>
                    </div>
                </section>
            </form>

            {/* Footer Actions */}
            <footer className="p-6 bg-slate-50 dark:bg-[#102216]/80 border-t border-[#13ec5b]/10 flex items-center gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#13ec5b]/10 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-3 px-4 rounded-lg text-sm font-bold bg-[#13ec5b] text-[#102216] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#13ec5b]/20 disabled:opacity-50"
                >
                    {isSubmitting ? 'Guardando...' : 'Enviar Reporte'}
                </button>
            </footer>
        </div>
    );
}

export default NewReportForm;

