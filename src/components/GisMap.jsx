import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerControl from './LayerControl';

function GisMap({ onStartReport, onStartInventory, targetCoords, onClearTarget }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [coordinates, setCoordinates] = useState({ lat: -31.675, lng: -64.442 });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [biologicRecords, setBiologicRecords] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const biologicMarkersRef = useRef([]);
  const selectionMarkerRef = useRef(null);
  const [overlays, setOverlays] = useState({
    reports: { id: 'reports', name: 'Reportes Globales', visible: true, icon: 'campaign' },
    flora: { id: 'flora', name: 'Flora (Protectores)', visible: true, icon: 'park' },
    fauna: { id: 'fauna', name: 'Fauna (Avistajes)', visible: true, icon: 'pets' },
  });

  const handleOverlayToggle = (id) => {
    setOverlays(prev => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible }
    }));
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReports = async () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8001`;
    try {
      const response = await fetch(`${apiBase}/reportes`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  const fetchBiologicRecords = async () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8001`;
    try {
      const response = await fetch(`${apiBase}/registros-biologicos`);
      const data = await response.json();
      setBiologicRecords(data);
    } catch (error) {
      console.error('Error al cargar registros biológicos:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchBiologicRecords();
  }, []);

  useEffect(() => {
    if (map.current) return;

    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/base-v4/style.json?key=wxRpMoRkMeIY1OWMwquv',
        center: [-64.44216519755551, -31.675035131832175],
        zoom: isMobile ? 8 : 9,
      });

      map.current.on('mousemove', (e) => {
        setCoordinates({
          lat: e.lngLat.lat.toFixed(4),
          lng: e.lngLat.lng.toFixed(3)
        });
      });

      // Long press simulation for mobile
      let touchTimeout;

      map.current.on('touchstart', (e) => {
        if (e.points.length === 1) {
          touchTimeout = setTimeout(() => {
            handleMapInteraction(e.lngLat);
          }, 800);
        }
      });
      map.current.on('touchend', () => clearTimeout(touchTimeout));
      map.current.on('touchmove', () => clearTimeout(touchTimeout));

      const handleMapInteraction = (lngLat) => {
        const { lng, lat } = lngLat;

        // Si ya hay un marcador de selección activo, lo removemos antes de crear el nuevo
        if (selectionMarkerRef.current) {
          selectionMarkerRef.current.remove();
        }

        // Crear elemento de marcador temporal con estilo y animación pulidos (verde brillante con aura de onda)
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
          animation: pulse-selection-marker 1.8s infinite;
          cursor: pointer;
        `;

        // Agregar animación de pulsación si no existe
        if (!document.getElementById('pulse-selection-style')) {
          const style = document.createElement('style');
          style.id = 'pulse-selection-style';
          style.innerHTML = `
            @keyframes pulse-selection-marker {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
              70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `;
          document.head.appendChild(style);
        }

        const popupNode = document.createElement('div');
        popupNode.className = 'p-0 overflow-hidden rounded-xl bg-[#102216] border border-[#13ec5b]/30 shadow-[0_0_20px_rgba(19,236,91,0.2)] text-white min-w-[200px] animate-in fade-in zoom-in duration-200';
        popupNode.innerHTML = `
          <div class="px-4 py-3 border-b border-[#13ec5b]/10 bg-white/5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#13ec5b] font-bold mb-1 opacity-80">Nuevo Registro</p>
            <p class="text-sm font-semibold text-white/90">¿Qué deseas registrar aquí?</p>
          </div>
          <div class="px-4 py-2 bg-[#081C15]/50 flex items-center gap-1 text-[10px] text-white/40 font-mono italic border-b border-[#13ec5b]/5">
            <span class="material-icons text-[12px]">location_on</span>
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
          <div class="p-3 flex flex-col gap-2 bg-[#102216]">
            <button id="btn-start-report" class="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-white/5 hover:bg-[#13ec5b]/20 text-white rounded-lg transition-all border border-white/5 group">
              <span>Reporte Incidente</span>
              <span class="material-icons text-xs">campaign</span>
            </button>
            <button id="btn-start-inventory" class="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-[#13ec5b] hover:bg-[#13ec5b]/80 text-[#081C15] rounded-lg transition-all shadow-[0_4px_12px_rgba(19,236,91,0.3)]">
              <span>Flora / Fauna</span>
              <span class="material-icons text-xs">biotech</span>
            </button>
            <button id="btn-cancel-report" class="w-full py-1.5 text-[9px] font-bold uppercase tracking-tighter text-white/40 hover:text-white/60 transition-colors">Cerrar</button>
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
          .setDOMContent(popupNode);

        // Crear el marcador en esa ubicación
        const newMarker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);

        selectionMarkerRef.current = newMarker;

        // Abrimos el popup del marcador automáticamente asociándolo al mapa
        popup.addTo(map.current);

        popupNode.querySelector('#btn-start-report').onclick = () => {
          popup.remove();
          if (selectionMarkerRef.current) {
            selectionMarkerRef.current.remove();
            selectionMarkerRef.current = null;
          }
          if (onStartReport) onStartReport(lat, lng);
        };
        popupNode.querySelector('#btn-start-inventory').onclick = () => {
          popup.remove();
          if (selectionMarkerRef.current) {
            selectionMarkerRef.current.remove();
            selectionMarkerRef.current = null;
          }
          if (onStartInventory) onStartInventory(lat, lng);
        };
        popupNode.querySelector('#btn-cancel-report').onclick = () => {
          popup.remove();
          if (selectionMarkerRef.current) {
            selectionMarkerRef.current.remove();
            selectionMarkerRef.current = null;
          }
        };

        // Si se cierra el popup haciendo click en otro lado, también borramos el marcador de selección
        popup.on('close', () => {
          if (selectionMarkerRef.current) {
            selectionMarkerRef.current.remove();
            selectionMarkerRef.current = null;
          }
        });
      };

      map.current.on('contextmenu', (e) => handleMapInteraction(e.lngLat));

      map.current.on('load', () => {
        map.current.resize();
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && targetCoords) {
      map.current.flyTo({
        center: targetCoords,
        zoom: 14,
        essential: true,
        speed: 1.5
      });
      if (onClearTarget) {
        setTimeout(onClearTarget, 2000);
      }
    }
  }, [targetCoords]);

  useEffect(() => {
    if (!map.current) return;

    // Limpiar todos los marcadores existentes
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    biologicMarkersRef.current.forEach(m => m.remove());
    biologicMarkersRef.current = [];

    // --- Renderizar Reportes ---
    if (overlays.reports.visible && reports.length > 0) {
      reports.forEach((report) => {
        const lngLat = report.geom.coordinates;
        const el = document.createElement('div');
        el.className = 'custom-marker-report';

        const statusName = report.estados?.nombre || 'pendiente';
        const markerColor = statusName === 'Pendiente' ? '#f59e0b' :
          statusName === 'En Proceso' ? '#3b82f6' : '#13ec5b';

        el.style.cssText = `
          width: ${isMobile ? '28px' : '36px'};
          height: ${isMobile ? '28px' : '36px'};
          background-color: ${markerColor};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        `;

        el.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: ${isMobile ? '14px' : '18px'}; height: ${isMobile ? '14px' : '18px'};">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `;

        el.addEventListener('click', () => setSelectedReport(report));
        const marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map.current);
        markersRef.current.push(marker);
      });
    }

    // --- Renderizar Registros Biológicos (Flora/Fauna) ---
    biologicRecords.forEach((record) => {
      const type = record.catalogo_especies?.tipo; // 'flora' o 'fauna'
      if (!overlays[type]?.visible) return;

      const lngLat = record.geom.coordinates;
      const el = document.createElement('div');
      el.className = `custom-marker-${type}`;

      const markerColor = type === 'flora' ? '#22c55e' : '#a855f7'; // Verde para flora, Púrpura para fauna
      const icon = type === 'flora' ? 'park' : 'pets';

      el.style.cssText = `
        width: ${isMobile ? '24px' : '30px'};
        height: ${isMobile ? '24px' : '30px'};
        background-color: ${markerColor};
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        transition: all 0.2s;
      `;

      el.innerHTML = `<span class="material-icons text-white" style="font-size: ${isMobile ? '16px' : '20px'}">${icon}</span>`;

      el.addEventListener('click', () => {
        const speciesName = record.catalogo_especies?.nombre_comun || "Registro de Exploración";
        setSelectedReport({
          id: record.id,
          titulo: speciesName,
          description: record.observaciones || 'Sin observaciones adicionales.',
          foto_url: record.foto_url,
          categorias: { nombre: type.toUpperCase() }
        });
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map.current);
      biologicMarkersRef.current.push(marker);
    });

  }, [reports, biologicRecords, isMobile, overlays]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const [isLocating, setIsLocating] = useState(false);
  const userLocationMarkerRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);

  const handleRecenter = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es soportada por este navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        setUserCoords({ lat: latitude, lng: longitude });

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 18, // Zoom muy alto para separar visualmente
            essential: true
          });

          // Eliminar el marcador de usuario anterior si existe
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.remove();
          }

          // Crear un marcador personalizado para la posición actual del usuario
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.style.cssText = `
            width: 22px;
            height: 22px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
            animation: pulse-marker 1.8s infinite;
          `;

          // Agregar animación CSS al documento si no existe
          if (!document.getElementById('pulse-marker-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-marker-style';
            style.innerHTML = `
              @keyframes pulse-marker {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); }
                70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            `;
            document.head.appendChild(style);
          }

          const markerNode = document.createElement('div');
          markerNode.className = 'p-0 overflow-hidden rounded-xl bg-[#102216] border border-[#13ec5b]/30 shadow-lg text-white min-w-[200px]';
          markerNode.innerHTML = `
            <div class="px-3 py-2 border-b border-[#13ec5b]/10 bg-white/5 text-center">
              <p class="text-[9px] uppercase tracking-wider text-[#13ec5b] font-bold">Estás Aquí</p>
              <p class="text-xs font-semibold text-white/90">Ubicación GPS Confirmada</p>
            </div>
            <div class="p-3 flex flex-col gap-2 bg-[#102216]">
              <button id="btn-user-report" class="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-[#13ec5b]/20 text-white rounded-lg transition-all border border-white/5 group">
                <span>Reportar Incidente</span>
                <span class="material-icons text-xs">campaign</span>
              </button>
              <button id="btn-user-inventory" class="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-[#13ec5b] hover:bg-[#13ec5b]/80 text-[#081C15] rounded-lg transition-all">
                <span>Flora / Fauna</span>
                <span class="material-icons text-xs">biotech</span>
              </button>
            </div>
          `;

          const popup = new maplibregl.Popup({
            closeButton: false,
            offset: [0, -10]
          })
            .setDOMContent(markerNode);

          const newMarker = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map.current);

          userLocationMarkerRef.current = newMarker;

          // Abrir popup inmediatamente al geolocalizar
          popup.addTo(map.current);

          // Evento de los botones dentro del popup del marcador de usuario
          setTimeout(() => {
            const btnReport = document.getElementById('btn-user-report');
            if (btnReport) {
              btnReport.onclick = () => {
                popup.remove();
                if (onStartReport) onStartReport(latitude, longitude);
              };
            }
            const btnInventory = document.getElementById('btn-user-inventory');
            if (btnInventory) {
              btnInventory.onclick = () => {
                popup.remove();
                if (onStartInventory) onStartInventory(latitude, longitude);
              };
            }
          }, 150);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Error obteniendo ubicación:", error);
        let errorMsg = "Error al obtener la ubicación.";
        if (error.code === 1) errorMsg = "Permiso de ubicación denegado. Por favor, actívalo en tu navegador/celular.";
        else if (error.code === 2) errorMsg = "La señal GPS no está disponible temporalmente.";
        else if (error.code === 3) errorMsg = "Tiempo de espera agotado al obtener el GPS.";
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };
  const handleStyleChange = (newStyleUrl) => map.current?.setStyle(newStyleUrl);

  return (
    <div className="h-full w-full relative bg-[#0a2e1a]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-[#162a1d]/80 backdrop-blur-md border-b border-[#1f3a28] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b]">
            <span className="material-symbols-outlined text-base sm:text-lg">explore</span>
          </div>
          <div>
            <h1 className="text-[10px] sm:text-sm font-bold text-white uppercase tracking-widest leading-none">Explorador de Mapa</h1>
            <p className="text-[7px] sm:text-[9px] text-[#13ec5b]/60 uppercase font-bold tracking-widest mt-0.5">Monitoreo Ambiental de la Reserva Natural El Amanecer</p>
          </div>
        </div>
        <button
          onClick={() => {
            const lat = userCoords ? userCoords.lat : -31.675;
            const lng = userCoords ? userCoords.lng : -64.442;
            onStartReport(lat, lng);
          }}
          className="bg-[#13ec5b] hover:bg-[#13ec5b]/80 text-[#081C15] text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-lg"
        >
          {isMobile ? '+' : 'Nuevo Reporte'}
        </button>
      </div>

      <div ref={mapContainer} className="w-full h-full" />

      {/* Controls */}
      <div className={`absolute right-4 sm:right-6 ${isMobile ? 'bottom-24' : 'top-24'} z-20 flex flex-col gap-3`}>
        <div className="flex flex-col rounded-xl overflow-hidden bg-[#162a1d]/90 backdrop-blur-md border border-[#1f3a28] shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-[#13ec5b]/10 transition-colors border-b border-[#1f3a28]"
            title="Aumentar Zoom"
          >
            <span className="material-icons sm:text-2xl">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-[#13ec5b]/10 transition-colors"
            title="Alejar Zoom"
          >
            <span className="material-icons sm:text-2xl">remove</span>
          </button>
        </div>

        <button
          onClick={handleRecenter}
          disabled={isLocating}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#13ec5b] text-[#102216] rounded-xl flex items-center justify-center shadow-lg shadow-[#13ec5b]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Mi ubicación"
        >
          {isLocating ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#102216] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-icons sm:text-2xl">my_location</span>
          )}
        </button>

        <LayerControl
          onStyleChange={handleStyleChange}
          onOverlayToggle={handleOverlayToggle}
          overlays={overlays}
          isMobile={isMobile}
        />
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#0f1419]/90 backdrop-blur-sm border-t border-gray-700/50 px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between text-[8px] sm:text-xs">
        <div className="text-gray-400 font-mono">
          {coordinates.lat}° N {isMobile ? '' : '|'} {coordinates.lng}° W
        </div>
        <div className="flex items-center gap-2 text-[#13ec5b]">
          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
          <span className="font-black tracking-widest uppercase text-[9px] sm:text-[10px]">FastAPI Link</span>
        </div>
      </div>

      {/* Popup de Reporte */}
      {selectedReport && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:top-32 sm:bottom-auto z-20 sm:w-80 bg-white rounded-xl shadow-2xl overflow-hidden text-gray-800 animate-in slide-in-from-bottom sm:slide-in-from-top duration-300">
          <div className="h-24 sm:h-32 bg-green-700 relative overflow-hidden">
            {selectedReport.foto_url ? (
              <img src={selectedReport.foto_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#102216] text-white overflow-hidden">
                <span className="text-4xl animate-pulse">🌲</span>
              </div>
            )}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold uppercase text-green-600">
                {selectedReport.categorias?.nombre || "General"}
              </span>
              <span className="text-[9px] font-mono text-gray-400">#{selectedReport.id.substring(0, 8)}</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg leading-tight mb-1">{selectedReport.titulo}</h3>
            <p className="text-xs text-gray-600 mb-4 line-clamp-2">{selectedReport.description || 'Sin descripción adicional.'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  // This could navigate to details, for now we just close and maybe let the app handle it
                  setSelectedReport(null);
                }}
                className="flex-1 py-2 text-xs font-bold bg-[#102216] text-white rounded-lg hover:bg-[#162a1d] transition-colors"
              >
                Ver más
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GisMap;