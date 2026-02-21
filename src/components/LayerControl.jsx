const MAP_STYLES = {
  hibrido: 'https://api.maptiler.com/maps/hybrid/style.json?key=wxRpMoRkMeIY1OWMwquv',
  calles: 'https://api.maptiler.com/maps/streets-v2/style.json?key=wxRpMoRkMeIY1OWMwquv',
  topo: 'https://api.maptiler.com/maps/topo-v2/style.json?key=wxRpMoRkMeIY1OWMwquv',
  satelite: 'https://api.maptiler.com/maps/satellite/style.json?key=wxRpMoRkMeIY1OWMwquv',
  base: 'https://api.maptiler.com/maps/base-v4/style.json?key=wxRpMoRkMeIY1OWMwquv',
};

function LayerControl({ onStyleChange, onOverlayToggle, overlays = {}, isMobile }) {
  // On mobile (bottom controls), open UP. On desktop (top controls), open DOWN.
  const dropdownDirection = isMobile ? "dropdown-top" : "dropdown-bottom";

  return (
    <div className={`dropdown ${dropdownDirection} dropdown-end`}>
      <div
        tabIndex={0}
        role="button"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-[#162a1d]/90 backdrop-blur-md border border-[#1f3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#13ec5b]/10 transition-all shadow-2xl"
        title="Configurar Capas"
      >
        <span className="material-icons sm:text-2xl">layers</span>
      </div>

      <ul
        tabIndex={0}
        className={`dropdown-content menu bg-[#162a1d]/95 backdrop-blur-xl border border-[#1f3a28] rounded-xl z-[50] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-3 mt-3 flex-nowrap overflow-y-auto custom-scrollbar
                   ${isMobile
            ? "fixed bottom-4 left-4 right-4 w-auto max-w-none max-h-[75vh]"
            : "w-64 max-h-[400px]"} `}
      >
        {isMobile && (
          <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 mb-2">
            <span className="text-[10px] font-bold text-[#13ec5b] tracking-widest uppercase">Panel de Capas</span>
            <div className="w-8 h-1 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
          </div>
        )}

        {/* Sección de Capas de Datos (Overlays) */}
        <li className="menu-title text-[10px] opacity-60 uppercase font-black tracking-[0.2em] text-[#13ec5b] px-4 py-2 sticky top-0 bg-[#162a1d] z-10 flex justify-between items-center">
          <span>Capas de Datos</span>
        </li>
        <div className="px-2 pb-2 space-y-0.5">
          {Object.entries(overlays).map(([id, layer]) => (
            <label key={id} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer active:bg-[#13ec5b]/5">
              <div className="flex items-center gap-3">
                <span className={`material-icons text-base ${layer.visible ? 'text-[#13ec5b]' : 'text-white/20'}`}>{layer.icon}</span>
                <span className={`text-[11px] sm:text-xs font-semibold ${layer.visible ? 'text-white' : 'text-white/40'}`}>{layer.name}</span>
              </div>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onOverlayToggle(id)}
                className="checkbox checkbox-sm border-[#13ec5b]/30 checked:border-[#13ec5b] [--chkbg:theme(colors.green.500)] [--chkfg:white]"
              />
            </label>
          ))}
        </div>

        <div className="border-t border-white/10 my-1"></div>

        <li className="menu-title text-[10px] opacity-60 uppercase font-black tracking-[0.2em] text-[#13ec5b] px-4 py-2">
          Mapa Base
        </li>
        <div className="space-y-0.5 pb-2">
          {Object.entries({
            'Híbrido': { url: MAP_STYLES.hibrido, icon: 'map' },
            'Relieve': { url: MAP_STYLES.topo, icon: 'terrain' },
            'Calles': { url: MAP_STYLES.calles, icon: 'directions_car' },
            'Satélite': { url: MAP_STYLES.satelite, icon: 'satellite_alt' },
            'Básico': { url: MAP_STYLES.base, icon: 'public' }
          }).map(([name, data]) => (
            <li key={name}>
              <button
                className="flex items-center gap-3 py-2.5 px-4 text-slate-300 hover:text-white hover:bg-[#13ec5b]/10 rounded-lg transition-colors group active:bg-[#13ec5b]/20"
                onClick={() => {
                  onStyleChange(data.url);
                  if (isMobile) document.activeElement.blur();
                }}
              >
                <span className="material-icons text-base text-slate-500 group-hover:text-[#13ec5b] transition-colors">{data.icon}</span>
                <span className="font-semibold text-xs sm:text-sm">{name}</span>
              </button>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
}

export default LayerControl;