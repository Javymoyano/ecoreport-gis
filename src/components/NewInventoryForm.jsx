import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import SuccessModalInventory from './SuccessModalInventory';

function NewInventoryForm({ lat, lng, onCancel, onSubmitSuccess }) {
    const [inventoryType, setInventoryType] = useState('flora'); // 'flora' o 'fauna'
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [addToCatalog, setAddToCatalog] = useState(false);
    const [species, setSpecies] = useState([]);
    const [isLoadingSpecies, setIsLoadingSpecies] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [formData, setFormData] = useState({
        especie_id: '',
        nombre_manual: '',
        abundancia: 1,
        observaciones: '',
        foto_url: ''
    });

    useEffect(() => {
        const apiBase = `http://${window.location.hostname}:8001`;
        const fetchSpecies = async () => {
            setIsLoadingSpecies(true);
            try {
                const response = await fetch(`${apiBase}/especies`);
                const data = await response.json();
                setSpecies(data);
            } catch (error) {
                console.error('Error fetching species:', error);
            } finally {
                setIsLoadingSpecies(false);
            }
        };
        fetchSpecies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isManualEntry && !formData.especie_id) {
            alert("Selecciona una especie del catálogo");
            return;
        }
        if (isManualEntry && !formData.nombre_manual) {
            alert("Escribe el nombre de la especie");
            return;
        }

        setIsSubmitting(true);
        const apiBase = `http://${window.location.hostname}:8001`;

        try {
            let finalEspecieId = formData.especie_id;

            // Si es manual y quiere guardar en catálogo
            if (isManualEntry && addToCatalog) {
                const especieResponse = await fetch(`${apiBase}/especies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre_comun: formData.nombre_manual,
                        tipo: inventoryType,
                        descripcion: "Agregado desde campo"
                    })
                });

                if (!especieResponse.ok) {
                    throw new Error("Error al crear la especie en el catálogo");
                }

                const nuevaEspecie = await especieResponse.json();
                console.log("Nueva especie creada:", nuevaEspecie);

                if (nuevaEspecie && nuevaEspecie[0]?.id) {
                    finalEspecieId = nuevaEspecie[0].id;
                } else if (nuevaEspecie && nuevaEspecie.id) {
                    finalEspecieId = nuevaEspecie.id;
                } else {
                    console.warn("La respuesta de creación de especie no trajo ID:", nuevaEspecie);
                }
            }

            const body = {
                geom: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                abundancia: parseInt(formData.abundancia),
                observaciones: formData.observaciones,
                foto_url: formData.foto_url
            };

            if (isManualEntry && !addToCatalog) {
                body.observaciones = `[EXPLORACIÓN: ${formData.nombre_manual}] ${formData.observaciones}`;
                body.especie_id = null;
            } else {
                body.especie_id = finalEspecieId || null;
            }

            console.log("Enviando registro:", body);

            const response = await fetch(`${apiBase}/registros-biologicos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const speciesName = isManualEntry
                    ? formData.nombre_manual
                    : species.find(s => s.id === formData.especie_id)?.nombre_comun;

                setSubmittedData({
                    nombre_especie: speciesName,
                    abundancia: formData.abundancia,
                    tipo: inventoryType,
                    lat,
                    lng
                });
            } else {
                alert("Error al guardar el registro");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedData) {
        return (
            <SuccessModalInventory
                data={submittedData}
                onBackToMap={() => onSubmitSuccess('map')}
                onViewInventory={() => onSubmitSuccess('map')}
            />
        );
    }

    return (
        <div className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 h-full w-full sm:max-w-md bg-[#0c1a11] shadow-2xl z-[100] flex flex-col border-l border-[#13ec5b]/10 animate-fade-in-right text-white">
            <header className="p-4 border-b border-[#13ec5b]/10 flex items-center justify-between bg-white/5">
                <div>
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-icons text-[#13ec5b]">biotech</span>
                        Nuevo Registro Biológico
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                    </p>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-[#13ec5b]/10 rounded-full transition-colors">
                    <span className="material-icons text-slate-400">close</span>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 custom-scrollbar">
                {/* Selector de Tipo: Flora o Fauna */}
                <div className="flex bg-[#102216]/50 p-1 rounded-xl mb-4 border border-[#13ec5b]/10">
                    <button
                        type="button"
                        onClick={() => { setInventoryType('flora'); setFormData(prev => ({ ...prev, especie_id: '' })); setIsManualEntry(false); }}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${inventoryType === 'flora' ? 'bg-[#13ec5b] text-[#102216] shadow-lg shadow-[#13ec5b]/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-icons text-sm">park</span> FLORA
                    </button>
                    <button
                        type="button"
                        onClick={() => { setInventoryType('fauna'); setFormData(prev => ({ ...prev, especie_id: '' })); setIsManualEntry(false); }}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${inventoryType === 'fauna' ? 'bg-[#13ec5b] text-[#102216] shadow-lg shadow-[#13ec5b]/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-icons text-sm">pets</span> FAUNA
                    </button>
                </div>

                <section className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-[#13ec5b]">
                                {isManualEntry ? 'Nombre de la Especie' : `Catálogo de ${inventoryType === 'flora' ? 'Flora' : 'Fauna'}`}
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsManualEntry(!isManualEntry)}
                                className="text-[9px] uppercase font-bold text-slate-400 hover:text-[#13ec5b] transition-colors"
                            >
                                {isManualEntry ? 'Volver al catálogo' : '¿No está en la lista?'}
                            </button>
                        </div>

                        {!isManualEntry ? (
                            <CustomSelect
                                name="especie_id"
                                value={formData.especie_id}
                                onChange={handleChange}
                                placeholder={isLoadingSpecies ? "Cargando catálogo..." : `Selecciona ${inventoryType === 'flora' ? 'una planta' : 'un animal'}...`}
                                options={species
                                    .filter(s => s.tipo === inventoryType)
                                    .map(s => ({
                                        value: s.id,
                                        label: s.nombre_comun
                                    }))}
                            />
                        ) : (
                            <div className="space-y-3">
                                <input
                                    name="nombre_manual"
                                    type="text"
                                    value={formData.nombre_manual}
                                    onChange={handleChange}
                                    placeholder="Ej: Pájaro Carpintero Real"
                                    className="w-full bg-[#102216]/50 border border-[#13ec5b]/20 rounded-lg p-3 text-sm outline-none focus:border-[#13ec5b] text-white"
                                />
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={addToCatalog}
                                        onChange={(e) => setAddToCatalog(e.target.checked)}
                                        className="checkbox checkbox-xs border-[#13ec5b]/30 checked:border-[#13ec5b]"
                                    />
                                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-[#13ec5b] transition-colors">
                                        Agregar al catálogo permanente
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-medium mb-1.5 uppercase tracking-widest text-[#13ec5b]">Abundancia / Cantidad</label>
                        <input
                            name="abundancia"
                            type="number"
                            min="1"
                            value={formData.abundancia}
                            onChange={handleChange}
                            className="w-full bg-[#102216]/50 border border-[#13ec5b]/20 rounded-lg p-3 text-sm outline-none focus:border-[#13ec5b]"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-medium mb-1.5 uppercase tracking-widest text-[#13ec5b]">Observaciones de Campo</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            className="w-full bg-[#102216]/50 border border-[#13ec5b]/20 rounded-lg p-3 text-sm h-32 outline-none focus:border-[#13ec5b] resize-none"
                            placeholder="Detalles sobre el estado del ejemplar, comportamiento, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-medium mb-1.5 uppercase tracking-widest text-[#13ec5b]">Fotografía del Ejemplar</label>

                        <div className="flex flex-col gap-3">
                            {formData.foto_url && (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#13ec5b]/30">
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
                                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#13ec5b]/20 hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 rounded-xl p-3 transition-all cursor-pointer group">
                                    <span className="material-icons text-[#13ec5b]/50 group-hover:text-[#13ec5b] mb-1">add_a_photo</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-500 group-hover:text-[#13ec5b]">Cargar Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const uploadData = new FormData();
                                            uploadData.append('file', file);

                                            try {
                                                const apiBase = `http://${window.location.hostname}:8001`;
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
                                                alert("Error al subir la foto.");
                                            }
                                        }}
                                    />
                                </label>

                                <div className="flex-1">
                                    <input
                                        name="foto_url"
                                        value={formData.foto_url}
                                        onChange={handleChange}
                                        className="w-full bg-[#102216]/50 border border-[#13ec5b]/20 rounded-lg p-3 text-xs focus:border-[#13ec5b] outline-none transition-all placeholder:text-slate-500 text-white"
                                        placeholder="O pega URL..."
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </form>

            <footer className="p-4 border-t border-[#13ec5b]/10 bg-[#102216]/80 flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 rounded-lg transition-colors">
                    Cancelar
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-3 bg-[#13ec5b] text-[#081c15] font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    {isSubmitting ? 'Guardando...' : 'Guardar en Inventario'}
                </button>
            </footer>
        </div>
    );
}

export default NewInventoryForm;
