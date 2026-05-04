import React, { useState } from 'react';
import { MapPin, Star, Calendar, Search, X, Globe2, Map, Plane, Loader2 } from 'lucide-react';


import { useApp } from '../context/AppContext';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';

// ─── Componente do Cartão de Viagem ───────────────────────────
const TripHistoryCard = ({ trip }) => {
  const destination = trip.destination || trip.city || 'Destino';
  const image = trip.coverImage || trip.image || DEFAULT_IMAGE;
  const rating = trip.rating || 5;
  const highlights = trip.highlights || []; 
  
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer active:scale-[0.98] transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={image} 
          alt={destination} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-[12px] font-bold text-slate-800">{rating}.0</span>
        </div>
        
        {(trip.dates || trip.createdAt) && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white">
            <Calendar size={14} className="text-white/90" />
            <span className="text-[13px] font-semibold text-white shadow-sm">
              {trip.dates || new Date(trip.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-lg leading-tight">{destination}</h4>
            <div className="flex items-center gap-1 text-slate-500 text-[13px] mt-1 font-medium">
              <MapPin size={14} />
              <span>{trip.country || 'País'}</span>
            </div>
          </div>
          {trip.days && (
            <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <span className="text-[13px] font-bold">{trip.days} dias</span>
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
            {highlights.map((h) => (
              <span
                key={h}
                className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────
export default function HistoryTab() {
  const { trips, tripsLoading } = useApp();
  const [query, setQuery] = useState('');

  const safeTrips = trips || [];

  const filtered = safeTrips.filter(
    (t) =>
      (t.destination || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.country || '').toLowerCase().includes(query.toLowerCase())
  );

  const totalCountries = new Set(safeTrips.map((t) => t.country).filter(Boolean)).size;
  const totalDays = safeTrips.reduce((sum, t) => sum + (t.days || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col sm:max-w-md sm:mx-auto sm:shadow-2xl sm:min-h-[850px] sm:rounded-3xl sm:my-10 relative overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))]">
      
      <header className="pt-12 pb-4 px-6 bg-slate-50 sticky top-0 z-20">
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">Memórias</p>
        <h1 className="text-2xl font-bold text-slate-900">As Minhas Viagens</h1>
      </header>

      <main className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <div className="px-6 mb-8 mt-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: 'Viagens',  value: safeTrips.length, icon: Plane },
                { label: 'Países',   value: totalCountries, icon: Globe2 },
                { label: 'Dias',     value: totalDays, icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center px-2 flex flex-col items-center justify-center group">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-xl font-bold text-slate-800 mb-0.5">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 mb-8 sticky top-0 z-10 py-1 bg-slate-50/95 backdrop-blur-sm">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar cidade ou país..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-10 text-[15px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="px-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[16px] font-bold text-slate-800">
              {query ? 'Resultados da pesquisa' : 'Todas as viagens'}
            </h3>
            <span className="text-[13px] font-bold text-slate-400">
              {filtered.length} {filtered.length === 1 ? 'viagem' : 'viagens'}
            </span>
          </div>

          {tripsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
              <p className="text-[14px] text-slate-500 font-medium">A carregar memórias...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-6">
              {filtered.map((trip) => (
                <TripHistoryCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map size={24} className="text-slate-400" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800 mb-1">
                {query ? 'Nenhum resultado' : 'Ainda sem viagens'}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium px-4">
                {query 
                  ? `Não encontrámos nenhuma viagem com o termo "${query}".`
                  : 'Comece a planear no ecrã inicial para que as suas viagens apareçam aqui.'
                }
              </p>
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="mt-6 text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}