import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerControl from './LayerControl';

function GisMap({ onStartReport, targetCoords, onClearTarget }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [coordinates, setCoordinates] = useState({ lat: -31.675, lng: -64.442 });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);

  // 1. EXPLICACIÓN: Función para pedir datos al servidor (Backend)
  // Usamos 'fetch' para llamar a nuestra API en el puerto 8000.
  const fetchReports = async () => {
    const apiBase = `http://${window.location.hostname}:8001`;
    try {
      const response = await fetch(`${apiBase}/reportes`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };


  useEffect(() => {
    fetchReports();
  }, []);

  // 2. EXPLICACIÓN: Inicialización del Mapa
  useEffect(() => {
    if (map.current) return;

    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/base-v4/style.json?key=wxRpMoRkMeIY1OWMwquv',
        center: [-64.44216519755551, -31.675035131832175],
        zoom: 9,
      });

      map.current.on('mousemove', (e) => {
        setCoordinates({
          lat: e.lngLat.lat.toFixed(4),
          lng: e.lngLat.lng.toFixed(3)
        });
      });

      // 4. EXPLICACIÓN: Manejo de Click Derecho para Nuevo Reporte (Diseño Premium)
      map.current.on('contextmenu', (e) => {
        const { lng, lat } = e.lngLat;

        // Crear contenedor para el popup con estilo Stitch
        const popupNode = document.createElement('div');
        popupNode.className = 'p-0 overflow-hidden rounded-xl bg-[#102216] border border-[#13ec5b]/30 shadow-[0_0_20px_rgba(19,236,91,0.2)] text-white min-w-[200px] animate-in fade-in zoom-in duration-200';

        popupNode.innerHTML = `
          <div class="px-4 py-3 border-b border-[#13ec5b]/10 bg-white/5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#13ec5b] font-bold mb-1 opacity-80">Nuevo Reporte</p>
            <p class="text-sm font-semibold text-white/90">¿Iniciar reporte aquí?</p>
          </div>
          <div class="px-4 py-2 bg-[#081C15]/50 flex items-center gap-1 text-[10px] text-white/40 font-mono italic border-b border-[#13ec5b]/5">
            <span class="material-icons text-[12px]">location_on</span>
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
          <div class="p-3 flex gap-2 bg-[#102216]">
            <button id="btn-cancel-report" class="flex-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all border border-white/5">Cancelar</button>
            <button id="btn-start-report" class="flex-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-[#13ec5b] hover:bg-[#13ec5b]/80 text-[#081C15] rounded-lg transition-all shadow-[0_4px_12px_rgba(19,236,91,0.3)]">Confirmar</button>
          </div>
        `;

        const popup = new maplibregl.Popup({
          closeButton: false,
          className: 'stitch-popup',
          maxWidth: '300px',
          anchor: 'bottom',
          offset: [0, -10]
        })
          .setLngLat([lng, lat])
          .setDOMContent(popupNode)
          .addTo(map.current);

        // Event listeners
        popupNode.querySelector('#btn-start-report').onclick = () => {
          popup.remove();
          if (onStartReport) onStartReport(lat, lng);
        };

        popupNode.querySelector('#btn-cancel-report').onclick = () => {
          popup.remove();
        };
      });


      map.current.on('load', () => {

        map.current.resize();
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) map.current.remove();
    };
  }, []);

  // 5. EXPLICACIÓN: Volar a coordenadas específicas si vienen de la lista
  useEffect(() => {
    if (map.current && targetCoords) {
      console.log("DEBUG: Flying to target coordinates:", targetCoords);
      map.current.flyTo({
        center: targetCoords, // [lng, lat]
        zoom: 14,
        essential: true,
        speed: 1.5
      });

      // Limpiamos el target para que no se repita el vuelo si cambiamos de vista y volvemos
      if (onClearTarget) {
        setTimeout(onClearTarget, 2000);
      }
    }
  }, [targetCoords]);

  // 3. EXPLICACIÓN: Dibujar Marcadores Reales
  // Cada vez que la lista 'reports' cambia, borramos los viejos y dibujamos los nuevos.
  useEffect(() => {
    if (!map.current || reports.length === 0) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      // PostGIS nos devuelve [lng, lat] en 'geom.coordinates'
      const lngLat = report.geom.coordinates;

      const el = document.createElement('div');
      el.className = 'custom-marker';

      const markerColor = report.estado === 'pendiente' ? '#f59e0b' : '#13ec37';

      el.style.cssText = `
        width: 36px;
        height: 36px;
        background-color: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;

      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      el.addEventListener('click', () => setSelectedReport(report));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [reports]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleRecenter = () => {
    map.current?.flyTo({
      center: [-64.4420, -31.6749],
      zoom: 12
    });
  };
  const handleStyleChange = (newStyleUrl) => map.current?.setStyle(newStyleUrl);

  return (
    <div className="h-full w-full relative bg-[#0a2e1a]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-[#1a2332] border-b border-gray-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#13ec37] rounded-lg flex items-center justify-center font-bold text-black">ECO</div>
          <div>
            <div className="font-bold text-white text-lg">EcoReport GIS</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rezerva Nature Reserve</div>
          </div>
        </div>
        <button className="btn btn-sm bg-[#13ec37] text-black border-none">Nuevo Reporte</button>
      </div>

      <div ref={mapContainer} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute right-6 top-24 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="w-12 h-12 bg-[#1a2332] rounded-lg text-white">+</button>
        <button onClick={handleZoomOut} className="w-12 h-12 bg-[#1a2332] rounded-lg text-white">-</button>
        <button onClick={handleRecenter} className="w-12 h-12 bg-[#1a2332] rounded-lg text-white">⦿</button>
        <LayerControl onStyleChange={handleStyleChange} />
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#0f1419] border-t border-gray-700/50 px-6 py-2 flex items-center justify-between text-xs">
        <div className="text-gray-400 font-mono">
          {coordinates.lat}° N | {coordinates.lng}° W
        </div>
        <div className="flex items-center gap-2 text-[#13ec37]">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          CONNECTED TO FASTAPI
        </div>
      </div>

      {/* Popup de Reporte */}
      {selectedReport && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 w-80 bg-white rounded-xl shadow-2xl overflow-hidden text-gray-800">
          <div className="h-32 bg-green-700 flex items-center justify-center text-white">
            {selectedReport.foto_url ? (
              <img src={selectedReport.foto_url} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🌲</span>
            )}
          </div>
          <div className="p-4">
            <span className="text-[10px] font-bold uppercase text-green-600">
              {selectedReport.categorias?.nombre || "Sin categoría"}
            </span>
            <h3 className="font-bold text-lg leading-tight mb-1">{selectedReport.titulo}</h3>
            <p className="text-sm text-gray-600 mb-3">{selectedReport.notas}</p>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
              <span className="capitalize">Estado: {selectedReport.estado}</span>
              <button onClick={() => setSelectedReport(null)} className="text-red-500 font-bold">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GisMap;