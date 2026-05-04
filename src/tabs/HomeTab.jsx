import React, { useState } from 'react';
import {
  Sparkles, MapPin, Calendar, Navigation2,
  MoreHorizontal, Plus, Map, Trash2, X,
  ChevronRight, Send
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import CreateTripModal from '../components/CreateTripModal';

// ─── Modal de confirmação de exclusão ────────────────────────

function DeleteConfirmModal({ trip, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Danger zone visual */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />
        
        <div className="p-7">
          {/* Ícone */}
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <Trash2 size={24} className="text-red-500" />
          </div>

          <h3 className="text-[20px] font-black text-neutral-900 mb-1.5 tracking-tight">
            Excluir viagem?
          </h3>
          <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mb-1">
            Tens a certeza que queres excluir
          </p>
          <p className="text-[15px] font-bold text-neutral-800 mb-6">
            "{trip?.destination}, {trip?.country}"?
          </p>
          <p className="text-[12px] text-red-400 font-semibold bg-red-50 px-4 py-2.5 rounded-xl mb-7">
            ⚠️ Esta ação é permanente e não pode ser desfeita.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border-2 border-neutral-200 text-[14px] font-bold text-neutral-600 active:scale-[0.97] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-[14px] font-bold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 shadow-lg shadow-red-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={16} />
                  Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Menu de opções da viagem ─────────────────────────────────

function TripOptionsMenu({ onDelete, onClose }) {
  return (
    <div className="absolute top-14 right-5 z-[150] animate-in fade-in zoom-in-95 duration-150 origin-top-right">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-neutral-900/20 border border-neutral-100 overflow-hidden min-w-[180px]">
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition-colors text-[14px] font-bold"
        >
          <Trash2 size={16} />
          Excluir viagem
        </button>
        <div className="h-px bg-neutral-100" />
        <button
          onClick={onClose}
          className="w-full flex items-center gap-3 px-5 py-4 text-neutral-500 hover:bg-neutral-50 transition-colors text-[14px] font-semibold"
        >
          <X size={16} />
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────

export default function HomeTab() {
  const { user, activeTrip, setActiveTrip, setTrips, trips, tripsLoading } = useApp();
  const [showCreate, setShowCreate]       = useState(false);
  const [showMenu, setShowMenu]           = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [aiInput, setAiInput]             = useState('');

  const firstName = user?.displayName?.split(' ')[0] ?? 'Viajante';
  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const handleDeleteConfirm = async () => {
    if (!activeTrip) return;
    setDeleteLoading(true);
    try {
      // Importar dinamicamente para não quebrar se o serviço não tiver a função
      const { deleteTrip } = await import('../services/tripService');
      await deleteTrip(user.uid, activeTrip.id);
      setActiveTrip(null);
      setTrips((prev) => prev.filter((t) => t.id !== activeTrip.id));
    } catch (e) {
      console.error('Erro ao excluir viagem:', e);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col sm:max-w-md sm:mx-auto sm:shadow-2xl sm:min-h-[850px] sm:rounded-[2.5rem] sm:my-10 relative z-0 pb-[calc(7rem+env(safe-area-inset-bottom))]">

      {/* Ambient blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-blue-400/12 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-[20%] right-[-20%] w-[60%] h-[50%] bg-emerald-400/8 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-[#FAFAFA]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-neutral-100/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white shadow-sm border border-neutral-100 p-0.5">
            {user?.photoURL
              ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              : <div className="w-full h-full rounded-full flex items-center justify-center bg-neutral-900 text-white font-bold text-sm tracking-wider">
                  {firstName[0]}
                </div>
            }
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] leading-none mb-1">Bem-vindo,</p>
            <h1 className="text-[17px] font-extrabold text-neutral-900 leading-none">{firstName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-sm hover:bg-neutral-50 transition-colors">
            <Calendar size={17} strokeWidth={2.5} />
          </button>
          {activeTrip && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-sm hover:bg-neutral-50 transition-colors"
              >
                <MoreHorizontal size={17} strokeWidth={2.5} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-[140]" onClick={() => setShowMenu(false)} />
                  <TripOptionsMenu
                    onDelete={() => { setShowMenu(false); setShowDeleteModal(true); }}
                    onClose={() => setShowMenu(false)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="px-6 mt-4 relative z-10 flex-1 overflow-y-auto">

        {/* Loading */}
        {tripsLoading && (
          <section className="mb-8">
            <div className="w-full h-[320px] rounded-[2rem] bg-neutral-200/40 animate-pulse" />
            <div className="mt-4 h-14 rounded-2xl bg-neutral-100/60 animate-pulse" />
          </section>
        )}

        {/* Sem viagem */}
        {!tripsLoading && !activeTrip && (
          <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              onClick={() => setShowCreate(true)}
              className="relative w-full h-[320px] rounded-[2.5rem] overflow-hidden bg-white flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all border border-neutral-100 shadow-xl shadow-neutral-900/4 group"
            >
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50/60 via-transparent to-emerald-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Dashed ring */}
              <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-neutral-200 group-hover:border-blue-200 transition-colors duration-500 group-hover:rotate-[30deg] transition-transform duration-700" />

              <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-xl shadow-neutral-900/15 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
                <Plus size={30} className="text-white" />
              </div>
              <h2 className="text-[19px] font-black text-neutral-900 relative z-10 tracking-tight">Criar Nova Viagem</h2>
              <p className="text-neutral-400 text-[13px] mt-1.5 font-semibold relative z-10">Toque para planear o seu destino</p>

              <div className="absolute bottom-6 flex items-center gap-1.5 text-[11px] font-bold text-neutral-300 uppercase tracking-widest">
                <span>Começar</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </section>
        )}

        {/* Viagem ativa */}
        {!tripsLoading && activeTrip && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Hero card */}
            <section className="relative w-full h-[340px] rounded-[2.5rem] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.14)] mb-6 group cursor-pointer">
              <img
                src={activeTrip.coverImage}
                alt={activeTrip.destination}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-900/30 to-neutral-900/5" />

              {/* Top badges */}
              <div className="absolute top-5 right-5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)] animate-pulse" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{activeTrip.days} dias</span>
              </div>

              <div className="absolute top-5 left-5 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <Map size={13} className="text-white/80" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{activeTrip.country}</span>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 p-7 w-full">
                <p className="text-white/60 text-[12px] font-semibold mb-1 capitalize tracking-wide">{today}</p>
                <h2 className="text-[38px] leading-none font-black text-white tracking-tight mb-3">
                  {activeTrip.destination}
                </h2>
                {/* Progress bar */}
                {activeTrip.activities?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/80 rounded-full"
                        style={{
                          width: `${(activeTrip.activities.filter(a => a.status === 'past').length / activeTrip.activities.length) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white/60">
                      {activeTrip.activities.filter(a => a.status === 'past').length}/{activeTrip.activities.length}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* AI Input */}
            <section className="mb-8 relative z-20 -mt-10 px-3">
              <div className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/80 flex items-center gap-2 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.12)] focus-within:bg-white transition-all">
                <div className="w-11 h-11 bg-neutral-900 rounded-[0.9rem] flex items-center justify-center text-white shrink-0">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Pedir à IA para ajustar roteiro..."
                  className="w-full bg-transparent border-none px-3 text-[14px] font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none"
                />
                {aiInput.trim() && (
                  <button className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform">
                    <Send size={15} />
                  </button>
                )}
              </div>
            </section>

            {/* Timeline do dia */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6 px-1">
                <div>
                  <h3 className="text-[22px] font-black text-neutral-900 tracking-tight">O seu dia</h3>
                  <p className="text-[12px] text-neutral-400 font-semibold mt-0.5">
                    {activeTrip.activities?.length || 0} atividades programadas
                  </p>
                </div>
                <button className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[12px] font-bold text-neutral-700 flex items-center gap-1.5 transition-colors active:scale-95">
                  <Navigation2 size={13} /> Mapa
                </button>
              </div>

              <div className="relative px-2">
                <div className="absolute left-[27px] top-4 bottom-4 w-[1.5px] bg-gradient-to-b from-neutral-200 via-neutral-200/60 to-transparent rounded-full" />

                <div className="space-y-5 relative z-10">
                  {activeTrip?.activities && activeTrip.activities.length > 0 ? (
                    activeTrip.activities.map((item, index) => {
                      const isPast    = item.status === 'past';
                      const isCurrent = item.status === 'current';
                      const Icon      = item.icon || MapPin;

                      return (
                        <div
                          key={item.id || index}
                          className={`flex gap-5 transition-all duration-300 ${isPast ? 'opacity-40 hover:opacity-70' : ''}`}
                        >
                          {/* Hora + ícone */}
                          <div className="flex flex-col items-center w-[54px] shrink-0 pt-1">
                            <span className={`text-[11px] font-black mb-2 tabular-nums ${isCurrent ? 'text-neutral-900' : 'text-neutral-400'}`}>
                              {item.time}
                            </span>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-[3px] ring-4 ring-[#FAFAFA] transition-all ${
                              isCurrent
                                ? 'bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-neutral-900/25'
                                : isPast
                                  ? 'bg-neutral-100 border-neutral-200 text-neutral-400'
                                  : 'bg-white border-neutral-200 text-neutral-400'
                            }`}>
                              <Icon size={14} strokeWidth={isCurrent ? 2.5 : 2} />
                            </div>
                          </div>

                          {/* Card */}
                          <div className={`flex-1 rounded-2xl p-4 transition-all duration-300 ${
                            isCurrent
                              ? 'bg-white border border-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.07)] scale-[1.01]'
                              : 'bg-transparent hover:bg-white/60 border border-transparent'
                          }`}>
                            {isCurrent && item.highlight && (
                              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2.5">
                                {item.highlight}
                              </span>
                            )}
                            <h4 className={`font-bold leading-tight mb-0.5 ${isCurrent ? 'text-[16px] text-neutral-900' : 'text-[15px] text-neutral-700'}`}>
                              {item.title}
                            </h4>
                            <p className="text-[12px] font-semibold text-neutral-400">{item.type}</p>
                            {isCurrent && (
                              <div className="flex gap-2 mt-4">
                                <button className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-bold py-3 rounded-xl transition-colors active:scale-[0.97]">
                                  Ver detalhes
                                </button>
                                <button className="w-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center rounded-xl transition-colors active:scale-[0.97]">
                                  <MoreHorizontal size={17} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar size={22} className="text-neutral-300" />
                      </div>
                      <p className="text-[15px] font-bold text-neutral-900 mb-1">Dia livre!</p>
                      <p className="text-[13px] text-neutral-400 font-medium">Nenhuma atividade planeada para hoje.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Modals */}
      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} />}
      {showDeleteModal && (
        <DeleteConfirmModal
          trip={activeTrip}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
