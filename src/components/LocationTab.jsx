import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  Navigation2, 
  Layers, 
  Map as MapIcon,
  Crosshair
} from 'lucide-react';

// --- CONFIGURAÇÃO DE ÍCONES CUSTOMIZADOS (DESIGN PREMIUM) ---

// Ícone pulsante para a localização do utilizador
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute inset-0 bg-blue-500/40 rounded-full animate-ping scale-[1.5]"></div>
      <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg relative z-10"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Ícone minimalista para os pontos turísticos
const placeIcon = (name) => L.divIcon({
  className: 'custom-place-icon',
  html: `
    <div class="flex flex-col items-center drop-shadow-md">
      <div class="bg-white px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-slate-800"></div>
        <span class="text-[10px] font-black uppercase tracking-tighter text-slate-800 whitespace-nowrap">${name}</span>
      </div>
      <div class="w-0.5 h-2 bg-white"></div>
    </div>
  `,
  iconSize: [auto, 40],
  iconAnchor: [50, 40], // Ajuste centralizado
});

// --- COMPONENTE CONTROLADOR DE CÂMERA ---
// Este componente fica invisível no mapa, mas controla a API de geolocalização
const LocationController = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 });

    map.on('locationfound', function (e) {
      onLocationFound(e.latlng);
      // Voo suave da câmera até a localização do utilizador
      map.flyTo(e.latlng, 15, {
        duration: 2,
        easeLinearity: 0.25
      });
    });

    map.on('locationerror', function (e) {
      console.warn("Erro de geolocalização:", e.message);
      alert("Não foi possível acessar sua localização. Verifique as permissões do navegador.");
    });
  }, [map, onLocationFound]);

  return null;
};

const LocationTab = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  // Coordenadas iniciais (Bruxelas)
  const defaultCenter = [50.8466, 4.3528];

  const pointsOfInterest = [
    { id: 1, name: "Grand-Place", lat: 50.8467, lng: 4.3525 },
    { id: 2, name: "Atomium", lat: 50.8949, lng: 4.3415 },
    { id: 3, name: "Parc du Cinquantenaire", lat: 50.8404, lng: 4.3928 },
  ];

  const handleManualLocate = () => {
    if (mapRef) {
      mapRef.locate();
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#E5E7EB] animate-in fade-in duration-500">
      
      {/* MAPA REAL (LEAFLET) */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          zoomControl={false} // Removemos o controle padrão feio
          className="w-full h-full"
          ref={setMapRef}
        >
          {/* Base do mapa estilo "Apple Maps" (CartoDB Voyager) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={20}
          />

          <LocationController onLocationFound={setUserPosition} />

          {/* Renderização do utilizador */}
          {userPosition && (
            <Marker position={userPosition} icon={userIcon} />
          )}

          {/* Renderização dos pontos turísticos reais */}
          {pointsOfInterest.map((poi) => (
            <Marker 
              key={poi.id} 
              position={[poi.lat, poi.lng]} 
              icon={placeIcon(poi.name)} 
            />
          ))}
        </MapContainer>
      </div>

      {/* OVERLAY: BARRA DE PESQUISA SUPERIOR */}
      <div className="absolute top-12 left-0 right-0 px-4 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-3 flex items-center gap-3">
            <Search size={20} className="text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="Pesquisar lugares..." 
              className="bg-transparent flex-1 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* OVERLAY: CONTROLES FLUTUANTES DIRETOS */}
      <div className="absolute right-4 top-1/3 flex flex-col gap-3 z-[1000]">
        <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-slate-600 border border-white/20 active:scale-90 transition-all pointer-events-auto hover:text-blue-600">
          <Layers size={20} />
        </button>
        
        {/* BOTÃO DE GEOLOCALIZAÇÃO MANUAL */}
        <button 
          onClick={handleManualLocate}
          className="w-12 h-12 bg-[#2563EB] rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center text-white active:scale-90 transition-all pointer-events-auto"
        >
          <Crosshair size={22} />
        </button>
      </div>

      {/* OVERLAY: BOTTOM SHEET MINIMALISTA */}
      <div className="absolute bottom-32 left-0 right-0 px-4 z-[1000] pointer-events-none">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 pointer-events-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-800 text-xl font-bold">Explorar</h3>
            <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg">GPS Ativo</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">A inteligência do app ajusta o mapa conforme você se move.</p>

          <button className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform">
            <Navigation2 size={18} />
            Iniciar Roteiro
          </button>
        </div>
      </div>

      {/* ESTILOS PARA CORRIGIR BUGS DE RENDERIZAÇÃO DO LEAFLET E CUSTOM ICONS */}
      <style>{`
        .leaflet-control-container { display: none !important; }
        .custom-place-icon { background: transparent; border: none; }
        .custom-user-icon { background: transparent; border: none; }
      `}</style>
    </div>
  );
};

export default LocationTab;