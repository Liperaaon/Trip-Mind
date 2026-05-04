import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, Clock, Plus, Coffee, Camera, Utensils, Hotel, 
  Loader2, Trash2, CalendarCheck, Map, MoreVertical, Edit3, AlignLeft, Info 
} from 'lucide-react';

// --- AVISO DE COMPILAÇÃO DA PLATAFORMA ---
// No seu projeto real (no VS Code), APAGUE as constantes simuladas abaixo
// e DESCOMENTE as importações reais:
//
// import { useApp } from '../context/AppContext';
// import { getActivities, toggleActivity, addActivity, updateActivity, deleteActivity } from '../services/tripService';

const useApp = () => ({
  user: { uid: '123' },
  activeTrip: { id: 't1', destination: 'Paris', country: 'França', days: 3 }
});
const getActivities = async () => [
  { id: 1, title: 'Torre Eiffel', day: 1, time: '09:00', duration: '2 horas', category: 'photo', location: 'Champ de Mars, 5 Av. Anatole France', notes: 'Comprar bilhetes para o elevador até ao topo.', done: true },
  { id: 2, title: 'Almoço no Café de Flore', day: 1, time: '12:30', duration: '1.5 horas', category: 'food', done: false }
];
const toggleActivity = async () => {};
const addActivity = async () => Math.random().toString();
const updateActivity = async () => {};
const deleteActivity = async () => {};
// -----------------------------------------

