import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader2, Phone, Calendar, Flag, Eye, EyeOff, ChevronLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

// --- Integração Real com o Firebase ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// ATENÇÃO: Substitua os valores abaixo pelas credenciais reais do seu projeto Firebase (encontra isto nas configurações do Firebase)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT",
};

// Previne a inicialização duplicada do Firebase durante o Hot Reload do React
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

const registerWithEmail = async (email, password, name, extraData) => {
  // 1. Cria a conta no Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // 2. Atualiza o nome (displayName) no perfil de autenticação
  await updateProfile(user, { displayName: name });
  
  // 3. Salva os dados extras (telefone, data, nacionalidade) na base de dados Firestore
  // Utilizamos o UID do utilizador como ID do documento para facilitar o acesso no futuro
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    ...extraData,
    createdAt: new Date().toISOString()
  });
  
  return userCredential;
};

const checkEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods && methods.length > 0) {
      throw { code: 'auth/email-already-in-use' };
    }
    return false;
  } catch (error) {
    // Retorna o erro se o e-mail já estiver em uso, caso contrário deixa avançar.
    if (error.code === 'auth/email-already-in-use') throw error;
    return false;
  }
};
// ------------------------------------------

const MODES = { login: 'login', register: 'register' };
const REGISTER_STEPS = ['Conta', 'Perfil'];

const COUNTRIES = [
  'África do Sul', 'Alemanha', 'Angola', 'Argentina', 'Austrália', 'Áustria', 'Bélgica', 
  'Bolívia', 'Brasil', 'Cabo Verde', 'Canadá', 'Chile', 'China', 'Colômbia', 'Coreia do Sul', 
  'Croácia', 'Dinamarca', 'Egito', 'Espanha', 'Estados Unidos', 'França', 'Grécia', 
  'Índia', 'Irlanda', 'Itália', 'Japão', 'México', 'Moçambique', 'Noruega', 'Nova Zelândia', 
  'Países Baixos', 'Peru', 'Polónia', 'Portugal', 'Reino Unido', 'Rússia', 'Suécia', 
  'Suíça', 'Turquia', 'Ucrânia', 'Uruguai', 'Venezuela'
];

