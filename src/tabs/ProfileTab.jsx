import React, { useState } from 'react';
import {
  Accessibility, Bell, Shield, CreditCard,
  ChevronRight, LogOut, Moon, Globe, Loader2, Camera
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { logout } from '../services/authService';

// Paleta de cores tonais (Estilo Material Design / Universal)
const SETTINGS_SECTIONS = [
  {
    title: 'Preferências de Viagem',
    items: [
      { icon: Accessibility, label: 'Filtro de Acessibilidade', toggle: true, key: 'accessibility', color: 'bg-blue-100 text-blue-700' },
      { icon: Globe,         label: 'Idioma',                   value: 'Português',               color: 'bg-emerald-100 text-emerald-700' },
    ],
  },
  {
    title: 'Aplicação',
    items: [
      { icon: Moon,  label: 'Modo Escuro',  toggle: true, key: 'darkMode',      color: 'bg-indigo-100 text-indigo-700' },
      { icon: Bell,  label: 'Notificações', toggle: true, key: 'notifications', color: 'bg-rose-100 text-rose-700' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { icon: CreditCard, label: 'Plano Premium', value: 'Grátis', badge: true, color: 'bg-amber-100 text-amber-700' },
      { icon: Shield,     label: 'Privacidade e Segurança',                     color: 'bg-slate-200 text-slate-700' },
    ],
  },
];

function SettingRow({ item, toggles, onToggle }) {
  const { icon: Icon, label, toggle, key, value, badge, color } = item;
  
  return (
    <div className="flex items-center justify-between py-4 group cursor-pointer active:bg-slate-50 transition-colors px-4 -mx-4 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color || 'bg-slate-100 text-slate-500'}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="font-semibold text-[15px] text-slate-800">{label}</span>
      </div>
      
      {toggle ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(key); }}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${toggles[key] ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${toggles[key] ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      ) : value ? (
        <div className="flex items-center gap-2">
          {badge
            ? <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wide">{value}</span>
            : <span className="text-[14px] font-medium text-slate-500">{value}</span>
          }
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      ) : (
        <ChevronRight size={18} className="text-slate-400" />
      )}
    </div>
  );
}

export default function ProfileTab() {
  const { user, trips } = useApp();
  const [toggles, setToggles] = useState({ accessibility: true, darkMode: false, notifications: true });
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleToggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = async () => {
    setLogoutLoading(true);
    await logout();
    setLogoutLoading(false);
  };

  const firstName = user?.displayName?.split(' ')[0] ?? 'Viajante';
  const fullName  = user?.displayName ?? 'Viajante';
  
  const safeTrips = trips || [];
  const totalDays = safeTrips.reduce((s, t) => s + (t.days ?? 0), 0);
  const countries = new Set(safeTrips.map((t) => t.country).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col sm:max-w-md sm:mx-auto sm:shadow-2xl sm:min-h-[850px] sm:rounded-3xl sm:my-10 relative overflow-hidden pb-24">
      
      {/* Header e Espaçamento Seguro */}
      <div className="pt-12 pb-2 px-6 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Perfil</h2>
      </div>

      <main className="flex-1 px-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Avatar e Informações (Estilo Universal) */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-slate-200 border-4 border-white shadow-sm relative group cursor-pointer">
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Camera size={24} className="text-white" />
            </div>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-600">
                <span className="text-white font-bold text-3xl">{firstName[0]}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
          <p className="text-[14px] font-medium text-slate-500 mt-0.5">{user?.email || 'Acesso ativo'}</p>
        </div>

        {/* Estatísticas de Viagem */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: 'Viagens', value: safeTrips.length },
                { label: 'Países',  value: countries    },
                { label: 'Dias',    value: totalDays    },
              ].map(({ label, value }) => (
                <div key={label} className="text-center px-2 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-slate-800 mb-1">{value}</p>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secções de Definições */}
        <div className="space-y-6">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[12px] font-bold text-blue-600 mb-2 px-1">
                {section.title}
              </p>
              <div className="bg-white rounded-2xl px-5 py-2 shadow-sm border border-slate-100 divide-y divide-slate-50">
                {section.items.map((item) => (
                  <SettingRow key={item.label} item={item} toggles={toggles} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Logout */}
        <div className="mt-8 mb-6">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[15px] transition-colors disabled:opacity-60"
          >
            {logoutLoading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            Terminar Sessão
          </button>
        </div>

      </main>
    </div>
  );
}