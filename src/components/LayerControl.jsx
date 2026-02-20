const MAP_STYLES = {
  hibrido: 'https://api.maptiler.com/maps/hybrid/style.json?key=wxRpMoRkMeIY1OWMwquv',
  calles: 'https://api.maptiler.com/maps/streets-v2/style.json?key=wxRpMoRkMeIY1OWMwquv',
  topo: 'https://api.maptiler.com/maps/topo-v2/style.json?key=wxRpMoRkMeIY1OWMwquv',
  satelite: 'https://api.maptiler.com/maps/satellite/style.json?key=wxRpMoRkMeIY1OWMwquv',
  base: 'https://api.maptiler.com/maps/base-v4/style.json?key=wxRpMoRkMeIY1OWMwquv',
};

function LayerControl({ onStyleChange, isMobile }) {
  // On mobile (bottom controls), open UP. On desktop (top controls), open DOWN.
  const dropdownDirection = isMobile ? "dropdown-top" : "dropdown-bottom";

  return (
    <div className={`dropdown ${dropdownDirection} dropdown-end`}>
      <div
        tabIndex={0}
        role="button"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-[#162a1d]/90 backdrop-blur-md border border-[#1f3a28] rounded-xl flex items-center justify-center text-white hover:bg-[#13ec5b]/10 transition-all shadow-2xl"
        title="Cambiar Capas"
      >
        <span className="material-icons sm:text-2xl">layers</span>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-[#162a1d]/95 backdrop-blur-xl border border-[#1f3a28] rounded-xl z-[50] w-56 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-3 mt-3 max-h-[70vh] flex-nowrap overflow-y-auto custom-scrollbar"
      >
        <li className="menu-title text-[10px] opacity-60 uppercase font-black tracking-[0.2em] text-[#13ec5b] px-4 py-2 sticky top-0 bg-[#162a1d]/95 backdrop-blur-sm z-10">
          Capas del Mapa
        </li>
        <div className="space-y-1">
          {Object.entries({
            'Híbrido': { url: MAP_STYLES.hibrido, icon: 'map' },
            'Relieve': { url: MAP_STYLES.topo, icon: 'terrain' },
            'Calles': { url: MAP_STYLES.calles, icon: 'directions_car' },
            'Satélite': { url: MAP_STYLES.satelite, icon: 'satellite_alt' },
            'Básico': { url: MAP_STYLES.base, icon: 'public' }
          }).map(([name, data]) => (
            <li key={name}>
              <button
                className="flex items-center gap-3 py-3 px-4 text-sm text-slate-300 hover:text-white hover:bg-[#13ec5b]/10 rounded-lg transition-colors group"
                onClick={() => {
                  onStyleChange(data.url);
                  document.activeElement?.blur();
                }}
              >
                <span className="material-icons text-lg text-slate-500 group-hover:text-[#13ec5b] transition-colors">{data.icon}</span>
                <span className="font-medium text-xs sm:text-sm">{name}</span>
              </button>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
}

export default LayerControl;