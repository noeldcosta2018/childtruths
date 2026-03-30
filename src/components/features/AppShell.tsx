'use client'

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Search, Bookmark, Copy, Share2, Volume2, VolumeX, Plus, X, Check, AlertCircle, Loader2, Star, LogOut, Eye, EyeOff, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signInWithEmail, signUp, signOut, resetPassword } from "@/lib/auth";
import * as db from "@/lib/db";
import { supabase } from "@/lib/supabase";

// ═══════════════════════════════════════════════════
// THE NURTURED PATH — DESIGN SYSTEM
// ═══════════════════════════════════════════════════
const C = {
  surface: '#fef8f1',
  surfaceLow: '#f9f3ec',
  surfaceContainer: '#f3ede6',
  surfaceHigh: '#ede7e0',
  surfaceHighest: '#e7e2db',
  white: '#ffffff',
  primary: '#914b31',
  primaryContainer: '#d98466',
  primaryFixed: '#ffdbcf',
  onPrimary: '#ffffff',
  onSurface: '#1d1b17',
  onSurfaceVariant: '#54433e',
  secondary: '#51634b',
  secondaryContainer: '#d1e6c7',
  secondaryFixed: '#d4e9ca',
  tertiary: '#1d6772',
  tertiaryContainer: '#61a4b0',
  tertiaryFixed: '#aaedfa',
  outline: '#87736c',
  outlineVariant: '#d9c1ba',
  errorContainer: '#ffdad6',
};

// ═══════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════
const COUNTRIES = [
  {flag:"🇦🇪",name:"UAE"},{flag:"🇺🇸",name:"United States"},{flag:"🇬🇧",name:"United Kingdom"},
  {flag:"🇮🇳",name:"India"},{flag:"🇸🇦",name:"Saudi Arabia"},{flag:"🇨🇦",name:"Canada"},
  {flag:"🇦🇺",name:"Australia"},{flag:"🇩🇪",name:"Germany"},{flag:"🇫🇷",name:"France"},
  {flag:"🇪🇬",name:"Egypt"},{flag:"🇵🇰",name:"Pakistan"},{flag:"🇳🇬",name:"Nigeria"},
  {flag:"🇯🇵",name:"Japan"},{flag:"🇧🇷",name:"Brazil"},{flag:"🇲🇽",name:"Mexico"},
  {flag:"🇹🇷",name:"Turkey"},{flag:"🇮🇩",name:"Indonesia"},{flag:"🇲🇾",name:"Malaysia"},
  {flag:"🇿🇦",name:"South Africa"},{flag:"🇰🇪",name:"Kenya"}
];

const BELIEFS = [
  {icon:"🕌",name:"Islam",desc:"References to Allah, Quran & Islamic values"},
  {icon:"✝️",name:"Christianity",desc:"References to God, Jesus & Biblical values"},
  {icon:"🕉️",name:"Hinduism",desc:"References to dharma, karma & soul's journey"},
  {icon:"✡️",name:"Judaism",desc:"References to God, Torah & Jewish values"},
  {icon:"☸️",name:"Buddhism",desc:"Compassion, mindfulness & cycle of life"},
  {icon:"🌿",name:"Spiritual",desc:"Universe, energy & connectedness"},
  {icon:"🔬",name:"Secular",desc:"Science-based, no religious framing"},
];

const LANGUAGES = [
  {flag:"🇬🇧",name:"English"},{flag:"🇸🇦",name:"العربية"},{flag:"🇮🇳",name:"हिन्दी"},
  {flag:"🇪🇸",name:"Español"},{flag:"🇫🇷",name:"Français"},{flag:"🇨🇳",name:"中文"},
  {flag:"🇵🇹",name:"Português"},{flag:"🇩🇪",name:"Deutsch"}
];

const ROLES = [
  {icon:"👨‍👩‍👧",label:"Parent"},
  {icon:"📚",label:"Educator"},
  {icon:"🤝",label:"Guardian"},
  {icon:"💫",label:"Other"},
];

const PERSONALITIES = [
  {emoji:"🔍",label:"Very Curious"},{emoji:"💬",label:"Very Talkative"},
  {emoji:"🌸",label:"Sensitive"},{emoji:"📚",label:"Literal Thinker"},
  {emoji:"🎨",label:"Creative"},{emoji:"😌",label:"Calm & Shy"},
  {emoji:"😰",label:"Gets Anxious"},{emoji:"😊",label:"Outgoing"},
];

const TOPICS = [
  {emoji:"👶",label:"Babies",q:"Where do babies come from?"},
  {emoji:"🕊️",label:"Death",q:"Why do people die?"},
  {emoji:"💔",label:"Divorce",q:"Why are you and dad splitting up?"},
  {emoji:"❓",label:"Sex",q:"What is sex?"},
  {emoji:"🌙",label:"Afterlife",q:"What happens after we die?"},
  {emoji:"🏥",label:"Illness",q:"What happens when someone gets really sick?"},
];

const TRIGGERS_DATA = [
  {icon:"📺",label:"TV / Movie",key:"tv"},
  {icon:"📱",label:"iPad / Phone",key:"ipad"},
  {icon:"👥",label:"Friend told them",key:"friend"},
  {icon:"🏫",label:"At school",key:"school"},
  {icon:"👂",label:"Overheard adults",key:"overheard"},
  {icon:"🌍",label:"Real event",key:"event"},
];

const LAYER_META = [
  { name: 'The Spark', icon: '✨', color: C.primary, softBg: `${C.primaryFixed}60` },
  { name: 'The Story', icon: '📖', color: C.secondary, softBg: `${C.secondaryContainer}60` },
  { name: 'The Science', icon: '🔬', color: C.tertiary, softBg: `${C.tertiaryFixed}40` },
  { name: 'The Deep Dive', icon: '🧠', color: C.onSurface, softBg: C.surfaceHigh },
];

