import React from 'react';

function SuccessModalInventory({ data, onBackToMap, onViewInventory }) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#102216]/95 border border-[#13ec5b]/30 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="h-2 bg-gradient-to-r from-[#13ec5b]/20 via-[#13ec5b] to-[#13ec5b]/20 w-full"></div>
                <div className="p-8 md:p-12 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#13ec5b]/5">
                        <span className="material-icons text-[#13ec5b] text-6xl">biotech</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">¡Registro Exitoso!</h1>
                    <p className="text-slate-400 mb-8 max-w-sm">La información biológica ha sido añadida correctamente al inventario de la reserva.</p>

                    <div className="w-full bg-[#13ec5b]/5 border border-[#13ec5b]/10 rounded-lg p-6 mb-10 text-left">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Especie</span>
                                <span className="text-[#13ec5b] font-medium truncate block text-sm">
                                    {data.nombre_especie || 'No especificada'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Cantidad</span>
                                <span className="text-white font-medium text-sm">
                                    {data.abundancia} ejemplares
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Tipo</span>
                                <div className="flex items-center text-slate-200">
                                    <span className="material-icons text-sm mr-1.5 text-[#13ec5b]/60">
                                        {data.tipo === 'flora' ? 'park' : 'pets'}
                                    </span>
                                    <span className="text-sm capitalize">{data.tipo}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Ubicación</span>
                                <div className="flex items-center text-slate-200">
                                    <span className="material-icons text-sm mr-1.5 text-[#13ec5b]/60">location_on</span>
                                    <span className="text-sm truncate">
                                        {parseFloat(data.lat).toFixed(3)}, {parseFloat(data.lng).toFixed(3)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={onBackToMap}
                            className="flex-1 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#081C15] font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#13ec5b]/20"
                        >
                            <span className="material-icons">map</span>
                            <span className="text-sm">Volver al Mapa</span>
                        </button>
                        <button
                            onClick={onViewInventory}
                            className="flex-1 bg-transparent hover:bg-[#13ec5b]/10 border border-[#13ec5b]/30 text-[#13ec5b] font-semibold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <span className="material-icons">history</span>
                            <span className="text-sm">Cerrar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuccessModalInventory;
