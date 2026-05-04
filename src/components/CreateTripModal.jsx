import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, MapPin, Calendar, Wallet, ChevronRight, ChevronLeft,
  Loader2, Sparkles, Plus, Trash2, Globe, Search, Check
} from 'lucide-react';
import { createTrip } from '../services/tripService';
import { useApp } from '../context/AppContext';

// ─── Constantes ───────────────────────────────────────────────

const STEPS = ['Continente', 'Destinos', 'Datas', 'Orçamento'];

const CONTINENTS = [
  { id: 'europe',       label: 'Europa',        emoji: '🏰', color: 'bg-blue-50   border-blue-200   text-blue-700'   },
  { id: 'america_n',    label: 'América do Norte', emoji: '🗽', color: 'bg-green-50  border-green-200  text-green-700'  },
  { id: 'america_s',    label: 'América do Sul',   emoji: '🌿', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'asia',         label: 'Ásia',           emoji: '🏯', color: 'bg-rose-50   border-rose-200   text-rose-700'   },
  { id: 'africa',       label: 'África',         emoji: '🦁', color: 'bg-amber-50  border-amber-200  text-amber-700'  },
  { id: 'oceania',      label: 'Oceania',        emoji: '🦘', color: 'bg-cyan-50   border-cyan-200   text-cyan-700'   },
  { id: 'middle_east',  label: 'Oriente Médio',  emoji: '🕌', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

// Restrição de busca por continente (countrycodes para Nominatim)
const CONTINENT_COUNTRIES = {
  europe:      'ad,al,at,ba,be,bg,by,ch,cy,cz,de,dk,ee,es,fi,fr,gb,gr,hr,hu,ie,is,it,li,lt,lu,lv,mc,md,me,mk,mt,nl,no,pl,pt,ro,rs,ru,se,si,sk,sm,ua,va,xk',
  america_n:   'us,ca,mx,gt,bz,hn,sv,ni,cr,pa,cu,jm,ht,do,pr,tt,bb,lc,vc,gd,ag,kn,dm',
  america_s:   'br,ar,cl,co,pe,ve,ec,bo,py,uy,sr,gy,gf',
  asia:        'cn,jp,kr,in,id,th,vn,ph,my,sg,tw,hk,mo,kh,la,mm,bd,pk,lk,np,bt',
  africa:      'za,ng,eg,ke,ma,gh,et,tz,ug,sn,cm,ci,ml,bf,ne,sd,dz,tn,ly,mz,zw,zm,bw,na,rw',
  oceania:     'au,nz,fj,pg,sb,vu,ws,to,ki,fm,mh,pw,nr,tv',
  middle_east: 'ae,sa,il,tr,ir,iq,jo,lb,kw,qa,bh,om,ye,sy',
};

const COVER_IMAGES = {
  default:  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  paris:    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
  tokyo:    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  lisboa:   'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800&q=80',
  nyc:      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  rome:     'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  barcelona:'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  london:   'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  dubai:    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  sydney:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
};

function pickCover(destination) {
  if (!destination) return COVER_IMAGES.default;
  const d = destination.toLowerCase();
  if (d.includes('paris'))     return COVER_IMAGES.paris;
  if (d.includes('tokyo') || d.includes('tóquio')) return COVER_IMAGES.tokyo;
  if (d.includes('lisboa') || d.includes('lisbon')) return COVER_IMAGES.lisboa;
  if (d.includes('new york') || d.includes('nova york')) return COVER_IMAGES.nyc;
  if (d.includes('roma') || d.includes('rome'))   return COVER_IMAGES.rome;
  if (d.includes('barcelona'))  return COVER_IMAGES.barcelona;
  if (d.includes('london') || d.includes('londres')) return COVER_IMAGES.london;
  if (d.includes('dubai'))      return COVER_IMAGES.dubai;
  if (d.includes('sydney'))     return COVER_IMAGES.sydney;
  return COVER_IMAGES.default;
}

function dateDiff(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── CitySearch — autocomplete com Nominatim ─────────────────

function CitySearch({ continentId, onSelect, placeholder = 'Buscar cidade...' }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const debounceRef             = useRef(null);
  const wrapRef                 = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const cc = CONTINENT_COUNTRIES[continentId] || '';
      const params = new URLSearchParams({
        q,
        format: 'json',
        limit: '6',
        featuretype: 'city',
        addressdetails: '1',
        'accept-language': 'pt',
      });
      if (cc) params.set('countrycodes', cc);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });
      const data = await res.json();
      // Filtra só cidades/vilas/municípios
      const cities = data.filter(r =>
        ['city','town','village','municipality','administrative'].includes(r.type) ||
        r.class === 'place'
      );
      setResults(cities);
      setOpen(cities.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [continentId]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (item) => {
    const city    = item.address?.city || item.address?.town || item.address?.village || item.name;
    const country = item.address?.country || '';
    setQuery(city);
    setOpen(false);
    onSelect({ city, country, lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          {results.map((item, i) => {
            const city    = item.address?.city || item.address?.town || item.address?.village || item.name;
            const country = item.address?.country || '';
            const region  = item.address?.state || item.address?.county || '';
            return (
              <button
                key={i}
                onMouseDown={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-[#2563EB]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">{city}</p>
                  <p className="text-xs text-slate-400 truncate">{region}{region && country ? ' · ' : ''}{country}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────

export default function CreateTripModal({ onClose }) {
  const { user, reloadTrips } = useApp();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Continente selecionado
  const [continent, setContinent] = useState(null);

  // Lista de destinos [{city, country, lat, lng}]
  const [destinations, setDestinations] = useState([]);

  // Datas e orçamento
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [budget, setBudget]       = useState('');
  const [currency, setCurrency]   = useState('EUR');

  const days = dateDiff(startDate, endDate);
  const firstDest = destinations[0];
  const coverImage = firstDest ? pickCover(firstDest.city) : COVER_IMAGES.default;
  const heroTitle  = destinations.length === 0
    ? 'Para onde?'
    : destinations.length === 1
      ? firstDest.city
      : `${firstDest.city} +${destinations.length - 1}`;

  // Validações por step
  const canNext = [
    !!continent,
    destinations.length >= 1,
    startDate && endDate && days > 0,
    true,
  ];

  const addDestination = (item) => {
    if (!destinations.find(d => d.city.toLowerCase() === item.city.toLowerCase())) {
      setDestinations(prev => [...prev, item]);
    }
  };

  const removeDestination = (city) => {
    setDestinations(prev => prev.filter(d => d.city !== city));
  };

  const next = () => {
    if (!canNext[step]) {
      const msgs = [
        'Selecione um continente.',
        'Adicione pelo menos um destino.',
        'Selecione datas válidas.',
        '',
      ];
      setError(msgs[step]);
      return;
    }
    setError('');
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleCreate();
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createTrip(user.uid, {
        destination:  destinations.map(d => d.city).join(', '),
        destinations, // array completo para uso futuro
        country:      firstDest?.country || '',
        continent,
        startDate,
        endDate,
        days,
        budget:       budget ? parseFloat(budget) : null,
        currency,
        coverImage,
        status:       'upcoming',
      });
      await reloadTrips();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Erro ao criar viagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Hero */}
        <div className="relative h-40 overflow-hidden shrink-0">
          <img src={coverImage} alt="Destino" className="w-full h-full object-cover transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5">
            <p className="text-white/70 text-xs font-medium mb-0.5">Nova viagem</p>
            <h2 className="text-white text-2xl font-black">{heroTitle}</h2>
            {startDate && endDate && days > 0 && (
              <p className="text-white/70 text-xs mt-0.5">{formatDate(startDate)} · {days} dias</p>
            )}
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 px-6 py-3 shrink-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#0F172A]' : 'bg-slate-100'}`} />
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${i === step ? 'text-[#0F172A]' : 'text-slate-300'}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Conteúdo scrollável */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">

          {/* ── Step 0: Continente ── */}
          {step === 0 && (
            <div className="animate-in fade-in duration-200">
              <p className="text-sm text-slate-500 mb-4">Para qual região do mundo você vai viajar?</p>
              <div className="grid grid-cols-2 gap-3">
                {CONTINENTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setContinent(c.id)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      continent === c.id
                        ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg scale-[1.02]'
                        : `${c.color} hover:scale-[1.01]`
                    }`}
                  >
                    {continent === c.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-xs font-bold text-center leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Destinos ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-3">
                  Adicione uma ou mais cidades. Digite para buscar.
                </p>
                <CitySearch
                  continentId={continent}
                  onSelect={addDestination}
                  placeholder={`Buscar cidade em ${CONTINENTS.find(c => c.id === continent)?.label || ''}...`}
                />
              </div>

              {destinations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {destinations.length} {destinations.length === 1 ? 'destino' : 'destinos'} selecionado{destinations.length > 1 ? 's' : ''}
                  </p>
                  {destinations.map((d, i) => (
                    <div
                      key={d.city}
                      className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm"
                    >
                      <div className="w-7 h-7 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] font-black text-xs shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0F172A] truncate">{d.city}</p>
                        <p className="text-xs text-slate-400 truncate">{d.country}</p>
                      </div>
                      <button
                        onClick={() => removeDestination(d.city)}
                        className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {destinations.length === 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200">
                  <Globe size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">Nenhum destino adicionado</p>
                  <p className="text-slate-300 text-xs mt-1">Pesquise uma cidade acima</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Datas ── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200 space-y-3">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Data de partida</p>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Data de regresso</p>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
              </div>
              {days > 0 && (
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <p className="text-[#2563EB] font-bold text-lg">{days} dias</p>
                  <p className="text-slate-400 text-xs">{formatDate(startDate)} → {formatDate(endDate)}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Orçamento ── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-200 space-y-3">
              <p className="text-sm text-slate-500">Orçamento total da viagem (opcional)</p>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {['EUR', 'USD', 'BRL', 'GBP', 'JPY'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="0.00"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  min="0"
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                />
              </div>

              {/* Resumo da viagem */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resumo</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Destinos</span>
                  <span className="font-bold text-[#0F172A] text-right max-w-[55%] truncate">
                    {destinations.map(d => d.city).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duração</span>
                  <span className="font-bold text-[#0F172A]">{days} dias</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Partida</span>
                  <span className="font-bold text-[#0F172A]">{formatDate(startDate)}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-2 text-slate-500 text-sm">
                <Sparkles size={16} className="text-purple-400 shrink-0" />
                <p>A IA vai sugerir atividades dentro do seu orçamento</p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl mt-3">{error}</p>
          )}

          {/* Botões de navegação */}
          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button
                onClick={() => { setStep(s => s - 1); setError(''); }}
                className="w-12 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={next}
              disabled={loading}
              className="flex-1 bg-[#0F172A] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {step < STEPS.length - 1
                ? <><span>Próximo</span><ChevronRight size={18} /></>
                : <span>Criar viagem ✈️</span>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
