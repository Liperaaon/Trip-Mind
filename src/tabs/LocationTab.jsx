import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation2, Layers, Crosshair } from 'lucide-react';

// --- ÍCONES CUSTOMIZADOS ---

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
      <div style="position:absolute;inset:0;background:rgba(59,130,246,0.4);border-radius:9999px;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;transform:scale(1.5);"></div>
      <div style="width:20px;height:20px;background:#2563EB;border:2px solid white;border-radius:9999px;box-shadow:0 4px 6px rgba(0,0,0,.2);position:relative;z-index:10;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// BUGFIX: iconSize não aceita 'auto' — usa [120, 40] e ancoragem centralizada
const placeIcon = (name) =>
  L.divIcon({
    className: 'custom-place-icon',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:white;padding:4px 12px;border-radius:9999px;border:1px solid #E2E8F0;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,.12);">
          <div style="width:8px;height:8px;border-radius:9999px;background:#1E293B;"></div>
          <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:-0.03em;color:#1E293B;white-space:nowrap;">${name}</span>
        </div>
        <div style="width:1px;height:8px;background:white;"></div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [60, 40],
  });

// --- CONTROLADOR DE CÂMERA ---

const LocationController = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 });

    const onFound = (e) => {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, 15, { duration: 2, easeLinearity: 0.25 });
    };
    const onError = (e) => {
      console.warn('Geolocation error:', e.message);
    };

    map.on('locationfound', onFound);
    map.on('locationerror', onError);

    return () => {
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
    };
  }, [map, onLocationFound]);

  return null;
};

// --- PONTOS DE INTERESSE (mock — futuramente de API) ---

const POIS = [
  { id: 1, name: 'Grand-Place',           lat: 50.8467, lng: 4.3525 },
  { id: 2, name: 'Atomium',               lat: 50.8949, lng: 4.3415 },
  { id: 3, name: 'Parc du Cinquantenaire',lat: 50.8404, lng: 4.3928 },
];

const DEFAULT_CENTER = [50.8466, 4.3528];

// --- COMPONENTE PRINCIPAL ---

const LocationTab = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [mapRef, setMapRef]             = useState(null);
  const [query, setQuery]               = useState('');

  const handleLocationFound = useCallback((latlng) => setUserPosition(latlng), []);

  const handleManualLocate = () => {
    if (mapRef) mapRef.locate({ setView: false, maxZoom: 16 });
  };

  const filteredPois = POIS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative h-screen w-full bg-[#E5E7EB] animate-in fade-in duration-500">

      {/* MAPA */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
          ref={setMapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            maxZoom={20}
          />

          <LocationController onLocationFound={handleLocationFound} />

          {userPosition && <Marker position={userPosition} icon={userIcon} />}

          {filteredPois.map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lng]}
              icon={placeIcon(poi.name)}
            />
          ))}
        </MapContainer>
      </div>

      {/* SEARCH BAR */}
      <div className="absolute top-12 left-0 right-0 px-4 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-3 flex items-center gap-3">
            <Search size={20} className="text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar lugares..."
              className="bg-transparent flex-1 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* CONTROLES LATERAIS */}
      <div className="absolute right-4 top-1/3 flex flex-col gap-3 z-[1000]">
        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-slate-600 border border-white/20 active:scale-90 transition-all hover:text-blue-600">
          <Layers size={20} />
        </button>
        <button
          onClick={handleManualLocate}
          className="w-12 h-12 bg-[#2563EB] rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center text-white active:scale-90 transition-all"
          aria-label="Centralizar no meu local"
        >
          <Crosshair size={22} />
        </button>
      </div>

      {/* BOTTOM SHEET */}
      <div className="absolute bottom-32 left-0 right-0 px-4 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 pointer-events-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-800 text-xl font-bold">Explorar</h3>
            <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg">
              {userPosition ? 'GPS Ativo' : 'Obtendo GPS…'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            {filteredPois.length} {filteredPois.length === 1 ? 'lugar encontrado' : 'lugares encontrados'} na área.
          </p>
          <button className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform">
            <Navigation2 size={18} />
            Iniciar Roteiro
          </button>
        </div>
      </div>

      <style>{`
        .leaflet-control-container { display: none !important; }
        .custom-place-icon { background: transparent !important; border: none !important; }
        .custom-user-icon  { background: transparent !important; border: none !important; }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LocationTab;
