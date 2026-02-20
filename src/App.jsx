import { useState, useEffect } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import GisMap from './components/GisMap';
import ReportsList from './components/ReportsList';
import NewReportForm from './components/NewReportForm';
import ReportDetail from './components/ReportDetail';

function App() {
  const [currentView, setCurrentView] = useState('map');
  const [selectedReport, setSelectedReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingReportCoords, setPendingReportCoords] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setCurrentView('reportDetail');
    setMobileSidebarOpen(false);
  };

  const handleStartReportFromMap = (lat, lng) => {
    setPendingReportCoords({ lat, lng });
  };

  const handleCancelNewReport = () => {
    setPendingReportCoords(null);
  };

  const handleSubmitSuccess = (nextView = 'reports') => {
    setPendingReportCoords(null);
    setCurrentView(nextView);
  };

  const handleNewReport = () => {
    setPendingReportCoords({ lat: -31.675, lng: -64.442 });
    setMobileSidebarOpen(false);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setCurrentView('reports');
  };

  const handleViewOnMap = (coords) => {
    setMapTarget(coords);
    setCurrentView('map');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard', view: 'dashboard' },
    { id: 'map', label: 'Mapa', icon: 'map', view: 'map' },
    { id: 'reports', label: 'Reportes', icon: 'history', view: 'reports' },
    { id: 'analytics', label: 'Estadísticas', icon: 'analytics', view: 'analytics' },
    { id: 'settings', label: 'Configuración', icon: 'settings', view: 'settings' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      ),
      map: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
      ),
      history: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      analytics: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      settings: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-4 border-b border-[#1f3a28]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#13ec5b] flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
            🌲
          </div>
          {(sidebarOpen || isMobile) && (
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-white text-gradient bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate">Reserva Natural</h1>
              <p className="text-[#13ec5b] text-[10px] uppercase font-black tracking-[0.2em] opacity-80">Sistema de Gestión</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === item.view || (currentView.includes('report') && item.view === 'reports')
                  ? 'bg-[#13ec5b]/20 text-[#13ec5b] font-semibold'
                  : 'hover:bg-[#13ec5b]/10 text-slate-400 hover:text-white'
                  }`}
              >
                {getIcon(item.icon)}
                {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {(sidebarOpen || isMobile) && (
        <div className="p-4 border-t border-[#1f3a28]">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-[#13ec5b]/20 text-[#13ec5b] rounded-full w-10 font-semibold flex items-center justify-center flex-shrink-0">
                <span className="text-sm">JM</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">Javy Moyano</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen w-full flex bg-[#102216]">

      {/* Mobile Top Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#162a1d] border-b border-[#1f3a28] flex items-center justify-between px-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 hover:bg-[#13ec5b]/10 rounded-lg text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌲</span>
            <span className="font-bold text-white text-sm">Reserva Natural</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="w-72 h-full bg-[#162a1d] border-r border-[#1f3a28] flex flex-col animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-4 hover:bg-[#13ec5b]/10 transition-colors border-t border-[#1f3a28] text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">Cerrar menú</span>
            </button>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#162a1d] border-r border-[#1f3a28] transition-all duration-300 flex flex-col flex-shrink-0`}>
          <SidebarContent />
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-4 hover:bg-[#13ec5b]/10 transition-colors border-t border-[#1f3a28] text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-0 overflow-hidden relative ${isMobile ? 'pt-14' : ''}`}>
        {currentView === 'map' && (
          <GisMap
            onStartReport={handleStartReportFromMap}
            targetCoords={mapTarget}
            onClearTarget={() => setMapTarget(null)}
          />
        )}
        {currentView === 'reports' && (
          <ReportsList
            onSelectReport={handleSelectReport}
            onNewReport={handleNewReport}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {/* New Report Overlay (Premium Design) */}
        {pendingReportCoords && (
          <NewReportForm
            lat={pendingReportCoords.lat}
            lng={pendingReportCoords.lng}
            onCancel={handleCancelNewReport}
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}

        {currentView === 'reportDetail' && (
          <ReportDetail
            report={selectedReport}
            onBack={handleBackToList}
          />
        )}
        {currentView === 'dashboard' && (
          <div className="h-full overflow-y-auto bg-[#102216] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#13ec5b] mb-6">Panel Principal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="card bg-[#162a1d] border border-[#1f3a28]">
                  <div className="card-body">
                    <h3 className="text-3xl md:text-4xl font-bold text-[#13ec5b]">142</h3>
                    <p className="text-gray-400 text-sm">Reportes Resueltos</p>
                  </div>
                </div>
                <div className="card bg-[#162a1d] border border-[#1f3a28]">
                  <div className="card-body">
                    <h3 className="text-3xl md:text-4xl font-bold text-yellow-400">28</h3>
                    <p className="text-gray-400 text-sm">Actualmente Activos</p>
                  </div>
                </div>
                <div className="card bg-[#162a1d] border border-[#1f3a28]">
                  <div className="card-body">
                    <h3 className="text-3xl md:text-4xl font-bold text-red-400">4</h3>
                    <p className="text-gray-400 text-sm">Prioridad Alta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentView === 'analytics' && (
          <div className="h-full overflow-y-auto bg-[#102216] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#13ec5b] mb-6">Estadísticas</h2>
              <p className="text-gray-400">El panel de estadísticas estará disponible pronto...</p>
            </div>
          </div>
        )}
        {currentView === 'settings' && (
          <div className="h-full overflow-y-auto bg-[#102216] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#13ec5b] mb-6">Configuración</h2>
              <p className="text-gray-400">El panel de configuración estará disponible pronto...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;