export default function AuthScreen() {
  const [mode, setMode] = useState(MODES.login);
  const [registerStep, setRegisterStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Novo estado de Sucesso

  // Campos
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');

  const resetForm = () => {
    setEmail(''); setPass(''); setName('');
    setPhone(''); setBirthDate(''); setNationality('');
    setError(''); setSuccessMsg(''); setRegisterStep(0); setShowPass(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError(''); setSuccessMsg('');
    try { 
      await loginWithGoogle(); 
      setSuccessMsg('Sessão iniciada com sucesso!');
    }
    catch (e) { setError(friendlyError(e.code)); }
    finally { setLoading(false); }
  };

  const handleNextRegisterStep = async () => {
    if (registerStep === 0) {
      if (!email.trim()) { setError('Por favor, insira o seu e-mail.'); return; }
      
      // Validação básica de formato de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError('O formato do e-mail é inválido.'); return; }
      
      if (password.length < 6) { setError('A palavra-passe deve ter no mínimo 6 caracteres.'); return; }
      
      setError('');
      setLoading(true);
      
      // Verifica se o e-mail já existe na base de dados antes de avançar para o Perfil
      try {
        await checkEmailExists(email);
        setRegisterStep(1); // Só avança se o e-mail não existir
      } catch (err) {
        setError(friendlyError(err?.code));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg(''); // Limpa o sucesso ao tentar novamente

    if (mode === MODES.login) {
      if (!email || !password) { setError('Preencha os dados de acesso.'); return; }
      setLoading(true);
      try { 
        await loginWithEmail(email, password); 
        setSuccessMsg('Sessão iniciada com sucesso!');
        // Aqui colocaria a navegação após login (Ex: router.push('/home'))
      }
      catch (err) { setError(friendlyError(err?.code)); }
      finally { setLoading(false); }
      return;
    }

    if (registerStep === 0) {
      await handleNextRegisterStep();
      return;
    }

    if (!name.trim()) { setError('Como devemos chamá-lo? Insira o seu nome.'); return; }
    
    setLoading(true);
    try {
      // Esta função agora grava tudo no Firebase corretamente!
      await registerWithEmail(email, password, name.trim(), {
        phone: phone.trim(),
        birthDate,
        nationality: nationality.trim(),
      });
      
      setSuccessMsg('Conta criada com sucesso! A redirecionar...');
      // DICA: Coloque aqui o redirecionamento da sua App. (Ex: navigation.navigate('Home'))
      
    } catch (err) {
      setError(friendlyError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === MODES.register;

  // Cálculo da força da palavra-passe
  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1; // Fraca
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 3; // Forte
    return 2; // Média
  };
  const passStrength = getPasswordStrength();

  return (
    /* Container principal com fundo dinâmico (Glassmorphism) */
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans flex flex-col sm:max-w-md sm:mx-auto sm:shadow-2xl sm:min-h-[850px] sm:rounded-[2.5rem] sm:my-10 relative overflow-hidden z-0">
      
      {/* Esferas de cor no fundo (efeito ambiente) */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-blue-400/20 rounded-full blur-[80px] -z-10 mix-blend-multiply" />
      <div className="absolute top-[10%] right-[-20%] w-[60%] h-[50%] bg-emerald-400/15 rounded-full blur-[80px] -z-10 mix-blend-multiply" />

      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between z-10">
        {isRegister && registerStep === 1 ? (
          <button 
            onClick={() => setRegisterStep(0)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white/40 hover:bg-white/80 transition-all"
          >
            <ChevronLeft size={22} className="text-neutral-700" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-center text-sm shadow-md shadow-neutral-900/20">
            ✈️
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900">TripMind</span>
        </div>
        
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-6 flex flex-col z-10">
        
        {/* Títulos */}
        <div className="mb-8 mt-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-neutral-900">
            {isRegister 
              ? (registerStep === 0 ? 'Criar nova conta' : 'O seu perfil') 
              : 'Bem-vindo de volta'}
          </h1>
          <p className="text-neutral-500 text-[15px] font-medium px-4">
            {isRegister 
              ? (registerStep === 0 ? 'O seu copiloto de viagens com IA.' : 'Quase lá! Conte-nos um pouco sobre si.') 
              : 'Aceda aos seus roteiros e planeie o próximo destino.'}
          </p>
        </div>

        {/* Tabs em pílula (estilo iOS) */}
        {(!isRegister || registerStep === 0) && (
          <div className="flex bg-neutral-200/50 p-1.5 rounded-2xl mb-8 backdrop-blur-sm border border-white/50">
            {Object.values(MODES).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); resetForm(); }}
                className={`flex-1 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 ${
                  mode === m 
                    ? 'bg-white text-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {m === 'login' ? 'Iniciar Sessão' : 'Registar'}
              </button>
            ))}
          </div>
        )}

        {/* Indicador de Passos */}
        {isRegister && (
          <div className="flex items-center justify-center gap-3 mb-8">
            {REGISTER_STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    i <= registerStep ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/20' : 'bg-neutral-200/50 text-neutral-400'
                  }`}>
                    {i < registerStep ? <ShieldCheck size={14} /> : i + 1}
                  </div>
                  <span className={`text-[13px] font-bold tracking-wide ${i <= registerStep ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {label}
                  </span>
                </div>
                {i < REGISTER_STEPS.length - 1 && (
                  <div className="w-8 h-1 rounded-full bg-neutral-200/60 overflow-hidden">
                    <div className={`h-full bg-neutral-900 transition-all duration-500 ${registerStep > 0 ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <form onSubmit={handleEmail} className="flex-1 flex flex-col">
          <div className="space-y-4">
            
            {/* ── LOGIN / REGISTO STEP 0 ── */}
            {(!isRegister || registerStep === 0) && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FloatingField id="email" label="Endereço de e-mail" icon={<Mail size={20}/>} type="email" value={email} onChange={setEmail} autoFocus={!isRegister} />
                
                <FloatingPasswordField id="password" label="Palavra-passe" value={password} onChange={setPass} show={showPass} onToggle={() => setShowPass(p => !p)} />
                
                {/* Indicador de Força da Palavra-passe (Apenas no Registo) */}
                {isRegister && password.length > 0 && (
                  <div className="px-1 pt-1 animate-in fade-in duration-300">
                    <div className="flex gap-1.5 mb-1.5">
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passStrength >= 1 ? 'bg-red-400' : 'bg-neutral-200'}`} />
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passStrength >= 2 ? 'bg-amber-400' : 'bg-neutral-200'}`} />
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passStrength >= 3 ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-500 text-right">
                      {passStrength === 1 && <span className="text-red-500">Fraca</span>}
                      {passStrength === 2 && <span className="text-amber-500">Razoável</span>}
                      {passStrength === 3 && <span className="text-emerald-500">Forte</span>}
                    </p>
                  </div>
                )}

                {!isRegister && (
                  <div className="mt-2 flex justify-end">
                    <button type="button" className="text-[13px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
                      Esqueceu-se da palavra-passe?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── REGISTO STEP 1: Perfil ── */}
            {isRegister && registerStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                <FloatingField id="name" label="Nome completo" icon={<User size={20}/>} type="text" value={name} onChange={setName} autoFocus />
                <FloatingField id="phone" label="Telemóvel / WhatsApp" icon={<Phone size={20}/>} type="tel" value={phone} onChange={setPhone} />
                
                <FloatingField id="birthDate" label="Data de nascimento" icon={<Calendar size={20}/>} type="date" value={birthDate} onChange={setBirthDate} isDate />
                
                <FloatingAutocompleteField id="nationality" label="Nacionalidade" icon={<Flag size={20}/>} value={nationality} onChange={setNationality} options={COUNTRIES} />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-[14px] rounded-2xl font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="flex-shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mt-5 p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 text-emerald-700 text-[14px] rounded-2xl font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={20} className="flex-shrink-0 text-emerald-500" />
              <p>{successMsg}</p>
            </div>
          )}

          {/* Área Inferior (Botões) */}
          <div className="mt-auto pt-8 pb-8 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-neutral-900/20 hover:shadow-neutral-900/30"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  {!isRegister && 'Iniciar Sessão'}
                  {isRegister && registerStep === 0 && 'Continuar'}
                  {isRegister && registerStep === 1 && 'Concluir Registo ✈️'}
                </>
              )}
            </button>

            {(!isRegister || registerStep === 0) && (
              <>
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-neutral-200/60" />
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest">Ou aceda com</span>
                  <div className="flex-1 h-px bg-neutral-200/60" />
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-neutral-200 shadow-sm text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
                >
                  <GoogleIcon />
                  Continuar com Google
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-componentes (Floating Labels) ────────────────────────

function FloatingField({ id, label, icon, type, value, onChange, autoFocus, isDate }) {
  // Para inputs do tipo data, o placeholder nativo não funciona igual para o hack do CSS.
  // Usamos um estado interno para gerir o foco.
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0 || isDate;

  return (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
        {icon}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        placeholder=" " // Necessário espaço em branco para o peer-placeholder-shown (se aplicável, mas aqui usamos JS para maior compatibilidade com datas)
        className="peer w-full bg-white/60 backdrop-blur-sm border border-neutral-200/80 focus:border-neutral-900 focus:bg-white rounded-2xl pt-7 pb-2 pl-12 pr-4 text-[16px] font-semibold text-neutral-900 transition-all outline-none shadow-sm focus:shadow-md"
      />
      <label 
        htmlFor={id} 
        className={`absolute left-12 transition-all duration-300 pointer-events-none font-bold ${
          active 
            ? 'top-2 text-[11px] text-neutral-500 uppercase tracking-wide' 
            : 'top-1/2 -translate-y-1/2 text-[16px] text-neutral-400'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingPasswordField({ id, label, value, onChange, show, onToggle }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
        <Lock size={20}/>
      </div>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full bg-white/60 backdrop-blur-sm border border-neutral-200/80 focus:border-neutral-900 focus:bg-white rounded-2xl pt-7 pb-2 pl-12 pr-12 text-[16px] font-semibold text-neutral-900 transition-all outline-none shadow-sm focus:shadow-md"
      />
      <label 
        htmlFor={id} 
        className={`absolute left-12 transition-all duration-300 pointer-events-none font-bold ${
          active 
            ? 'top-2 text-[11px] text-neutral-500 uppercase tracking-wide' 
            : 'top-1/2 -translate-y-1/2 text-[16px] text-neutral-400'
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
      >
        {show ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2a10.3 10.3 0 00-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function friendlyError(code) {
  const MAP = {
    'auth/user-not-found':         'Nenhuma conta encontrada com este e-mail.',
    'auth/wrong-password':         'A palavra-passe está incorreta.',
    'auth/invalid-credential':     'As credenciais são inválidas.',
    'auth/email-already-in-use':   'Este e-mail já se encontra em uso.',
    'auth/weak-password':          'A palavra-passe deve ter pelo menos 6 caracteres.',
    'auth/invalid-email':          'O formato do e-mail é inválido.',
    'auth/popup-closed-by-user':   'A janela de autenticação foi fechada.',
    'auth/network-request-failed': 'Erro de ligação. Verifique a sua internet.',
  };
  return MAP[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}

function FloatingAutocompleteField({ id, label, icon, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const active = focused || value.length > 0;

  // Filtra as opções com base no texto atual digitado
  const filteredOptions = options.filter(
    (option) => option.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-20 ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
        {icon}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          setFocused(true);
          if (value.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setFocused(false);
          // Atraso de 200ms para permitir que o clique na opção da lista seja registado antes de fechar
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder=" "
        className="peer w-full bg-white/60 backdrop-blur-sm border border-neutral-200/80 focus:border-neutral-900 focus:bg-white rounded-2xl pt-7 pb-2 pl-12 pr-4 text-[16px] font-semibold text-neutral-900 transition-all outline-none shadow-sm focus:shadow-md relative z-10"
      />
      <label 
        htmlFor={id} 
        className={`absolute left-12 transition-all duration-300 pointer-events-none font-bold z-20 ${
          active 
            ? 'top-2 text-[11px] text-neutral-500 uppercase tracking-wide' 
            : 'top-1/2 -translate-y-1/2 text-[16px] text-neutral-400'
        }`}
      >
        {label}
      </label>
      
      {/* Dropdown Flutuante de sugestões */}
      {showSuggestions && value.length > 0 && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[105%] bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {filteredOptions.map((option) => (
            <li
              key={option}
              onClick={() => {
                onChange(option);
                setShowSuggestions(false);
              }}
              className="px-4 py-3.5 text-[15px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-black cursor-pointer transition-colors border-b border-neutral-100 last:border-0"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}