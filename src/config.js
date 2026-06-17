const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        // Si accedemos desde el celular u otro dispositivo, usamos el hostname actual del navegador
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return `http://${window.location.hostname}:8001`;
        }
    }
    return envUrl || `http://${window.location.hostname}:8001`;
};

export const API_BASE_URL = getApiBaseUrl();
