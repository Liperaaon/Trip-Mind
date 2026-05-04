import React from 'react';
import { Compass, MapPin, Plus, Clock, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     Icon: Compass, label: 'Home' },
  { id: 'location', Icon: MapPin,  label: 'Mapa' },
  { id: 'add',      Icon: Plus,    label: 'Adicionar' }, // Melhor usar um ID para mapear corretamente
  { id: 'history',  Icon: Clock,   label: 'Histórico' },
  { id: 'profile',  Icon: User,    label: 'Perfil' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  // Ajustamos o bottom para 0 e usamos padding com safe-area para respeitar a barra de gestos do telemóvel
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 flex justify-center pointer-events-none bg-gradient-to-t from-slate-950/50 to-transparent">
      {/* Adicionado select-none, touch-manipulation e anti-tap-highlight para um feeling 100% nativo */}
      <nav className="pointer-events-auto w-full max-w-[400px] bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none [-webkit-tap-highlight-color:transparent] touch-manipulation">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isAddBtn = id === 'add';
          const isActive = activeTab === id;

          // Renderização do botão central (Adicionar)
          if (isAddBtn) {
            return (
              <button
                key={id}
                onClick={() => onTabChange('itinerary')}
                className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all duration-200 active:bg-blue-700 active:scale-95 mx-1"
                aria-label="Novo item"
              >
                <Plus 
                  size={30} 
                  strokeWidth={2.5} 
                  className="transition-transform duration-300 group-hover:rotate-90" 
                />
              </button>
            );
          }

          // Renderização dos botões normais
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative w-12 h-14 flex flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}
              aria-label={label}
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                />
                
                {/* Ponto indicador de ativo (animado) */}
                <span 
                  className={`absolute bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} 
                />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}