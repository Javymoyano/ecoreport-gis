import { useState } from 'react';

function SuccessModal({ reportData, onBackToMap, onViewAllReports }) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Success Modal */}
            <div className="bg-[#102216]/95 border border-[#13ec5b]/30 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Modal Header / Decorative Top */}
                <div className="h-2 bg-gradient-to-r from-[#13ec5b]/20 via-[#13ec5b] to-[#13ec5b]/20 w-full"></div>
                <div className="p-8 md:p-12 flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#13ec5b]/5">
                        <span className="material-icons text-[#13ec5b] text-6xl">check_circle</span>
                    </div>
                    {/* Headline */}
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight line-clamp-2">¡Reporte Enviado con Éxito!</h1>
                    <p className="text-slate-400 mb-8 max-w-sm">Gracias por contribuir a la conservación de nuestra reserva natural. Tus datos han sido registrados y sincronizados.</p>

                    {/* Report Summary Card */}
                    <div className="w-full bg-[#13ec5b]/5 border border-[#13ec5b]/10 rounded-lg p-6 mb-10 text-left">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">ID del Reporte</span>
                                <span className="text-[#13ec5b] font-mono font-medium truncate block text-sm">#{reportData.id?.substring(0, 8) || 'NR-PENDING'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Estado</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#13ec5b]/20 text-[#13ec5b] capitalize">
                                    {reportData.estado || 'Pendiente'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Categoría</span>
                                <div className="flex items-center text-slate-200">
                                    <span className="material-icons text-sm mr-1.5 text-[#13ec5b]/60">label</span>
                                    <span className="text-sm truncate">{reportData.categoria_nombre || 'General'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#13ec5b]/50 font-bold block mb-1">Ubicación</span>
                                <div className="flex items-center text-slate-200">
                                    <span className="material-icons text-sm mr-1.5 text-[#13ec5b]/60">location_on</span>
                                    <span className="text-sm truncate">
                                        {reportData.geom?.coordinates[1].toFixed(3)}, {reportData.geom?.coordinates[0].toFixed(3)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={onBackToMap}
                            className="flex-1 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#081C15] font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <span className="material-icons">map</span>
                            <span className="text-sm">Volver al Mapa</span>
                        </button>
                        <button
                            onClick={onViewAllReports}
                            className="flex-1 bg-transparent hover:bg-[#13ec5b]/10 border border-[#13ec5b]/30 text-[#13ec5b] font-semibold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <span className="material-icons">list_alt</span>
                            <span className="text-sm">Ver Reportes</span>
                        </button>
                    </div>

                    {/* Secondary Info */}
                    <div className="mt-8 pt-6 border-t border-[#13ec5b]/10 w-full">
                        <p className="text-xs text-slate-500">
                            ¿Necesitas hacer cambios? Puedes editar este reporte desde tu <span className="text-[#13ec5b] hover:underline cursor-pointer font-medium">panel de control</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal;
