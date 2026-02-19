import React from 'react';

function DeleteConfirmModal({ reportTitle, onConfirm, onCancel, isDeleting }) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#102216]/95 border border-red-500/30 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Modal Header / Decorative Top */}
                <div className="h-1.5 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 w-full"></div>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Warning Icon */}
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-500/5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl font-bold text-white mb-2">Eliminar Reporte</h2>
                    <p className="text-slate-400 mb-6 px-4">
                        ¿Estás seguro de que deseas eliminar <span className="text-white font-semibold italic">"{reportTitle}"</span>?
                        Esta acción es permanente y no se puede deshacer.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-white/10 order-2 sm:order-1"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Eliminando...</span>
                                </>
                            ) : (
                                <span>Eliminar permanentemente</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