const TESTIMONIALS = [
  { name: 'Sarah J.', role: 'Mom of Two', text: 'This app saved me during the "Why?" phase. It gives me the perfect words for my 4-year-old.', stars: 5 },
  { name: 'David M.', role: 'Educator & Dad', text: 'Finally, a tool that helps me talk about difficult world events in a way that feels safe.', stars: 5 },
  { name: 'Priya R.', role: 'Mom of Three', text: 'The cultural sensitivity is incredible. It respects our values while being scientifically accurate.', stars: 5 },
];

// ═══════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════
async function generateLayers(question: string, childName: string, age: string, country: string, belief: string, trigger: string, triggerDetail: string, language: string, accessToken: string) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({ question, childName, age, country, belief, trigger, triggerDetail, language }),
  });
  if (response.status === 402) throw new Error("FREE_LIMIT_REACHED");
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// ═══════════════════════════════════════════════════
// FLOATING NAV (shared)
// ═══════════════════════════════════════════════════
function FloatingNav({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  const items = [
    { key: 'home', icon: '💬', label: 'Ask' },
    { key: 'saved', icon: '📚', label: 'Library' },
    { key: 'community', icon: '🤝', label: 'Connect' },
    { key: 'settings', icon: '👤', label: 'You' },
  ];
  return (
    <div className="fixed bottom-6 left-0 w-full z-50 flex justify-center px-4">
      <nav className="flex justify-between items-center w-full max-w-[440px] rounded-[2rem] p-2" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: `1px solid ${C.outlineVariant}20` }}>
        {items.map(n => (
          <button key={n.key} onClick={() => onNav(n.key)} className="flex flex-col items-center px-5 py-2.5 rounded-[1.5rem] transition-all active:scale-95" style={{ background: active === n.key ? C.secondaryContainer + '80' : 'transparent' }}>
            <span className="text-lg">{n.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "'Manrope'", color: active === n.key ? C.primary : C.onSurfaceVariant + '80' }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
export function AppShell() {
  const { user, session, loading: authContextLoading } = useAuth();

  const [screen, setScreen] = useState('splash');
  const [prevScreen, setPrevScreen] = useState<string|null>(null);

  // Auth
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Setup
  const [setupStep, setSetupStep] = useState(1);
  const [selRole, setSelRole] = useState('Parent');
  const [selLanguage, setSelLanguage] = useState('English');
  const [selCountry, setSelCountry] = useState('');
  const [selBelief, setSelBelief] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Children
  const [children, setChildren] = useState<any[]>([]);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childPersonalities, setChildPersonalities] = useState<string[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);

  // Home
  const [question, setQuestion] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [triggerDetail, setTriggerDetail] = useState('');
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Result
  const [layers, setLayers] = useState<any>(null);
  const [parentTip, setParentTip] = useState('');
  const [misinfoTip, setMisinfoTip] = useState('');
  const [openLayer, setOpenLayer] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Usage
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const ADMIN_EMAIL = 'noeldcosta2018@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;
  const MAX_FREE = 7;

  // Saved & Legal
  const [saved, setSaved] = useState<any[]>([]);
  const [legalPage, setLegalPage] = useState<string|null>(null);

  // Toast
  const [toast, setToast] = useState('');
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = (s: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setPrevScreen(screen);
    setScreen(s);
  };

  // ── Auth state handler ──
  const dataLoadedRef = useRef(false);
  useEffect(() => {
    if (authContextLoading) return;
    if (user && session) {
      setIsLoggedIn(true);
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Parent');
      if (dataLoadedRef.current) return;
      dataLoadedRef.current = true;
      const loadUserData = async () => {
        try {
          let profile = null;
          try { profile = await db.getProfile(user.id); } catch (e) {}
          let childrenData: any[] = [];
          try { childrenData = await db.getChildren(user.id); } catch (e) {}
          let usageData = 0;
          try { usageData = await db.getUsageCount(user.id); } catch (e) {}
          let subscription = null;
          try { subscription = await db.getSubscription(user.id); } catch (e) {}
          if (profile) {
            if (profile.language) setSelLanguage(profile.language);
            if (profile.country) setSelCountry(profile.country);
            if (profile.belief) setSelBelief(profile.belief);
          }
          if (childrenData?.length > 0) {
            const mapped = childrenData.map((c: any) => ({ id: c.id, name: c.name, age: c.age_range }));
            setChildren(mapped);
            setSelectedChild(mapped[0]);
          }
          setUsageCount(usageData);
          setIsPro(!!subscription);
          setDataLoaded(true);
          if (profile?.country && profile?.belief && childrenData?.length > 0) {
            if (['splash','onboarding','auth'].includes(screen)) navigate('home');
          } else if (profile?.country && profile?.belief) {
            navigate('addchild');
          } else {
            navigate('setup');
          }
        } catch (err) { console.error(err); setDataLoaded(true); navigate('setup'); }
      };
      loadUserData();
      db.getSavedExplanations(user.id).then((exps: any[]) => {
        setSaved(exps.map((e: any) => ({ id: e.id, question: e.question, child: { name: e.children?.name || 'Child', age: e.children?.age_range || '' }, layers: e.layers, date: new Date(e.created_at).toLocaleDateString(), country: e.country, belief: e.belief, triggers: e.triggers || [] })));
      }).catch(console.error);
    } else if (!authContextLoading) {
      setIsLoggedIn(false); setDataLoaded(false); dataLoadedRef.current = false;
    }
  }, [user, session, authContextLoading]);

  // Stripe redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('checkout') === 'success') { setToast('Subscription activated!'); setIsPro(true); window.history.replaceState({}, '', window.location.pathname); }
    else if (p.get('checkout') === 'cancel') { setToast('Checkout cancelled.'); window.history.replaceState({}, '', window.location.pathname); }
  }, []);

  // Splash timer
  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => { if (!authContextLoading && !user) navigate('onboarding'); }, 2500);
      return () => clearTimeout(t);
    }
  }, [screen, authContextLoading, user]);

  // ── Handlers ──
  const handleAuth = async (mode: string) => {
    setAuthError('');
    if (!email.trim()) return setAuthError('Email is required');
    if (!email.includes('@')) return setAuthError('Please enter a valid email');
    if (mode === 'forgot') {
      setAuthLoading(true);
      try { await resetPassword(email); setAuthMode('login'); setToast('Check your email for a reset link.'); }
      catch (err: any) { setAuthError(err.message); }
      finally { setAuthLoading(false); }
      return;
    }
    if (!password) return setAuthError('Password is required');
    if (password.length < 6) return setAuthError('Min 6 characters');
    if (mode === 'signup' && password !== confirmPass) return setAuthError('Passwords do not match');
    setAuthLoading(true);
    try {
      if (mode === 'signup') { await signUp(email, password); setToast('Check your email to confirm.'); setAuthMode('login'); }
      else { await signInWithEmail(email, password); }
    } catch (err: any) { setAuthError(err.message); }
    finally { setAuthLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try { await signInWithGoogle(); }
    catch (err: any) { setAuthError(err.message); setAuthLoading(false); }
  };

  const addChild = async () => {
    if (!childName.trim() || !childAge || !user) return;
    try {
      const nc = await db.addChild(user.id, childName.trim(), childAge);
      const mapped = { name: nc.name, age: nc.age_range, id: nc.id };
      setChildren(prev => [...prev, mapped]);
      if (!selectedChild) setSelectedChild(mapped);
      setChildName(''); setChildAge(''); setChildPersonalities([]);
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async () => {
    if (!question.trim()) return setGenError('Please enter a question');
    if (!selectedChild) return setGenError('Please select a child');
    if (usageCount >= MAX_FREE && !isPro && !isAdmin) { navigate('paywall'); return; }
    setGenError(''); setGenerating(true); navigate('loading');
    try {
      const r = await generateLayers(question, selectedChild.name, selectedChild.age, selCountry, selBelief, selectedTriggers.join(', '), triggerDetail, selLanguage, session?.access_token || '');
      setLayers(r.layers); setParentTip(r.parentTip); setMisinfoTip(r.misinfoTip);
      setOpenLayer(0); setUsageCount(prev => prev + 1); navigate('result');
    } catch (err: any) {
      if (err.message === 'FREE_LIMIT_REACHED') { navigate('paywall'); return; }
      setGenError('Failed to generate. Try again.'); navigate('home');
    } finally { setGenerating(false); }
  };

  const saveResult = async () => {
    if (!layers || !selectedChild || !user) return;
    try {
      const se = await db.saveExplanation(user.id, { child_id: selectedChild.id, question, triggers: selectedTriggers, trigger_detail: triggerDetail, layers, parent_tip: parentTip, misinfo_tip: misinfoTip, country: selCountry, belief: selBelief, language: selLanguage });
      setSaved(prev => [{ id: se.id, question, child: selectedChild, layers, date: new Date().toLocaleDateString(), country: selCountry, belief: selBelief, triggers: selectedTriggers }, ...prev]);
      setToast('Saved!');
    } catch (err) { console.error(err); }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const text = layers?.[openLayer >= 0 ? openLayer : 0]?.quote || '';
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.name.includes('Samantha')) || voices.find(v => v.lang.startsWith('en') && v.localService);
    if (pref) u.voice = pref;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u); setIsSpeaking(true);
  };

  const handleCheckout = async (plan: string) => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
  };

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const freeLeft = Math.max(0, MAX_FREE - usageCount);

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  const HL = { fontFamily: "'Plus Jakarta Sans', sans-serif" }; // headline font shortcut

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: C.surface, minHeight: '100vh' }} className="flex flex-col items-center">
      <div className="w-full max-w-[500px] relative overflow-hidden" style={{ background: C.surface, minHeight: '100vh' }}>

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-xl" style={{ background: C.secondary, color: '#fff' }}>
            <p className="text-sm font-semibold text-center">{toast}</p>
          </div>
        )}

        {/* ═══ SPLASH ═══ */}
        {screen === 'splash' && (
          <div className="flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-20 -left-20 w-72 h-72 organic-blob blur-[100px] opacity-30" style={{ background: C.secondaryFixed }} />
            <div className="absolute bottom-20 -right-20 w-64 h-64 organic-blob blur-[100px] opacity-20" style={{ background: C.primaryFixed }} />
            <div className="relative z-10 flex flex-col items-center">
              <p style={{ ...HL, color: C.primary, fontSize: 36, fontWeight: 800 }}>Kidzplainer</p>
              <div className="h-1.5 w-8 rounded-full mt-2" style={{ background: C.tertiaryContainer }} />
              <Loader2 size={20} className="mt-10 animate-spin" style={{ color: C.primary }} />
            </div>
          </div>
        )}

        {/* ═══ ONBOARDING ═══ */}
        {screen === 'onboarding' && (
          <div className="flex flex-col items-center justify-between text-center relative overflow-hidden px-6 py-10" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -left-20 w-72 h-72 organic-blob blur-[100px] opacity-20" style={{ background: C.secondaryFixed }} />
            <div className="absolute top-1/3 -right-20 w-60 h-60 organic-blob blur-[100px] opacity-15 rotate-45" style={{ background: C.tertiaryFixed }} />
            <div className="absolute -bottom-10 left-10 w-56 h-56 organic-blob blur-[100px] opacity-20" style={{ background: C.primaryFixed }} />

            <div className="flex flex-col items-center">
              <p style={{ ...HL, color: C.primary, fontSize: 28, fontWeight: 800 }}>Kidzplainer</p>
              <div className="h-1.5 w-8 rounded-full mt-1" style={{ background: C.tertiaryContainer }} />
            </div>

            <div className="relative w-full max-w-[280px] aspect-square my-6 animate-float">
              <div className="absolute inset-0 organic-blob transform -rotate-6 scale-110 opacity-40" style={{ background: C.surfaceHigh }} />
              <div className="relative z-10 w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src="https://videos.pexels.com/video-files/9096885/9096885-hd_1080_1920_24fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-4 rounded-2xl shadow-xl z-20 max-w-[180px] animate-float" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', animationDelay: '-3s', border: '1px solid rgba(255,255,255,0.5)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.primary }}>Smart Parenting</p>
                <p className="text-xs font-medium leading-snug" style={{ color: C.onSurfaceVariant }}>Answers crafted for their curiosity and your peace of mind.</p>
              </div>
            </div>

            <div className="space-y-4 px-2 max-w-sm">
              <h1 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Because they ask.<br /><span style={{ color: C.primary, fontStyle: 'italic', fontWeight: 600 }}>Because you care.</span>
              </h1>
              <p className="text-base leading-relaxed font-medium" style={{ color: `${C.onSurfaceVariant}cc` }}>
                Turn curiosity into connection with AI-powered explanations designed for growing minds.
              </p>
            </div>

            <div className="w-full space-y-4 mt-6">
              <button onClick={() => { setAuthMode('signup'); navigate('auth'); }} className="w-full py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 20px 40px -12px rgba(145,75,49,0.3)' }}>
                Get Started for Free <ChevronRight size={18} />
              </button>
              <button onClick={() => { setAuthMode('login'); navigate('auth'); }} className="w-full py-3 font-bold text-sm" style={{ color: C.secondary }}>Log into your account</button>
            </div>

            <div className="flex justify-between items-center w-full px-4 py-4 mt-4" style={{ borderTop: `1px solid ${C.outlineVariant}33` }}>
              {[{icon:'🛡️',label:'Trusted'},{icon:'❤️',label:'Parent-First'},{icon:'🔒',label:'Secure'}].map((b,i) => (
                <div key={i} className="flex flex-col items-center gap-1 opacity-50">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-widest" style={{ color: C.onSurfaceVariant }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ AUTH ═══ */}
        {screen === 'auth' && (
          <div className="flex flex-col px-6 py-10 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-20 -right-20 w-72 h-72 organic-blob blur-[100px] opacity-15" style={{ background: C.primaryContainer }} />
            <button onClick={() => navigate('onboarding')} className="p-2 rounded-full w-10 h-10 flex items-center justify-center mb-6" style={{ background: C.white, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><ArrowLeft size={18} style={{ color: C.onSurface }} /></button>
            <h1 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.15, marginBottom: 8 }}>
              {authMode === 'signup' ? 'Create your account' : authMode === 'forgot' ? 'Reset password' : 'Welcome back'}
            </h1>
            <p className="text-base mb-8" style={{ color: C.onSurfaceVariant }}>{authMode === 'signup' ? 'Start your free 7-day trial.' : authMode === 'forgot' ? 'Enter your email to reset.' : 'Sign in to continue.'}</p>

            {authMode !== 'forgot' && (<>
              <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 mb-6 active:scale-[0.97] transition-all" style={{ background: C.white, border: `1.5px solid ${C.outlineVariant}50`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-4 mb-6"><div className="flex-1 h-px" style={{ background: C.outlineVariant + '40' }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>or</span><div className="flex-1 h-px" style={{ background: C.outlineVariant + '40' }} /></div>
            </>)}

            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-5 py-4 rounded-2xl text-base outline-none transition-all" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} onFocus={e => e.target.style.borderColor = C.primary + '60'} onBlur={e => e.target.style.borderColor = C.surfaceHigh} />
            </div>

            {authMode !== 'forgot' && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full px-5 py-4 rounded-2xl text-base outline-none pr-12" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} onFocus={e => e.target.style.borderColor = C.primary + '60'} onBlur={e => e.target.style.borderColor = C.surfaceHigh} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff size={18} color={C.outline} /> : <Eye size={18} color={C.outline} />}</button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Confirm password</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter password" className="w-full px-5 py-4 rounded-2xl text-base outline-none" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} />
              </div>
            )}

            {authError && <p className="text-sm mb-4 flex items-center gap-2" style={{ color: '#ba1a1a' }}><AlertCircle size={14} />{authError}</p>}

            <button onClick={() => handleAuth(authMode)} disabled={authLoading} className="w-full py-5 rounded-2xl font-bold text-lg mt-2 flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading && <Loader2 size={18} className="animate-spin" />}
              {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
            </button>

            <div className="flex justify-center gap-1 mt-6 text-sm">
              {authMode === 'login' && <><span style={{ color: C.outline }}>New here?</span><button onClick={() => { setAuthMode('signup'); setAuthError(''); }} className="font-bold" style={{ color: C.primary }}>Sign up</button></>}
              {authMode === 'signup' && <><span style={{ color: C.outline }}>Already have an account?</span><button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="font-bold" style={{ color: C.primary }}>Sign in</button></>}
            </div>
            {authMode === 'login' && <button onClick={() => { setAuthMode('forgot'); setAuthError(''); }} className="w-full text-center text-sm font-bold mt-3" style={{ color: C.tertiary }}>Forgot password?</button>}
          </div>
        )}

        {/* ═══ SETUP ═══ */}
        {screen === 'setup' && (
          <div className="flex flex-col px-6 pt-6 pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="flex items-center justify-between mb-2">
              {setupStep > 1 ? <button onClick={() => setSetupStep(s => s - 1)} className="p-2 rounded-full" style={{ background: C.white }}><ArrowLeft size={18} color={C.primary} /></button> : <div />}
              <p style={{ ...HL, fontWeight: 700, color: C.onSurface, fontSize: 16 }}>Kidzplainer</p>
              <div className="flex gap-1.5">{[1,2,3,4].map(s => <div key={s} className="h-1.5 rounded-full transition-all duration-500" style={{ width: s === setupStep ? 24 : 8, background: s === setupStep ? C.primary : s < setupStep ? C.secondary : C.outlineVariant }} />)}</div>
            </div>

            <div className="flex justify-center mt-6 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: C.primaryFixed + '80', color: C.primary }}>Step {setupStep} of 4</span>
            </div>

            {setupStep === 1 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>Tell us about yourself.</h2>
                <p className="text-center text-base" style={{ color: C.onSurfaceVariant }}>Let's customize your experience.</p>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Your role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(r => (
                      <button key={r.label} onClick={() => setSelRole(r.label)} className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-[0.97]" style={{ background: selRole === r.label ? C.primaryFixed : C.white, border: `2px solid ${selRole === r.label ? C.primary : C.surfaceHigh}` }}>
                        <span className="text-2xl">{r.icon}</span>
                        <span className="font-bold text-sm" style={{ color: C.onSurface }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>What language do you speak at home?</h2>
                <div className="space-y-2.5">
                  {LANGUAGES.map(l => (
                    <button key={l.name} onClick={() => setSelLanguage(l.name)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selLanguage === l.name ? C.primaryFixed : C.white, border: `1.5px solid ${selLanguage === l.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-2xl">{l.flag}</span>
                      <span className="font-semibold text-base" style={{ color: C.onSurface }}>{l.name}</span>
                      {selLanguage === l.name && <Check size={18} className="ml-auto" style={{ color: C.primary }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>Where are you raising your child?</h2>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
                  <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search countries..." className="w-full pl-12 pr-5 py-4 rounded-2xl text-base outline-none" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} />
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {filteredCountries.map(c => (
                    <button key={c.name} onClick={() => setSelCountry(c.name)} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selCountry === c.name ? C.primaryFixed : C.white, border: `1.5px solid ${selCountry === c.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-semibold text-sm" style={{ color: C.onSurface }}>{c.name}</span>
                      {selCountry === c.name && <Check size={16} className="ml-auto" style={{ color: C.primary }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupStep === 4 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>What's your worldview?</h2>
                <p className="text-center text-sm" style={{ color: C.onSurfaceVariant }}>This helps us frame answers with sensitivity.</p>
                <div className="space-y-2.5">
                  {BELIEFS.map(b => (
                    <button key={b.name} onClick={() => setSelBelief(b.name)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selBelief === b.name ? C.primaryFixed : C.white, border: `1.5px solid ${selBelief === b.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-2xl">{b.icon}</span>
                      <div className="text-left flex-1"><p className="font-bold text-sm" style={{ color: C.onSurface }}>{b.name}</p><p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>{b.desc}</p></div>
                      {selBelief === b.name && <Check size={16} style={{ color: C.primary }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center" style={{ background: `linear-gradient(transparent, ${C.surface} 30%)` }}>
              <div className="w-full max-w-[500px] space-y-3">
                <button onClick={async () => {
                  if (setupStep < 4) { setSetupStep(s => s + 1); return; }
                  if (user) { try { await db.upsertProfile(user.id, { language: selLanguage, country: selCountry, belief: selBelief }); } catch (e) { console.error(e); } }
                  navigate('addchild');
                }} disabled={(setupStep === 3 && !selCountry) || (setupStep === 4 && !selBelief)} className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)', opacity: (setupStep === 3 && !selCountry) || (setupStep === 4 && !selBelief) ? 0.5 : 1 }}>
                  {setupStep < 4 ? `Continue to Step ${setupStep + 1}` : 'Continue'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADD CHILD ═══ */}
        {screen === 'addchild' && (
          <div className="flex flex-col px-6 py-10 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute top-10 -right-20 w-60 h-60 organic-blob blur-[80px] opacity-15" style={{ background: C.tertiaryContainer }} />
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.15, marginBottom: 8 }}>Add your child</h2>
            <p className="text-sm mb-2" style={{ color: C.onSurfaceVariant }}>We'll personalize explanations for their age and personality.</p>
            <div className="flex items-center gap-2 p-3 rounded-2xl mb-6" style={{ background: C.secondaryContainer + '40', border: `1px solid ${C.secondaryContainer}50` }}>
              <span className="text-sm">🔒</span>
              <p className="text-xs font-medium" style={{ color: C.secondary }}>Use their first name only — never their full name.</p>
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Child's first name</label>
            <input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="e.g. Zara" className="w-full px-5 py-4 rounded-2xl text-base outline-none mb-5" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} />

            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Age group</label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['3-5 years','6-8 years','9-11 years','12-14 years'].map(age => (
                <button key={age} onClick={() => setChildAge(age)} className="py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]" style={{ background: childAge === age ? C.primaryFixed : C.white, border: `1.5px solid ${childAge === age ? C.primary + '40' : C.surfaceHigh}`, color: C.onSurface }}>{age}</button>
              ))}
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Their nature (select any)</label>
            <div className="flex flex-wrap gap-2 mb-8">
              {PERSONALITIES.map(p => {
                const sel = childPersonalities.includes(p.label);
                return <button key={p.label} onClick={() => setChildPersonalities(prev => sel ? prev.filter(x => x !== p.label) : [...prev, p.label])} className="px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]" style={{ background: sel ? C.primaryFixed : C.white, border: `1.5px solid ${sel ? C.primary + '40' : C.surfaceHigh}`, color: C.onSurface }}>{p.emoji} {p.label}</button>;
              })}
            </div>

            <button onClick={async () => { await addChild(); navigate('home'); }} disabled={!childName.trim() || !childAge} className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all mt-auto" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)', opacity: !childName.trim() || !childAge ? 0.5 : 1 }}>
              Continue <ChevronRight size={18} />
            </button>
            {children.length > 0 && <button onClick={() => navigate('home')} className="w-full text-center text-sm font-bold mt-4" style={{ color: C.tertiary }}>Skip — go to home</button>}
          </div>
        )}

        {/* ═══ HOME ═══ */}
        {screen === 'home' && (
          <div className="flex flex-col pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -right-20 w-72 h-72 organic-blob blur-[80px] opacity-20" style={{ background: C.secondaryFixed }} />
            <div className="absolute top-1/3 -left-32 w-60 h-60 organic-blob blur-[80px] opacity-15" style={{ background: C.primaryFixed }} />

            <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10">
              <h1 style={{ ...HL, fontWeight: 800, fontSize: 20, color: C.primary }}>Kidzplainer</h1>
              <div className="flex items-center gap-2">
                {!isPro && !isAdmin && <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.primaryFixed, color: C.primary }}>{freeLeft} free left</span>}
                {(isPro || isAdmin) && <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.secondaryContainer, color: C.secondary }}>PRO</span>}
              </div>
            </div>

            <div className="px-6 mb-6 relative z-10">
              <h2 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                What did {selectedChild?.name || 'your child'} ask?
              </h2>
            </div>

            <div className="px-6 mb-6 relative z-10">
              <div className="relative flex items-center rounded-2xl p-2 transition-all" style={{ background: C.white, boxShadow: '0 10px 30px -10px rgba(145,75,49,0.12), 0 4px 10px -5px rgba(145,75,49,0.04)' }}>
                <div className="flex items-center flex-1 px-4">
                  <MessageCircle size={18} style={{ color: C.primary + '80', marginRight: 12, flexShrink: 0 }} />
                  <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. 'Why is the sky blue?'" className="w-full bg-transparent border-none outline-none text-base py-3 placeholder:opacity-40" style={{ color: C.onSurface }} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                </div>
                <button onClick={handleGenerate} className="px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-all" style={{ background: C.primary, color: C.onPrimary, boxShadow: '0 4px 12px rgba(145,75,49,0.2)' }}>Explain</button>
              </div>
              {genError && <p className="text-sm mt-2 flex items-center gap-1" style={{ color: '#ba1a1a' }}><AlertCircle size={14} />{genError}</p>}
            </div>

            {children.length > 0 && (
              <div className="px-6 mb-6 relative z-10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {children.map((ch: any) => (
                    <button key={ch.id || ch.name} onClick={() => setSelectedChild(ch)} className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all" style={{ background: selectedChild?.id === ch.id ? C.secondaryContainer : C.white, color: selectedChild?.id === ch.id ? C.secondary : C.onSurfaceVariant }}>{ch.name} ({ch.age})</button>
                  ))}
                  <button onClick={() => navigate('addchild')} className="px-3 py-2 rounded-full" style={{ background: C.surfaceLow }}><Plus size={16} color={C.outline} /></button>
                </div>
              </div>
            )}

            <div className="px-6 mb-6 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.primary + 'cc' }}>Quick Topics</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {TOPICS.map(t => (
                  <button key={t.label} onClick={() => setQuestion(t.q)} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]" style={{ background: C.white, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${C.outlineVariant}20` }}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 mb-6 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.primary + 'cc' }}>What Triggered It?</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TRIGGERS_DATA.map(t => {
                  const sel = selectedTriggers.includes(t.key);
                  return <button key={t.key} onClick={() => setSelectedTriggers(prev => sel ? prev.filter(x => x !== t.key) : [...prev, t.key])} className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-[0.97]" style={{ background: sel ? C.primaryFixed : C.white, border: `1.5px solid ${sel ? C.primary + '30' : C.surfaceHigh}` }}>
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: C.onSurface }}>{t.label}</span>
                  </button>;
                })}
              </div>
            </div>

            <FloatingNav active="home" onNav={navigate} />
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {screen === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center px-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-40 h-40 rounded-full organic-blob animate-pulse opacity-20" style={{ background: C.primaryFixed }} /></div>
            <div className="relative z-10">
              <Loader2 size={40} className="animate-spin mb-6" style={{ color: C.primary }} />
              <h2 style={{ ...HL, fontSize: 24, fontWeight: 800, color: C.onSurface, marginBottom: 8 }}>Crafting the perfect answer...</h2>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>Personalized for {selectedChild?.name}'s age and your values.</p>
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {screen === 'result' && layers && (
          <div className="pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="fixed top-0 left-0 w-full z-50" style={{ background: `${C.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.outlineVariant}15` }}>
              <div className="max-w-[500px] mx-auto flex items-center justify-between px-6 h-16">
                <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full active:scale-90 transition-all"><ArrowLeft size={20} color={C.onSurface} /></button>
                <span className="text-sm font-extrabold uppercase tracking-widest" style={{ ...HL, color: C.primary + 'cc' }}>Kidzplainer</span>
                <button onClick={saveResult} className="p-2 rounded-full"><Bookmark size={18} color={C.onSurface} /></button>
              </div>
            </div>

            <div className="pt-24 px-6">
              <h1 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 12 }}>{question}</h1>
              <p className="text-lg leading-relaxed font-medium mb-10" style={{ color: C.onSurfaceVariant }}>Discover the answer through {layers.length} layers of understanding.</p>

              <p className="text-sm font-bold uppercase tracking-widest mb-4 px-1" style={{ color: C.outline }}>Progressive Insight</p>

              <div className="space-y-4">
                {layers.map((layer: any, i: number) => {
                  const meta = LAYER_META[i] || LAYER_META[0];
                  const isOpen = openLayer === i;
                  return (
                    <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: C.white, border: `1px solid ${C.outlineVariant}20`, boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <button onClick={() => setOpenLayer(isOpen ? -1 : i)} className="w-full flex items-center justify-between p-5 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: meta.softBg }}><span className="text-lg">{meta.icon}</span></div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>Layer {String(i+1).padStart(2,'0')}</p>
                            <h3 style={{ ...HL, fontWeight: 700, fontSize: 17, color: C.onSurface }}>{meta.name}</h3>
                          </div>
                        </div>
                        <ChevronDown size={18} className="transition-transform duration-300" style={{ color: C.outline, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                      </button>
                      <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' }}>
                        <div className="px-5 pb-6">
                          <p className="text-xl font-bold leading-snug italic mb-4" style={{ ...HL, color: C.onSurface }}>"{layer.quote}"</p>
                          {layer.note && <p className="text-sm leading-relaxed mb-4" style={{ color: C.onSurfaceVariant }}>{layer.note}</p>}
                          {layer.nextQ && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: meta.softBg, border: `1px solid ${meta.color}20` }}>
                              <ChevronRight size={14} style={{ color: meta.color, flexShrink: 0 }} />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color + '99' }}>If they ask more</p>
                                <p className="text-sm font-semibold" style={{ color: meta.color }}>{layer.nextQ}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                {[
                  { icon: <Bookmark size={16} />, label: 'Save', action: saveResult },
                  { icon: <Copy size={16} />, label: 'Copy', action: () => { navigator.clipboard.writeText(layers.map((l:any) => `${l.title}: ${l.quote}`).join('\n\n')); setToast('Copied!'); } },
                  { icon: <Share2 size={16} />, label: 'Share', action: () => { if (navigator.share) navigator.share({ title: 'Kidzplainer', text: layers[0]?.quote || question }); } },
                  { icon: isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />, label: isSpeaking ? 'Stop' : 'Read', action: handleSpeak },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} className="flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl font-semibold text-xs transition-all active:scale-[0.97]" style={{ background: C.white, border: `1px solid ${C.outlineVariant}20`, color: C.onSurfaceVariant }}>{a.icon} {a.label}</button>
                ))}
              </div>

              {parentTip && (
                <div className="mt-8 p-6 rounded-2xl" style={{ background: C.secondaryContainer + '40', border: `1px solid ${C.secondaryContainer}60` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>Parent Tip</p>
                  <p className="text-sm leading-relaxed" style={{ color: C.onSurface }}>{parentTip}</p>
                </div>
              )}
            </div>
            <FloatingNav active="home" onNav={navigate} />
          </div>
        )}

        {/* ═══ SAVED ═══ */}
        {screen === 'saved' && (
          <div className="pb-32 px-6 pt-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>Your Library</h2>
            {saved.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl mb-4 block">📚</span>
                <p className="font-bold text-lg" style={{ color: C.onSurface }}>No saved explanations yet</p>
                <p className="text-sm mt-2" style={{ color: C.onSurfaceVariant }}>Your saved answers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {saved.map((s: any) => (
                  <button key={s.id} onClick={() => { setQuestion(s.question); setLayers(s.layers); setOpenLayer(0); navigate('result'); }} className="w-full text-left p-5 rounded-2xl transition-all active:scale-[0.98]" style={{ background: C.white, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p className="font-bold text-base mb-1" style={{ color: C.onSurface }}>{s.question}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: C.onSurfaceVariant }}><span>{s.child?.name}</span><span>·</span><span>{s.date}</span></div>
                  </button>
                ))}
              </div>
            )}
            <FloatingNav active="saved" onNav={navigate} />
          </div>
        )}

        {/* ═══ COMMUNITY ═══ */}
        {screen === 'community' && (
          <div className="pb-32 px-6 pt-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -right-20 w-60 h-60 organic-blob blur-[80px] opacity-20" style={{ background: C.secondaryFixed }} />
            <h2 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Curiosity met with <span style={{ color: C.primary, fontStyle: 'italic' }}>Expertise.</span>
            </h2>
            <p className="text-base mb-8" style={{ color: C.onSurfaceVariant }}>See what other parents are asking.</p>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.primary + 'cc' }}>Community Trending</p>
            <div className="space-y-4 mb-10">
              {[
                { q: '"Where do dreams go when we wake up?"', tag: 'Science & Nature', count: '12 parents joined' },
                { q: '"Why can\'t I always win at games?"', tag: 'Social Skills', count: '84 parents asked today' },
                { q: '"Why did our goldfish go to sleep forever?"', tag: 'Life Events', count: 'Spiking in Toddlers (3-5)' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-[1.5rem]" style={{ background: C.white, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block" style={{ background: C.tertiaryFixed + '40', color: C.tertiary }}>{item.tag}</span>
                  <h3 style={{ ...HL, fontSize: 20, fontWeight: 800, color: C.onSurface, lineHeight: 1.2, marginBottom: 8 }}>{item.q}</h3>
                  <p className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>{item.count}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.primary + 'cc' }}>What Parents Say</p>
            <div className="space-y-4">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-6 rounded-[1.5rem]" style={{ background: C.white, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-0.5 mb-3">{Array.from({length: t.stars}).map((_, s) => <Star key={s} size={14} fill={C.primary} color={C.primary} />)}</div>
                  <p className="text-sm leading-relaxed italic mb-3" style={{ color: C.onSurfaceVariant }}>"{t.text}"</p>
                  <p className="text-xs font-bold" style={{ color: C.onSurface }}>— {t.name}, {t.role}</p>
                </div>
              ))}
            </div>
            <FloatingNav active="community" onNav={navigate} />
          </div>
        )}

        {/* ═══ PAYWALL ═══ */}
        {screen === 'paywall' && (
          <div className="pb-20 px-6 pt-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -left-10 w-64 h-64 organic-blob blur-[100px] opacity-20" style={{ background: C.secondaryFixed }} />
            <button onClick={() => navigate('home')} className="p-2 rounded-full mb-4" style={{ background: C.white }}><X size={18} color={C.primary} /></button>
            <h1 style={{ ...HL, fontSize: 40, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>Turn "Why?" into <span style={{ color: C.primary, fontStyle: 'italic' }}>Wonder.</span></h1>
            <p className="text-base mb-10" style={{ color: C.onSurfaceVariant }}>Unlock unlimited, expert-backed answers for every question.</p>

            <div className="space-y-4 mb-8">
              <button onClick={() => setSelectedPlan('monthly')} className="w-full p-6 rounded-2xl text-left transition-all" style={{ background: selectedPlan === 'monthly' ? C.surfaceLow : C.white, border: `1.5px solid ${selectedPlan === 'monthly' ? C.outlineVariant : 'transparent'}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.onSurfaceVariant }}>Flexible</p>
                <p className="text-xl font-bold" style={{ ...HL, color: C.onSurface }}>Monthly</p>
                <p className="text-3xl font-extrabold mt-2" style={{ color: C.onSurface }}>$4.99<span className="text-base font-medium" style={{ color: C.onSurfaceVariant }}>/mo</span></p>
              </button>

              <button onClick={() => setSelectedPlan('annual')} className="w-full p-6 rounded-[1.5rem] text-left transition-all relative overflow-hidden" style={{ background: C.white, border: `2px solid ${selectedPlan === 'annual' ? C.primary + '50' : C.outlineVariant + '30'}`, boxShadow: selectedPlan === 'annual' ? '0 8px 32px rgba(145,75,49,0.12)' : 'none' }}>
                {selectedPlan === 'annual' && <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.secondary, color: C.onPrimary }}>Save 40%</span>}
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>Most Trusted</p>
                <p className="text-2xl font-bold" style={{ ...HL, color: C.onSurface }}>Annual Premium</p>
                <p className="text-4xl font-extrabold mt-2" style={{ color: C.onSurface }}>$49.99<span className="text-base font-medium" style={{ color: C.onSurfaceVariant }}>/year</span></p>
                <p className="text-sm font-semibold mt-1" style={{ color: C.secondary }}>Less than $4.20 per month</p>
                <div className="mt-4 space-y-2.5">
                  {['7-Day Free Trial Included','Unlimited AI-powered answers','Priority access to new guides','Downloadable parenting tips'].map((f,i) => (
                    <div key={i} className="flex items-center gap-3"><Check size={16} style={{ color: C.secondary }} /><span className="text-sm" style={{ color: i === 0 ? C.onSurface : C.onSurfaceVariant, fontWeight: i === 0 ? 700 : 500 }}>{f}</span></div>
                  ))}
                </div>
              </button>
            </div>

            <button onClick={() => handleCheckout(selectedPlan)} className="w-full py-6 rounded-full font-extrabold text-xl active:scale-[0.97] transition-all" style={{ ...HL, background: `linear-gradient(135deg, ${C.primary}, #b35d3d)`, color: C.onPrimary, boxShadow: '0 20px 40px -12px rgba(145,75,49,0.3)' }}>Unlock All Answers</button>
            <p className="text-center text-[10px] mt-4 font-bold uppercase tracking-widest" style={{ color: C.onSurfaceVariant + '80' }}>Secure Checkout · Cancel Anytime</p>
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {screen === 'settings' && (
          <div className="pb-32 px-6 pt-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>Your Profile</h2>

            <div className="p-6 rounded-2xl mb-6" style={{ background: C.white, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: C.primaryFixed, color: C.primary }}>{userName?.[0]?.toUpperCase() || 'P'}</div>
                <div><p className="font-bold text-lg" style={{ color: C.onSurface }}>{userName}</p><p className="text-sm" style={{ color: C.onSurfaceVariant }}>{user?.email}</p></div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: isPro || isAdmin ? C.secondaryContainer + '50' : C.primaryFixed + '50' }}>
                <span className="text-sm">{isPro || isAdmin ? '✨' : '🔓'}</span>
                <span className="text-xs font-bold" style={{ color: isPro || isAdmin ? C.secondary : C.primary }}>{isPro || isAdmin ? 'Pro Member' : `Free Plan · ${freeLeft} left`}</span>
              </div>
            </div>

            <div className="space-y-3">
              {[{ label: 'Language', value: selLanguage },{ label: 'Country', value: selCountry },{ label: 'Worldview', value: selBelief }].map((item, i) => (
                <button key={i} onClick={() => { setSetupStep(i + 2); navigate('setup'); }} className="w-full flex items-center justify-between p-5 rounded-2xl active:scale-[0.98] transition-all" style={{ background: C.white }}>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.onSurfaceVariant + 'b0' }}>{item.label}</p><p className="font-semibold text-base" style={{ color: C.onSurface }}>{item.value || 'Not set'}</p></div>
                  <ChevronRight size={18} color={C.outline} />
                </button>
              ))}

              {!isPro && !isAdmin && (
                <button onClick={() => navigate('paywall')} className="w-full p-5 rounded-2xl text-left" style={{ background: C.primaryFixed + '60' }}>
                  <p className="font-bold" style={{ color: C.primary }}>Upgrade to Pro</p>
                  <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>Unlimited answers, priority features</p>
                </button>
              )}

              <button onClick={() => { setLegalPage('privacy'); navigate('legal'); }} className="w-full flex items-center justify-between p-5 rounded-2xl" style={{ background: C.white }}>
                <span className="font-semibold" style={{ color: C.onSurface }}>Privacy Policy</span><ChevronRight size={18} color={C.outline} />
              </button>
              <button onClick={() => { setLegalPage('terms'); navigate('legal'); }} className="w-full flex items-center justify-between p-5 rounded-2xl" style={{ background: C.white }}>
                <span className="font-semibold" style={{ color: C.onSurface }}>Terms of Service</span><ChevronRight size={18} color={C.outline} />
              </button>

              <button onClick={async () => { await signOut(); navigate('onboarding'); }} className="w-full p-5 rounded-2xl flex items-center gap-3" style={{ background: C.errorContainer + '40' }}>
                <LogOut size={18} color="#ba1a1a" /><span className="font-bold" style={{ color: '#ba1a1a' }}>Sign Out</span>
              </button>
            </div>
            <FloatingNav active="settings" onNav={navigate} />
          </div>
        )}

        {/* ═══ LEGAL ═══ */}
        {screen === 'legal' && (
          <div className="px-6 py-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <button onClick={() => navigate('settings')} className="p-2 rounded-full mb-6" style={{ background: C.white }}><ArrowLeft size={18} color={C.onSurface} /></button>
            <h2 style={{ ...HL, fontSize: 28, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>{legalPage === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h2>
            <div className="p-6 rounded-2xl text-sm leading-relaxed" style={{ background: C.white, color: C.onSurfaceVariant }}>
              {legalPage === 'privacy' ? (
                <div className="space-y-4">
                  <p><strong>Last updated:</strong> March 2026</p>
                  <p>Kidzplainer respects your privacy. We collect only what is necessary to provide personalized, age-appropriate explanations.</p>
                  <p><strong>Data We Collect:</strong> Email, child's first name and age group, cultural preferences, usage data.</p>
                  <p><strong>How We Use It:</strong> To personalize AI-generated explanations and manage subscriptions.</p>
                  <p><strong>Security:</strong> All data is encrypted. We never sell your information.</p>
                  <p><strong>Your Rights:</strong> Request deletion at support@kidzplainer.com.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p><strong>Last updated:</strong> March 2026</p>
                  <p>By using Kidzplainer, you agree to these terms. The service provides AI-generated educational content.</p>
                  <p><strong>Subscriptions:</strong> Free users get {MAX_FREE} explanations. Pro subscriptions auto-renew unless cancelled.</p>
                  <p><strong>Disclaimer:</strong> Explanations are AI-generated suggestions. Use your judgment.</p>
                  <p><strong>Cancellation:</strong> Cancel anytime through account settings.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