const CATEGORY_ICONS = {
  food:    { Icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  photo:   { Icon: Camera,   color: 'bg-purple-100 text-purple-600' },
  cafe:    { Icon: Coffee,   color: 'bg-amber-100 text-amber-600'   },
  hotel:   { Icon: Hotel,    color: 'bg-blue-100 text-blue-600'    },
  default: { Icon: MapPin,   color: 'bg-slate-200 text-slate-600'   },
};

const CATEGORIES = [
  { key: 'food', label: 'Refeição' },
  { key: 'photo', label: 'Atração' },
  { key: 'cafe', label: 'Café' },
  { key: 'hotel', label: 'Hospedagem' },
  { key: 'default', label: 'Outro' },
];

// ─── Activity Card ────────────────────────────────────────────

function ActivityCard({ activity, onToggle, onEdit, onDelete }) {
  const { Icon, color } = CATEGORY_ICONS[activity.category] || CATEGORY_ICONS.default;
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className={`relative group flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${
      activity.done 
        ? 'bg-slate-50 border-slate-100 opacity-70 scale-[0.98]' 
        : 'bg-white border-slate-100 shadow-sm'
    }`}>
      {/* Ícone da Categoria */}
      <div className={`w-12 h-12 mt-0.5 rounded-[1rem] flex items-center justify-center shrink-0 transition-colors ${
        activity.done ? 'bg-slate-200 text-slate-400' : color
      }`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>

      {/* Detalhes Principais */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`font-bold text-[16px] transition-all pr-2 ${
            activity.done ? 'line-through text-slate-400' : 'text-slate-800'
          }`}>
            {activity.title}
          </h4>
          
          {/* Botão de Menu (Opções) */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 -mt-1 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-100 shadow-xl rounded-xl py-1.5 z-20 animate-in fade-in zoom-in-95">
                  <button 
                    onClick={() => { setShowMenu(false); onEdit(activity); }} 
                    className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Edit3 size={16} className="text-slate-400" /> Editar
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button 
                    onClick={() => { setShowMenu(false); onDelete(activity.id); }} 
                    className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <Trash2 size={16} className="text-red-500" /> Apagar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Informações de Tempo */}
        <div className="flex items-center gap-2 mt-1 mb-2">
          <Clock size={12} className={activity.done ? 'text-slate-300' : 'text-slate-400'} />
          <span className={`text-[12px] font-bold ${activity.done ? 'text-slate-400' : 'text-blue-600'}`}>
            {activity.time}
          </span>
          {activity.duration && (
            <>
              <span className="text-slate-300">•</span>
              <span className={`text-[12px] font-medium ${activity.done ? 'text-slate-400' : 'text-slate-500'}`}>
                {activity.duration}
              </span>
            </>
          )}
        </div>

        {/* Localização e Anotações Adicionais */}
        {(activity.location || activity.notes) && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {activity.location && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span className={`text-[13px] font-medium leading-snug ${activity.done ? 'text-slate-400' : 'text-slate-600'}`}>
                  {activity.location}
                </span>
              </div>
            )}
            {activity.notes && (
              <div className="flex items-start gap-2">
                <AlignLeft size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span className={`text-[13px] font-medium leading-snug ${activity.done ? 'text-slate-400' : 'text-slate-500'}`}>
                  {activity.notes}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkbox Concluir */}
      <div className="flex flex-col items-end justify-start h-full pt-1">
        <button
          onClick={() => onToggle(activity.id, !activity.done)}
          className={`w-7 h-7 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300 active:scale-90 ${
            activity.done 
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30' 
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {activity.done && (
            <svg width="12" height="10" viewBox="0 0 10 8" fill="none" className="animate-in zoom-in duration-200">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Add/Edit Activity Form ────────────────────────────────────

function AddActivityForm({ onSave, onCancel, totalDays, initialData }) {
  const [form, setForm] = useState(initialData ? {
    ...initialData,
    day: initialData.day.toString(),
    duration: initialData.duration || '',
    location: initialData.location || '',
    notes: initialData.notes || ''
  } : { 
    title: '', day: '1', time: '09:00', category: 'default', 
    duration: '', location: '', notes: '' 
  });
  
  // Se estiver a editar uma atividade que já tem detalhes, abre as opções avançadas
  const [showMoreOpts, setShowMoreOpts] = useState(!!(initialData?.duration || initialData?.location || initialData?.notes));

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5 mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-[16px]">
          {initialData ? 'Editar Atividade' : 'Nova Atividade'}
        </h3>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="O que vai fazer? (ex: Museu do Louvre) *"
          value={form.title}
          onChange={set('title')}
          autoFocus
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-[15px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dia da Viagem</p>
            <select value={form.day} onChange={set('day')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              {Array.from({ length: totalDays }, (_, i) => (
                <option key={i+1} value={i+1}>Dia {i+1}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Horário</p>
            <input type="time" value={form.time} onChange={set('time')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setForm((p) => ({ ...p, category: key }))}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${
                  form.category === key 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes Adicionais Ocultos por Padrão */}
        {!showMoreOpts ? (
          <button 
            onClick={() => setShowMoreOpts(true)}
            className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
          >
            <Info size={16} /> Adicionar detalhes (Local e Notas)
          </button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16}/></div>
              <input
                type="text"
                placeholder="Duração estimada (ex: 2 horas)"
                value={form.duration}
                onChange={set('duration')}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={16}/></div>
              <input
                type="text"
                placeholder="Local / Morada (Opcional)"
                value={form.location}
                onChange={set('location')}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-4 text-slate-400"><AlignLeft size={16}/></div>
              <textarea
                placeholder="Anotações, lembretes ou links..."
                value={form.notes}
                onChange={set('notes')}
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 text-[14px] font-bold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all">Cancelar</button>
          <button
            onClick={() => form.title.trim() && onSave(form)}
            className={`flex-1 py-3.5 rounded-2xl text-[14px] font-bold text-white shadow-md active:scale-[0.98] transition-all ${
              form.title.trim() ? 'bg-slate-900' : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {initialData ? 'Atualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

const ItineraryTab = () => {
  const { user, activeTrip } = useApp();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeDay, setActiveDay]   = useState(1);
  
  // Controlo do formulário (Criar / Editar)
  const [showForm, setShowForm]     = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  
  const formRef = useRef(null);

  const totalDays = activeTrip?.days ?? 1;

  const load = useCallback(async () => {
    if (!user || !activeTrip) return;
    setLoading(true);
    const data = await getActivities(user.uid, activeTrip.id);
    setActivities(data);
    setLoading(false);
  }, [user, activeTrip]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (actId, done) => {
    setActivities((prev) => prev.map((a) => a.id === actId ? { ...a, done } : a));
    await toggleActivity(user.uid, activeTrip.id, actId, done);
  };

  const handleDelete = async (actId) => {
    if(window.confirm('Tem a certeza que deseja apagar esta atividade?')){
      setActivities((prev) => prev.filter((a) => a.id !== actId));
      await deleteActivity(user.uid, activeTrip.id, actId);
    }
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    // Faz o scroll suave até ao topo onde o formulário vai aparecer
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSave = async (form) => {
    const processedForm = {
      ...form,
      title: form.title.trim(),
      day: parseInt(form.day),
      location: form.location.trim(),
      notes: form.notes.trim()
    };

    if (editingActivity) {
      // Atualizar atividade existente
      setActivities((prev) => prev.map((a) => a.id === editingActivity.id ? { ...a, ...processedForm } : a));
      await updateActivity(user.uid, activeTrip.id, editingActivity.id, processedForm);
    } else {
      // Adicionar nova atividade
      const id = await addActivity(user.uid, activeTrip.id, processedForm);
      setActivities((prev) => [...prev, { id, ...processedForm, done: false }]);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const dayActivities  = activities.filter((a) => a.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));
  const doneCount      = dayActivities.filter((a) => a.done).length;
  const progress       = dayActivities.length ? (doneCount / dayActivities.length) * 100 : 0;

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col sm:max-w-md sm:mx-auto pt-14 px-6 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">Roteiro</p>
          <h1 className="text-2xl font-bold text-slate-900">Planeador</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm">
            <Map size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sem viagem ativa</h2>
          <p className="text-[14px] text-slate-500 font-medium px-4">
            Crie uma nova viagem no ecrã inicial para começar a planear o seu roteiro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col sm:max-w-md sm:mx-auto sm:shadow-2xl sm:min-h-[850px] sm:rounded-3xl sm:my-10 relative overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))]">
      
      {/* Header Fixo Premium */}
      <header className="pt-12 pb-4 px-6 bg-slate-50 sticky top-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">Roteiro</p>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{activeTrip.destination} 🗺️</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">{activeTrip.days} dias · {activeTrip.country}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Referência Invisível para Scroll ao Editar */}
        <div ref={formRef} className="absolute top-0" />

        {/* Seletor de dias em "Pílulas" */}
        <div className="px-6 mb-6 mt-2">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-[14px] transition-all duration-200 active:scale-95 ${
                  activeDay === day 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Dia {day}
              </button>
            ))}
          </div>
        </div>

        {/* Cartão de Progresso do Dia */}
        <div className="px-6 mb-8">
          <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CalendarCheck size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-bold text-slate-800">Progresso do Dia</span>
              </div>
              <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {doneCount} de {dayActivities.length}
              </span>
            </div>
            
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Efeito de brilho na barra de progresso */}
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Atividades */}
        <div className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[18px] font-bold text-slate-800">Cronograma</h3>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-[14px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all bg-blue-50 px-3 py-1.5 rounded-xl"
              >
                <Plus size={16} strokeWidth={2.5} /> Adicionar
              </button>
            )}
          </div>

          {showForm && (
            <AddActivityForm 
              onSave={handleSave} 
              onCancel={closeForm} 
              totalDays={totalDays} 
              initialData={editingActivity} 
            />
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : dayActivities.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {dayActivities.map((a) => (
                <ActivityCard 
                  key={a.id} 
                  activity={a} 
                  onToggle={handleToggle} 
                  onEdit={handleEditClick}
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-2 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee size={24} className="text-slate-400" />
                </div>
                <h3 className="text-[16px] font-bold text-slate-800 mb-1">Dia livre!</h3>
                <p className="text-[13px] text-slate-500 font-medium">
                  Não tem planos para o Dia {activeDay}. Toque em "Adicionar" para preencher o seu roteiro.
                </p>
              </div>
            )
          )}
        </div>
      </main>
      
      {/* CSS extra para animação de brilho na barra de progresso */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ItineraryTab;