'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, ArrowLeft, ChevronDown, ChevronRight, Search, Moon, Sun, Bookmark, Copy, Share2, Volume2, Settings, Home, BookOpen, Plus, X, Check, AlertCircle, Lock, CreditCard, Shield, FileText, RefreshCw, Eye, EyeOff, Loader2, Sparkles, ChevronUp, Tv, Smartphone, Users, School, Ear, Globe, Star, Heart, Baby, LogOut, User, Mail, KeyRound, Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signInWithEmail, signUp, signOut, resetPassword } from "@/lib/auth";
import * as db from "@/lib/db";
import { supabase } from "@/lib/supabase";

// ═══════════════════════════════════════
// CHILDTRUTHS — PRODUCTION APP
// ═══════════════════════════════════════

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
  {icon:"🕌",name:"Islam",desc:"References to Allah, Quran, Islamic values"},
  {icon:"✝️",name:"Christianity",desc:"References to God, Jesus, Biblical values"},
  {icon:"🕉️",name:"Hinduism",desc:"References to dharma, karma, soul's journey"},
  {icon:"✡️",name:"Judaism",desc:"References to God, Torah, Jewish values"},
  {icon:"☸️",name:"Buddhism",desc:"References to compassion, mindfulness, cycle of life"},
  {icon:"🌿",name:"Spiritual",desc:"Universe, energy, connectedness — no doctrine"},
  {icon:"🔬",name:"Secular",desc:"Science-based, no religious framing"},
];

const LANGUAGES = [
  {flag:"🇬🇧",name:"English"},{flag:"🇸🇦",name:"العربية"},{flag:"🇮🇳",name:"हिन्दी"},
  {flag:"🇪🇸",name:"Español"},{flag:"🇫🇷",name:"Français"},{flag:"🇨🇳",name:"中文"},
  {flag:"🇵🇹",name:"Português"},{flag:"🇩🇪",name:"Deutsch"}
];

const TRIGGERS = [
  {icon: Tv, label:"TV / Movie", key:"tv"},
  {icon: Smartphone, label:"iPad / Phone", key:"ipad"},
  {icon: Users, label:"Friend told them", key:"friend"},
  {icon: School, label:"At school", key:"school"},
  {icon: Ear, label:"Overheard adults", key:"overheard"},
  {icon: Globe, label:"Real event", key:"event"},
];

const TOPICS = [
  {emoji:"👶",label:"Babies",q:"Where do babies come from?"},
  {emoji:"🕊️",label:"Death",q:"Why do people die?"},
  {emoji:"💔",label:"Divorce",q:"Why are you and dad splitting up?"},
  {emoji:"❓",label:"Sex",q:"What is sex?"},
  {emoji:"🌙",label:"Afterlife",q:"What happens after we die?"},
  {emoji:"🏥",label:"Illness",q:"What happens when someone gets really sick?"},
];

// Call generate API with auth
async function generateLayers(question: string, childName: string, age: string, country: string, belief: string, trigger: string, triggerDetail: string, language: string, accessToken: string) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ question, childName, age, country, belief, trigger, triggerDetail, language }),
  });

  if (response.status === 402) {
    throw new Error("FREE_LIMIT_REACHED");
  }
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  return response.json();
}

// ═══════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════

function Logo({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative" style={{width:size,height:size}}>
        <div className="absolute inset-0 rounded-lg" style={{background:'linear-gradient(135deg,var(--ac),var(--a3))'}} />
        <MessageCircle size={size*0.55} className="absolute" style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)',color:'white',strokeWidth:2.5}} />
      </div>
      <span className="font-bold tracking-tight" style={{fontFamily:'Baloo 2,cursive',fontSize:size*0.65,color:'var(--t1)'}}>ChildTruths</span>
    </div>
  );
}

function FamilyLogo({ size = 120 }) {
  const s = size;
  return (
    <div className="relative" style={{ width: s, height: s }}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" width={s} height={s}>
        {/* Background circle with glow */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2dd4a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2dd4a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4a8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#glow)" />

        {/* Father - left */}
        <circle cx="65" cy="62" r="18" fill="url(#bodyGrad)" opacity="0.9" />
        <path d="M65 82 C45 82 38 100 38 115 Q38 130 52 130 L78 130 Q92 130 92 115 C92 100 85 82 65 82Z" fill="url(#bodyGrad)" opacity="0.85" />

        {/* Mother - right */}
        <circle cx="135" cy="62" r="18" fill="#818cf8" opacity="0.9" />
        <path d="M135 82 C115 82 108 100 108 115 Q108 130 122 130 L148 130 Q162 130 162 115 C162 100 155 82 135 82Z" fill="#818cf8" opacity="0.85" />

        {/* Child - center front */}
        <circle cx="100" cy="100" r="14" fill="#f472b6" opacity="0.95" />
        <path d="M100 116 C85 116 80 128 80 138 Q80 150 90 150 L110 150 Q120 150 120 138 C120 128 115 116 100 116Z" fill="#f472b6" opacity="0.9" />

        {/* Heart above */}
        <path d="M100 42 C96 34 86 34 86 42 C86 50 100 58 100 58 C100 58 114 50 114 42 C114 34 104 34 100 42Z" fill="#f472b6" opacity="0.7" />

        {/* Speech bubble - small */}
        <path d="M148 38 Q148 28 158 28 L172 28 Q182 28 182 38 L182 48 Q182 58 172 58 L162 58 L156 66 L158 58 L158 58 Q148 58 148 48 Z" fill="#2dd4a8" opacity="0.6" />
        <circle cx="160" cy="43" r="2" fill="white" opacity="0.8" />
        <circle cx="166" cy="43" r="2" fill="white" opacity="0.8" />
        <circle cx="172" cy="43" r="2" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}

function IconBtn({ icon: Icon, size = 18, onClick, className = "", badge }) {
  return (
    <button onClick={onClick} className={`relative flex items-center justify-center rounded-xl border transition-all duration-200 hover:border-[var(--ac)] active:scale-95 ${className}`}
      style={{width:40,height:40,background:'var(--bg2)',borderColor:'var(--brc)'}}>
      <Icon size={size} style={{color:'var(--t2)'}} />
      {badge && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{background:'var(--a2)',color:'white'}}>{badge}</span>}
    </button>
  );
}

function Input({ label, icon: Icon, type = "text", value, onChange, placeholder, error, rightIcon, onRightClick }) {
  const [show, setShow] = useState(false);
  const actualType = type === "password" && show ? "text" : type;
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{color:'var(--t3)'}}>{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--t3)'}} />}
        <input type={actualType} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border text-sm font-medium outline-none transition-all duration-200 focus:border-[var(--ac)]"
          style={{padding: Icon ? '12px 12px 12px 36px' : '12px 14px', background:'var(--bgi)',borderColor: error ? 'var(--a2)' : 'var(--brc)', color:'var(--t1)'}} />
        {type === "password" && (
          <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {show ? <EyeOff size={16} style={{color:'var(--t3)'}} /> : <Eye size={16} style={{color:'var(--t3)'}} />}
          </button>
        )}
        {rightIcon && <button onClick={onRightClick} className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</button>}
      </div>
      {error && <p className="text-[11px] mt-1 font-medium flex items-center gap-1" style={{color:'var(--a2)'}}><AlertCircle size={12}/>{error}</p>}
    </div>
  );
}

function Chip({ selected, onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`rounded-xl border text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 ${className}`}
      style={{
        padding:'10px 14px',
        background: selected ? 'var(--ac)' : 'var(--chb)',
        color: selected ? 'var(--chat)' : 'var(--t2)',
        borderColor: selected ? 'var(--ac)' : 'var(--chbr)',
      }}>
      {children}
    </button>
  );
}

function BottomNav({ active, onNav }) {
  const items = [
    { key:'home', icon: Home, label:'Home' },
    { key:'saved', icon: BookOpen, label:'Saved' },
    { key:'settings', icon: Settings, label:'Settings' },
  ];
  return (
    <div className="sticky bottom-0 left-0 right-0 flex justify-around border-t backdrop-blur-xl" style={{background:'var(--nav)',borderColor:'var(--brs)',padding:'8px 0 24px'}}>
      {items.map(it => (
        <button key={it.key} onClick={() => onNav(it.key)} className="flex flex-col items-center gap-0.5 relative" style={{opacity: active === it.key ? 1 : 0.4, transition:'opacity 0.2s'}}>
          {active === it.key && <div className="absolute -top-2 w-5 h-[3px] rounded-full" style={{background:'var(--ac)'}} />}
          <it.icon size={18} style={{color:'var(--t1)'}} />
          <span className="text-[9px] font-bold" style={{color:'var(--t1)'}}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function LayerCard({ layer, isOpen, onToggle, index }) {
  const colors = ['#2dd4a8','#818cf8','#f472b6','#fbbf24'];
  const bgColors = ['rgba(45,212,168,0.08)','rgba(129,140,248,0.08)','rgba(244,114,182,0.08)','rgba(251,191,36,0.08)'];
  const c = colors[index] || colors[0];
  const bg = bgColors[index] || bgColors[0];
  return (
    <div className="mx-5 mb-3 rounded-2xl overflow-hidden transition-all" style={{background:'var(--bg2)',border: isOpen ? `1px solid ${c}33` : '1px solid var(--brc)',boxShadow: isOpen ? `0 4px 20px ${c}15` : 'none'}}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-5 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-extrabold text-white" style={{background:`linear-gradient(135deg, ${c}, ${c}cc)`,boxShadow:`0 3px 10px ${c}40`}}>{layer.level}</div>
          <div>
            <div className="text-[15px] font-bold" style={{color:'var(--t1)'}}>{layer.title}</div>
            <div className="text-[12px] mt-0.5" style={{color:'var(--t3)'}}>{layer.subtitle}</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:'var(--bg0)'}}>
          <ChevronDown size={16} style={{color:'var(--t3)',transition:'transform 0.3s ease',transform:isOpen?'rotate(180deg)':'rotate(0)'}} />
        </div>
      </button>
      <div style={{maxHeight:isOpen?800:0,overflow:'hidden',transition:'max-height 0.5s ease-in-out'}}>
        <div className="px-5 pb-5">
          {/* Quote */}
          <div className="rounded-xl p-5 mb-3 relative" style={{background:bg,borderLeft:`3px solid ${c}`}}>
            <p className="text-[15px] italic leading-[1.7] font-medium" style={{color:'var(--t1)'}}>{layer.quote}</p>
          </div>
          {/* Note */}
          <p className="text-[12px] leading-relaxed mb-3 px-1" style={{color:'var(--t3)'}}>{layer.note}</p>
          {/* Next question prompt */}
          {layer.nextQ && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all" style={{background:'var(--a2g)',border:'1px solid rgba(244,114,182,0.15)'}}>
              <ChevronRight size={14} style={{color:'var(--a2)'}} />
              <span className="text-[12px] font-semibold" style={{color:'var(--a2)'}}>{layer.nextQ}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════

export function AppShell() {
  const { user, session, loading: authContextLoading } = useAuth();

  const [dark, setDark] = useState(true);
  const [screen, setScreen] = useState('splash');
  const [prevScreen, setPrevScreen] = useState(null);

  // Auth
  const [authMode, setAuthMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Setup
  const [setupStep, setSetupStep] = useState(1);
  const [selLanguage, setSelLanguage] = useState('English');
  const [selCountry, setSelCountry] = useState('');
  const [selBelief, setSelBelief] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Children
  const [children, setChildren] = useState([]);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [showAddChild, setShowAddChild] = useState(false);

  // Home
  const [question, setQuestion] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [triggerDetail, setTriggerDetail] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  // Result
  const [layers, setLayers] = useState(null);
  const [parentTip, setParentTip] = useState('');
  const [misinfoTip, setMisinfoTip] = useState('');
  const [openLayer, setOpenLayer] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Usage
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const MAX_FREE = 3;

  // Saved
  const [saved, setSaved] = useState([]);

  // Legal
  const [legalPage, setLegalPage] = useState(null);

  // Data loading flag
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = (s) => { setPrevScreen(screen); setScreen(s); };

  // Handle auth state from Supabase
  const dataLoadedRef = useRef(false);
  useEffect(() => {
    if (authContextLoading) return;

    if (user && session) {
      setIsLoggedIn(true);
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Parent');

      // Only load data once per session
      if (dataLoadedRef.current) return;
      dataLoadedRef.current = true;

      // Load user data from Supabase
      const loadUserData = async () => {
        try {
          // Try to get profile - might not exist yet for new users
          let profile = null;
          try {
            profile = await db.getProfile(user.id);
          } catch (e) {
            console.log('Profile not found, will create during setup');
          }

          let childrenData = [];
          try {
            childrenData = await db.getChildren(user.id);
          } catch (e) {
            console.log('No children found');
          }

          let usageData = 0;
          try {
            usageData = await db.getUsageCount(user.id);
          } catch (e) {
            console.log('No usage data');
          }

          let subscription = null;
          try {
            subscription = await db.getSubscription(user.id);
          } catch (e) {
            console.log('No subscription');
          }

          if (profile) {
            if (profile.language) setSelLanguage(profile.language);
            if (profile.country) setSelCountry(profile.country);
            if (profile.belief) setSelBelief(profile.belief);
          }

          if (childrenData && childrenData.length > 0) {
            const mapped = childrenData.map(c => ({ id: c.id, name: c.name, age: c.age_range }));
            setChildren(mapped);
            setSelectedChild(mapped[0]);
          }

          setUsageCount(usageData);
          setIsPro(!!subscription);
          setDataLoaded(true);

          // If user has profile + children, skip setup
          if (profile?.country && profile?.belief && childrenData && childrenData.length > 0) {
            if (screen === 'splash' || screen === 'onboarding' || screen === 'auth') {
              navigate('home');
            }
          } else if (profile?.country && profile?.belief) {
            navigate('addchild');
          } else {
            navigate('setup');
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          setDataLoaded(true);
          navigate('setup');
        }
      };
      loadUserData();

      // Load saved explanations
      db.getSavedExplanations(user.id).then(explanations => {
        const mapped = explanations.map(e => ({
          id: e.id,
          question: e.question,
          child: { name: e.children?.name || 'Child', age: e.children?.age_range || '' },
          layers: e.layers,
          date: new Date(e.created_at).toLocaleDateString(),
          country: e.country,
          belief: e.belief,
          triggers: e.triggers || [],
        }));
        setSaved(mapped);
      }).catch(console.error);
    } else if (!authContextLoading) {
      setIsLoggedIn(false);
      setDataLoaded(false);
      dataLoadedRef.current = false;
    }
  }, [user, session, authContextLoading]);

  // Splash timer - wait for auth to finish loading before deciding
  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => {
        if (authContextLoading) return; // still loading, wait
        if (user) return; // user exists, auth useEffect will handle navigation
        navigate('onboarding');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [screen, authContextLoading, user]);

  // Theme
  useEffect(() => {
    document.documentElement.style.setProperty('--bg0', dark ? '#0A0E17' : '#F8FAFC');
  }, [dark]);

  const themeVars = dark ? {
    '--bg0':'#0A0E17','--bg1':'#111827','--bg2':'#1A2235','--bgi':'#141C2E',
    '--brs':'rgba(255,255,255,0.06)','--brc':'rgba(255,255,255,0.08)',
    '--t1':'#F1F5F9','--t2':'#94A3B8','--t3':'#64748B',
    '--ac':'#22D3B7','--acg':'rgba(34,211,183,0.15)','--acs':'rgba(34,211,183,0.1)',
    '--a2':'#F472B6','--a2g':'rgba(244,114,182,0.12)',
    '--a3':'#818CF8','--a3g':'rgba(129,140,248,0.12)',
    '--a4':'#FBBF24','--a4g':'rgba(251,191,36,0.12)',
    '--sh':'0 4px 24px rgba(0,0,0,0.3)',
    '--nav':'rgba(10,14,23,0.95)',
    '--chb':'rgba(255,255,255,0.06)','--chbr':'rgba(255,255,255,0.1)',
    '--chat':'#0A0E17',
    '--sg':'linear-gradient(135deg,rgba(34,211,183,0.08),rgba(129,140,248,0.06),rgba(244,114,182,0.04))',
  } : {
    '--bg0':'#F8FAFC','--bg1':'#FFFFFF','--bg2':'#FFFFFF','--bgi':'#F1F5F9',
    '--brs':'rgba(0,0,0,0.06)','--brc':'rgba(0,0,0,0.08)',
    '--t1':'#0F172A','--t2':'#475569','--t3':'#94A3B8',
    '--ac':'#0D9488','--acg':'rgba(13,148,136,0.1)','--acs':'rgba(13,148,136,0.06)',
    '--a2':'#EC4899','--a2g':'rgba(236,72,153,0.08)',
    '--a3':'#6366F1','--a3g':'rgba(99,102,241,0.08)',
    '--a4':'#F59E0B','--a4g':'rgba(245,158,11,0.08)',
    '--sh':'0 2px 16px rgba(0,0,0,0.06)',
    '--nav':'rgba(255,255,255,0.95)',
    '--chb':'rgba(0,0,0,0.04)','--chbr':'rgba(0,0,0,0.1)',
    '--chat':'#FFFFFF',
    '--sg':'linear-gradient(135deg,rgba(13,148,136,0.06),rgba(99,102,241,0.04),rgba(236,72,153,0.03))',
  };

  const handleAuth = async (mode) => {
    setAuthError('');
    if (!email.trim()) return setAuthError('Email is required');
    if (!email.includes('@')) return setAuthError('Please enter a valid email');

    if (mode === 'forgot') {
      setAuthLoading(true);
      try {
        await resetPassword(email);
        setAuthError('');
        setAuthMode('login');
        alert('Check your email for a password reset link.');
      } catch (err: any) {
        setAuthError(err.message || 'Failed to send reset email');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!password) return setAuthError('Password is required');
    if (password.length < 6) return setAuthError('Password must be at least 6 characters');
    if (mode === 'signup' && password !== confirmPass) return setAuthError('Passwords do not match');

    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        alert('Check your email to confirm your account.');
        setAuthMode('login');
      } else {
        await signInWithEmail(email, password);
        // Auth state change listener will handle navigation
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      // Redirects to Google OAuth - auth state change will handle the rest
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed');
      setAuthLoading(false);
    }
  };

  const addChild = async () => {
    if (!childName.trim() || !childAge || !user) return;
    try {
      const newChild = await db.addChild(user.id, childName.trim(), childAge);
      setChildren(prev => [...prev, { name: newChild.name, age: newChild.age_range, id: newChild.id }]);
      setChildName('');
      setChildAge('');
      setShowAddChild(false);
    } catch (err) {
      console.error('Error adding child:', err);
    }
  };

  const handleGenerate = async () => {
    if (!question.trim()) return setGenError('Please enter your child\'s question');
    if (!selectedChild) return setGenError('Please select a child');
    if (usageCount >= MAX_FREE && !isPro) { navigate('paywall'); return; }

    setGenError('');
    setGenerating(true);
    navigate('loading');

    try {
      const token = session?.access_token || '';
      const result = await generateLayers(
        question, selectedChild.name, selectedChild.age,
        selCountry, selBelief, selectedTriggers.join(', '),
        triggerDetail, selLanguage, token
      );
      setLayers(result.layers);
      setParentTip(result.parentTip);
      setMisinfoTip(result.misinfoTip);
      setOpenLayer(0);
      setUsageCount(prev => prev + 1);
      navigate('result');
    } catch (err: any) {
      if (err.message === 'FREE_LIMIT_REACHED') {
        navigate('paywall');
        return;
      }
      setGenError('Failed to generate explanation. Please try again.');
      navigate('home');
    } finally {
      setGenerating(false);
    }
  };

  const saveResult = async () => {
    if (!layers || !selectedChild || !user) return;
    try {
      const saved_entry = await db.saveExplanation(user.id, {
        child_id: selectedChild.id,
        question,
        triggers: selectedTriggers,
        trigger_detail: triggerDetail,
        layers,
        parent_tip: parentTip,
        misinfo_tip: misinfoTip,
        country: selCountry,
        belief: selBelief,
        language: selLanguage,
      });
      setSaved(prev => [{
        id: saved_entry.id, question, child: selectedChild, layers,
        date: new Date().toLocaleDateString(), country: selCountry, belief: selBelief,
        triggers: selectedTriggers,
      }, ...prev]);
    } catch (err) {
      console.error('Error saving explanation:', err);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="flex flex-col items-center min-h-screen" style={{fontFamily:'Plus Jakarta Sans, sans-serif'}}>
      <div className="w-full max-w-[500px] overflow-hidden relative" style={{...themeVars, background:'var(--bg0)', minHeight:'100vh', transition:'all 0.4s'}}>

        {/* Theme toggle */}
        {screen !== 'splash' && (
          <button onClick={() => setDark(!dark)} className="absolute top-4 right-4 z-50 w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:border-[var(--ac)]"
            style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
            {dark ? <Moon size={16} style={{color:'var(--t2)'}} /> : <Sun size={16} style={{color:'var(--t2)'}} />}
          </button>
        )}

        {/* ═══ SPLASH ═══ */}
        {screen === 'splash' && (
          <div className="flex flex-col items-center justify-center text-center relative overflow-hidden" style={{background:'#0A0E17',minHeight:'100vh'}}>
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" style={{opacity:0.35}} />
              <div className="absolute inset-0" style={{background:'linear-gradient(0deg, #0A0E17 0%, transparent 50%, #0A0E17 100%)'}} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <FamilyLogo size={80} />
              <div className="text-3xl font-extrabold mt-3" style={{fontFamily:'Baloo 2,cursive',color:'white'}}>ChildTruths</div>
              <Loader2 size={20} className="mt-8 animate-spin" style={{color:'#2dd4a8'}} />
            </div>
          </div>
        )}

        {/* ═══ ONBOARDING ═══ */}
        {screen === 'onboarding' && (
          <div className="flex flex-col relative overflow-hidden" style={{background:'#0A0E17',minHeight:'100vh'}}>
            {/* Full-screen background image */}
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" style={{opacity:0.5}} />
              <div className="absolute inset-0" style={{background:'linear-gradient(0deg, #0A0E17 5%, rgba(10,14,23,0.85) 45%, rgba(10,14,23,0.4) 70%, rgba(10,14,23,0.6) 100%)'}} />
            </div>

            {/* Content at bottom like Upwork */}
            <div className="relative z-10 flex flex-col flex-1 justify-end px-6 pb-10">
              <div className="flex items-center gap-2 mb-4">
                <FamilyLogo size={36} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{color:'rgba(255,255,255,0.5)',letterSpacing:'0.15em'}}>ChildTruths</span>
              </div>

              <h1 className="text-[38px] font-extrabold leading-[1.1] mb-3" style={{fontFamily:'Plus Jakarta Sans,sans-serif',color:'white'}}>
                The hard talks,<br/>
                <span style={{color:'#2dd4a8'}}>made simple.</span>
              </h1>

              <p className="text-[15px] leading-relaxed mb-8 max-w-[320px]" style={{color:'rgba(255,255,255,0.65)'}}>
                Age-tuned, culturally aware explanations for every question your child asks. Start gentle. Go deeper only if they keep asking.
              </p>

              <button onClick={() => navigate('auth')} className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]" style={{background:'#2dd4a8',color:'#0A0E17',boxShadow:'0 8px 32px rgba(45,212,168,0.35)'}}>
                Get Started
              </button>

              <p className="text-center text-[12px] mt-4" style={{color:'rgba(255,255,255,0.35)'}}>
                Already have an account? <button onClick={() => navigate('auth')} className="font-bold underline" style={{color:'rgba(255,255,255,0.6)'}}>Sign in</button>
              </p>
            </div>
          </div>
        )}

        {/* ═══ AUTH ═══ */}
        {screen === 'auth' && (
          <div className="flex flex-col min-h-[836px] px-6 pt-6 pb-8" style={{background:'var(--bg0)'}}>
            <Logo size={28} className="mb-8" />

            <h2 className="text-2xl font-extrabold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>
              {authMode === 'login' ? 'Welcome back' : authMode === 'signup' ? 'Create account' : 'Reset password'}
            </h2>
            <p className="text-sm mb-6" style={{color:'var(--t3)'}}>
              {authMode === 'login' ? 'Sign in to continue' : authMode === 'signup' ? 'Start your free trial — 3 explanations/month' : 'We\'ll send you a reset link'}
            </p>

            {authMode !== 'forgot' && (
              <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 mb-4 transition-all hover:border-[var(--ac)]"
                style={{background:'var(--bg2)',borderColor:'var(--brc)',color:'var(--t1)'}}>
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                  Continue with Google
                </>}
              </button>
            )}

            {authMode !== 'forgot' && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{background:'var(--brs)'}} />
                <span className="text-[11px] font-semibold" style={{color:'var(--t3)'}}>or</span>
                <div className="flex-1 h-px" style={{background:'var(--brs)'}} />
              </div>
            )}

            <Input label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="parent@example.com" error={authError && authError.includes('email') ? authError : ''} />

            {authMode !== 'forgot' && (
              <Input label="Password" icon={KeyRound} type="password" value={password} onChange={setPassword} placeholder="••••••••" error={authError && authError.includes('assword') ? authError : ''} />
            )}

            {authMode === 'signup' && (
              <Input label="Confirm Password" icon={KeyRound} type="password" value={confirmPass} onChange={setConfirmPass} placeholder="••••••••" error={authError && authError.includes('match') ? authError : ''} />
            )}

            {authError && !authError.includes('email') && !authError.includes('assword') && !authError.includes('match') && (
              <p className="text-[12px] font-medium flex items-center gap-1 mb-3" style={{color:'var(--a2)'}}><AlertCircle size={14}/>{authError}</p>
            )}

            {authMode === 'login' && (
              <button onClick={() => setAuthMode('forgot')} className="text-[12px] font-semibold mb-4 text-right" style={{color:'var(--ac)'}}>Forgot password?</button>
            )}

            <button onClick={() => handleAuth(authMode)} disabled={authLoading}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{background:'linear-gradient(135deg,var(--ac),#1AB5A0)',color: dark ? '#0A0E17' : '#fff',boxShadow:'0 6px 20px rgba(34,211,183,0.25)',opacity: authLoading ? 0.6 : 1}}>
              {authLoading ? <Loader2 size={18} className="animate-spin" /> :
                authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>

            <div className="mt-4 text-center">
              {authMode === 'login' ? (
                <p className="text-[13px]" style={{color:'var(--t3)'}}>Don't have an account? <button onClick={() => {setAuthMode('signup');setAuthError('')}} className="font-bold" style={{color:'var(--ac)'}}>Sign up</button></p>
              ) : (
                <p className="text-[13px]" style={{color:'var(--t3)'}}>Already have an account? <button onClick={() => {setAuthMode('login');setAuthError('')}} className="font-bold" style={{color:'var(--ac)'}}>Sign in</button></p>
              )}
            </div>

            <div className="mt-auto pt-6 flex justify-center gap-4">
              {[['Privacy Policy','privacy'],['Terms of Service','terms']].map(([l,k]) => (
                <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="text-[11px] font-medium" style={{color:'var(--t3)'}}>{l}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SETUP ═══ */}
        {screen === 'setup' && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            <div className="px-6 pt-5 pb-0">
              <h2 className="text-[22px] font-extrabold" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>Quick setup ⚡</h2>
              <p className="text-[13px] mb-4" style={{color:'var(--t3)'}}>3 taps. That's it.</p>
              <div className="flex gap-1.5 mb-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-1 rounded-full flex-1 transition-all duration-400" style={{background: i <= setupStep ? 'var(--ac)' : 'var(--chb)', boxShadow: i === setupStep ? '0 0 8px var(--acg)' : 'none'}} />
                ))}
              </div>
            </div>

            <div className="flex-1 px-6 pb-6 overflow-y-auto" style={{scrollbarWidth:'none'}}>
              {setupStep === 1 && (
                <>
                  <p className="text-lg font-bold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>What language do you speak at home?</p>
                  <p className="text-[13px] mb-5" style={{color:'var(--t3)'}}>Explanations will be in this language.</p>
                  <div className="flex flex-col gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.name} onClick={() => {setSelLanguage(l.name);setSetupStep(2)}}
                        className="flex items-center gap-3 p-3.5 rounded-xl border text-left text-[15px] font-semibold transition-all hover:translate-x-1 hover:border-[var(--ac)]"
                        style={{background: selLanguage===l.name ? 'var(--ac)' : 'var(--chb)', color: selLanguage===l.name ? 'var(--chat)' : 'var(--t2)', borderColor: selLanguage===l.name ? 'var(--ac)' : 'var(--chbr)'}}>
                        <span className="text-xl">{l.flag}</span>{l.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {setupStep === 2 && (
                <>
                  <p className="text-lg font-bold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>Where are you raising your child?</p>
                  <p className="text-[13px] mb-4" style={{color:'var(--t3)'}}>A 5-year-old in India has different context than one in the US. We figure out the cultural nuance from this.</p>
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--t3)'}} />
                    <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search country..."
                      className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:border-[var(--ac)]"
                      style={{background:'var(--bgi)',borderColor:'var(--brc)',color:'var(--t1)'}} />
                  </div>
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto" style={{scrollbarWidth:'none'}}>
                    {filteredCountries.map(c => (
                      <button key={c.name} onClick={() => {setSelCountry(c.name);setSetupStep(3)}}
                        className="flex items-center gap-3 p-3.5 rounded-xl border text-left text-[15px] font-semibold transition-all hover:translate-x-1 hover:border-[var(--ac)]"
                        style={{background: selCountry===c.name ? 'var(--ac)' : 'var(--chb)', color: selCountry===c.name ? 'var(--chat)' : 'var(--t2)', borderColor: selCountry===c.name ? 'var(--ac)' : 'var(--chbr)'}}>
                        <span className="text-xl">{c.flag}</span>{c.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {setupStep === 3 && (
                <>
                  <p className="text-lg font-bold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>What does your family believe?</p>
                  <p className="text-[13px] mb-5 leading-relaxed" style={{color:'var(--t3)'}}>This shapes how we frame answers — especially around death, purpose, and relationships. Always truthful. This adjusts framing, not facts.</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {BELIEFS.map(b => (
                      <button key={b.name} onClick={() => setSelBelief(b.name)}
                        className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:translate-x-1 hover:border-[var(--ac)]"
                        style={{background: selBelief===b.name ? 'var(--ac)' : 'var(--chb)', color: selBelief===b.name ? 'var(--chat)' : 'var(--t2)', borderColor: selBelief===b.name ? 'var(--ac)' : 'var(--chbr)'}}>
                        <span className="text-xl flex-shrink-0">{b.icon}</span>
                        <div>
                          <div className="text-[15px] font-semibold">{b.name}</div>
                          <div className="text-[11px] opacity-70">{b.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button disabled={!selBelief} onClick={async () => {
                    if (user) {
                      try {
                        await db.upsertProfile(user.id, {
                          email: user.email,
                          name: userName,
                          language: selLanguage,
                          country: selCountry,
                          belief: selBelief,
                        });
                      } catch (err) { console.error('Error saving profile:', err); }
                    }
                    navigate('addchild');
                  }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all hover:-translate-y-0.5"
                    style={{background:'linear-gradient(135deg,var(--ac),#1AB5A0)',color: dark ? '#0A0E17' : '#fff',boxShadow:'0 6px 20px rgba(34,211,183,0.25)',opacity:selBelief?1:0.3}}>
                    Done — Add your child →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ ADD CHILD ═══ */}
        {screen === 'addchild' && (
          <div className="flex flex-col min-h-[836px] px-6 pt-6 pb-8" style={{background:'var(--bg0)'}}>
            <Logo size={24} className="mb-6" />
            <h2 className="text-[22px] font-extrabold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>Add your child 👶</h2>
            <p className="text-[13px] mb-6" style={{color:'var(--t3)'}}>We use their first name in explanations for a personal touch. You can add more children later.</p>

            <Input label="Child's first name" icon={User} value={childName} onChange={setChildName} placeholder="e.g. Omar, Sarah, Arjun" />

            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{color:'var(--t3)'}}>Age</label>
              <div className="grid grid-cols-4 gap-2">
                {['3-5','6-8','9-11','12-14'].map(a => (
                  <button key={a} onClick={() => setChildAge(a)}
                    className="py-3 rounded-xl border text-[13px] font-bold text-center transition-all"
                    style={{background: childAge===a ? 'var(--ac)' : 'var(--chb)', color: childAge===a ? 'var(--chat)' : 'var(--t2)', borderColor: childAge===a ? 'var(--ac)' : 'var(--chbr)'}}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {children.length > 0 && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{color:'var(--t3)'}}>Added children</label>
                {children.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border mb-2" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
                    <div className="flex items-center gap-2">
                      <Baby size={16} style={{color:'var(--ac)'}} />
                      <span className="text-sm font-semibold" style={{color:'var(--t1)'}}>{c.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{background:'var(--a3g)',color:'var(--a3)'}}>{c.age}</span>
                    </div>
                    <button onClick={() => setChildren(prev => prev.filter(x => x.id !== c.id))}><X size={14} style={{color:'var(--t3)'}} /></button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={async () => {
              if (childName.trim() && childAge && user) {
                try {
                  const newChild = await db.addChild(user.id, childName.trim(), childAge);
                  const mapped = { name: newChild.name, age: newChild.age_range, id: newChild.id };
                  setChildren(prev => [...prev, mapped]);
                  setSelectedChild(mapped);
                  setChildName(''); setChildAge('');
                } catch (err) { console.error('Error adding child:', err); }
              }
            }} disabled={!childName.trim() || !childAge}
              className="w-full py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 mb-3 transition-all"
              style={{borderColor:'var(--ac)',color:'var(--ac)',opacity:(!childName.trim()||!childAge)?0.3:1}}>
              <Plus size={16}/>Add child
            </button>

            <button onClick={async () => {
              if (children.length === 0 && childName.trim() && childAge && user) {
                try {
                  const newChild = await db.addChild(user.id, childName.trim(), childAge);
                  const mapped = { name: newChild.name, age: newChild.age_range, id: newChild.id };
                  setChildren([mapped]);
                  setSelectedChild(mapped);
                } catch (err) { console.error('Error adding child:', err); }
              } else if (children.length > 0) {
                setSelectedChild(children[0]);
              }
              navigate('home');
            }} disabled={children.length === 0 && (!childName.trim() || !childAge)}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all hover:-translate-y-0.5 mt-2"
              style={{background:'linear-gradient(135deg,var(--ac),#1AB5A0)',color: dark ? '#0A0E17' : '#fff',boxShadow:'0 6px 20px rgba(34,211,183,0.25)',opacity:(children.length>0||(childName.trim()&&childAge))?1:0.3}}>
              Continue to app →
            </button>

            <div className="mt-auto pt-4 flex justify-center gap-4">
              <Shield size={12} style={{color:'var(--t3)'}} />
              <span className="text-[11px]" style={{color:'var(--t3)'}}>Your child's data is encrypted and never shared</span>
            </div>
          </div>
        )}

        {/* ═══ HOME ═══ */}
        {screen === 'home' && (
          <div className="flex flex-col" style={{background:'var(--bg0)',height:'100vh',overflow:'hidden'}}>
            {/* Top bar */}
            <div className="flex justify-between items-center px-5 pt-10 pb-3">
              <p className="text-[13px] font-medium" style={{color:'var(--t3)'}}>Good evening</p>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold" style={{background:'rgba(45,212,168,0.08)',color:'var(--ac)'}}>
                {selCountry ? COUNTRIES.find(c=>c.name===selCountry)?.flag : '🌍'} · {selBelief ? BELIEFS.find(b=>b.name===selBelief)?.icon : ''} · {!isPro ? `${MAX_FREE - usageCount} free` : 'Pro'}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col px-5 pb-1 overflow-hidden">

              {/* Question card — the hero element */}
              <div className="rounded-3xl p-6 mb-4 relative overflow-hidden" style={{background:'linear-gradient(145deg, rgba(45,212,168,0.12), rgba(129,140,248,0.08))',border:'1px solid rgba(45,212,168,0.15)'}}>
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-[40px] pointer-events-none" style={{background:'rgba(45,212,168,0.15)'}} />
                <h2 className="text-[22px] font-extrabold mb-1 relative z-10" style={{color:'var(--t1)'}}>What did they ask?</h2>
                <p className="text-[12px] mb-4 relative z-10" style={{color:'var(--t3)'}}>Type or pick a common question below</p>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={2}
                  placeholder={'"What is sex?" or "Why did grandpa die?"'}
                  className="w-full rounded-xl px-4 py-3 text-[15px] font-medium resize-none leading-relaxed outline-none relative z-10"
                  style={{background:'var(--bg0)',border:'1.5px solid var(--brc)',color:'var(--t1)'}} />
              </div>

              {/* Child selector */}
              {children.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {children.map(c => (
                    <button key={c.id} onClick={() => setSelectedChild(c)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all"
                      style={{
                        background: selectedChild?.id===c.id ? '#2dd4a8' : 'var(--bg2)',
                        color: selectedChild?.id===c.id ? '#0A0E17' : 'var(--t2)',
                        border: selectedChild?.id===c.id ? 'none' : '1px solid var(--brc)',
                        boxShadow: selectedChild?.id===c.id ? '0 4px 14px rgba(45,212,168,0.3)' : 'none',
                      }}>
                      <Baby size={14}/>{c.name} <span className="text-[10px] opacity-60">({c.age})</span>
                    </button>
                  ))}
                  <button onClick={() => navigate('addchild')} className="flex items-center gap-1 px-3 py-2 rounded-2xl text-[11px] font-medium" style={{border:'1.5px dashed var(--brc)',color:'var(--t3)'}}>
                    <Plus size={12}/>Add
                  </button>
                </div>
              )}

              {/* Common questions — 2-row grid */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{color:'var(--t3)'}}>Quick picks</p>
                <div className="grid grid-cols-3 gap-2">
                  {TOPICS.slice(0,6).map(t => (
                    <button key={t.label} onClick={() => setQuestion(t.q)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                      style={{background:'var(--bg2)',border:'1px solid var(--brc)',color:'var(--t2)'}}>
                      <span className="text-base">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers — inline compact */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{color:'var(--t3)'}}>Triggered by <span className="font-normal opacity-50">(optional)</span></p>
                <div className="flex gap-1.5 flex-wrap">
                  {TRIGGERS.map(tr => (
                    <button key={tr.key} onClick={() => setSelectedTriggers(prev => prev.includes(tr.key) ? prev.filter(x=>x!==tr.key) : [...prev,tr.key])}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                      style={{
                        background: selectedTriggers.includes(tr.key) ? '#f472b6' : 'var(--bg2)',
                        color: selectedTriggers.includes(tr.key) ? 'white' : 'var(--t3)',
                        border: `1px solid ${selectedTriggers.includes(tr.key) ? '#f472b6' : 'var(--brc)'}`,
                      }}>
                      <tr.icon size={10}/>{tr.label}
                    </button>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{background:'rgba(244,114,182,0.08)',border:'1px solid rgba(244,114,182,0.15)'}}>
                  <AlertCircle size={14} style={{color:'#f472b6'}} />
                  <span className="text-[12px] font-medium" style={{color:'#f472b6'}}>{genError}</span>
                </div>
              )}

              {/* Generate button — anchored at bottom */}
              <div className="mt-auto pb-1">
                <button onClick={handleGenerate} className="w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{background:'#2dd4a8',color:'#0A0E17',boxShadow:'0 6px 24px rgba(45,212,168,0.25)'}}>
                  <Sparkles size={18}/>Generate Explanation
                  {!isPro && <span className="text-[12px] font-semibold opacity-50 ml-1">({MAX_FREE - usageCount} free)</span>}
                </button>
              </div>
            </div>

            <BottomNav active="home" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {screen === 'loading' && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{background:'var(--bg1)',borderColor:'var(--brs)'}}>
              <IconBtn icon={ArrowLeft} onClick={() => navigate('home')} />
              <span className="text-sm font-bold" style={{color:'var(--t1)'}}>Creating layers...</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="flex gap-2 mb-5">
                {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{background:['var(--ac)','var(--a3)','var(--a2)'][i],animationDelay:`${i*0.2}s`}} />)}
              </div>
              <p className="text-lg font-bold" style={{fontFamily:'Baloo 2,cursive',color:'var(--t2)'}}>
                Building layered explanation for {selectedChild?.name}...
              </p>
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {screen === 'result' && layers && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            {/* Header with question */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('home')} className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90" style={{background:'var(--bg2)',border:'1px solid var(--brc)'}}>
                  <ArrowLeft size={16} style={{color:'var(--t2)'}} />
                </button>
                <span className="text-[15px] font-bold" style={{color:'var(--t1)'}}>Your Explanation</span>
              </div>
              {/* Original question as quote */}
              <div className="px-4 py-3 rounded-xl" style={{background:'var(--bg2)',borderLeft:'3px solid var(--ac)'}}>
                <p className="text-[14px] font-medium italic" style={{color:'var(--t2)'}}>"{question}"</p>
                <p className="text-[11px] mt-1 font-semibold" style={{color:'var(--ac)'}}>— {selectedChild?.name}, age {selectedChild?.age}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20" style={{scrollbarWidth:'none'}}>
              {/* Context tags */}
              <div className="flex flex-wrap gap-2 px-5 mb-4">
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{background:'var(--a3g)',color:'var(--a3)'}}>Age {selectedChild?.age}</span>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{background:'var(--a2g)',color:'var(--a2)'}}>{COUNTRIES.find(c=>c.name===selCountry)?.flag} {selCountry}</span>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(139,92,246,0.12)',color:'#8B5CF6'}}>{BELIEFS.find(b=>b.name===selBelief)?.icon} {selBelief}</span>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{background:'var(--acg)',color:'var(--ac)'}}>🧅 Layered</span>
              </div>

              {/* Approach card */}
              <div className="mx-5 mb-4 rounded-2xl p-5" style={{background:'linear-gradient(135deg, rgba(45,212,168,0.08), rgba(129,140,248,0.06))',border:'1px solid rgba(45,212,168,0.15)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={14} style={{color:'var(--ac)'}} />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.15em]" style={{color:'var(--ac)'}}>Layered approach</span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Start with Layer 1. Most kids are satisfied. Only open the next if they keep asking.</p>
              </div>

              {/* Layers */}
              {layers.map((l, i) => (
                <LayerCard key={i} layer={l} index={i} isOpen={openLayer === i} onToggle={() => setOpenLayer(openLayer === i ? -1 : i)} />
              ))}

              {/* Actions — vertical icon layout */}
              <div className="flex gap-2 px-5 py-4">
                {[
                  {icon:Bookmark,label:'Save',action:saveResult},
                  {icon:Copy,label:'Copy',action:()=>navigator.clipboard?.writeText(layers[0]?.quote||'')},
                  {icon:Share2,label:'Share',action:()=>{}},
                  {icon:Volume2,label:'Read',action:()=>{}},
                ].map(a => (
                  <button key={a.label} onClick={a.action} className="flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all active:scale-95"
                    style={{background:'var(--bg2)',border:'1px solid var(--brc)'}}>
                    <a.icon size={18} style={{color:'var(--t2)'}} />
                    <span className="text-[10px] font-bold" style={{color:'var(--t3)'}}>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Tips */}
              {parentTip && (
                <div className="mx-5 mb-3 rounded-2xl p-5" style={{background:'linear-gradient(135deg, rgba(45,212,168,0.06), rgba(45,212,168,0.02))',border:'1px solid rgba(45,212,168,0.12)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">💡</span>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{color:'var(--ac)'}}>How to use the layers</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>{parentTip}</p>
                </div>
              )}
              {misinfoTip && (
                <div className="mx-5 mb-3 rounded-2xl p-5" style={{background:'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))',border:'1px solid rgba(251,191,36,0.12)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">⚠️</span>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{color:'var(--a4)'}}>If they heard wrong info</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>{misinfoTip}</p>
                </div>
              )}
            </div>

            <BottomNav active="" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ PAYWALL ═══ */}
        {screen === 'paywall' && (
          <div className="flex flex-col min-h-[836px] px-6 pt-6 pb-8" style={{background:'var(--bg0)'}}>
            <IconBtn icon={X} onClick={() => navigate('home')} className="self-end mb-4" />

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'linear-gradient(135deg,var(--ac),var(--a3))',boxShadow:'0 8px 30px rgba(34,211,183,0.3)'}}>
                <Lock size={28} color="white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>You've used your 3 free tries</h2>
              <p className="text-sm" style={{color:'var(--t3)'}}>Upgrade to ChildTruths Pro for unlimited explanations</p>
            </div>

            {/* Pricing */}
            {[
              {plan:'Monthly',price:'$6.99',period:'/month',popular:false,planKey:'monthly'},
              {plan:'Annual',price:'$49.99',period:'/year',popular:true,save:'Save 40%',planKey:'annual'},
            ].map(p => (
              <button key={p.plan} onClick={async () => {
                if (!user) return;
                try {
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: p.planKey, email: user.email, userId: user.id }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch (err) { console.error('Checkout error:', err); }
              }}
                className="w-full rounded-2xl border p-4 mb-3 text-left relative transition-all hover:-translate-y-0.5"
                style={{background: p.popular ? 'var(--acg)' : 'var(--bg2)', borderColor: p.popular ? 'var(--ac)' : 'var(--brc)'}}>
                {p.popular && <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{background:'var(--ac)',color: dark ? '#0A0E17' : '#fff'}}>BEST VALUE</span>}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-base font-bold" style={{color:'var(--t1)'}}>{p.plan}</div>
                    {p.save && <div className="text-[11px] font-semibold" style={{color:'var(--ac)'}}>{p.save}</div>}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold" style={{color:'var(--t1)'}}>{p.price}</span>
                    <span className="text-[12px]" style={{color:'var(--t3)'}}>{p.period}</span>
                  </div>
                </div>
              </button>
            ))}

            <div className="mt-2 space-y-2">
              {['Unlimited explanations','All response layers','Cultural & belief calibration','Audio read-aloud','Co-parent sharing','Priority support'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={14} style={{color:'var(--ac)'}} />
                  <span className="text-[13px] font-medium" style={{color:'var(--t2)'}}>{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 p-3 rounded-xl border" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
              <CreditCard size={16} style={{color:'var(--t3)'}} />
              <span className="text-[12px] font-medium" style={{color:'var(--t3)'}}>Secured by Stripe · Cancel anytime</span>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              {[['Refund Policy','refund'],['Terms','terms'],['Privacy','privacy']].map(([l,k]) => (
                <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="text-[11px] font-medium underline" style={{color:'var(--t3)'}}>{l}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SAVED ═══ */}
        {screen === 'saved' && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{background:'var(--bg1)',borderColor:'var(--brs)'}}>
              <BookOpen size={18} style={{color:'var(--ac)'}} />
              <span className="text-sm font-bold" style={{color:'var(--t1)'}}>Saved Explanations</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{scrollbarWidth:'none'}}>
              {saved.length === 0 ? (
                <div className="text-center pt-20">
                  <BookOpen size={40} className="mx-auto mb-3" style={{color:'var(--t3)',opacity:0.3}} />
                  <p className="text-sm font-medium" style={{color:'var(--t3)'}}>No saved explanations yet</p>
                  <p className="text-[12px] mt-1" style={{color:'var(--t3)',opacity:0.6}}>Generate one and tap Save</p>
                </div>
              ) : saved.map(s => (
                <div key={s.id} className="rounded-xl border p-3.5 transition-all hover:-translate-y-0.5 cursor-pointer" style={{background:'var(--bg2)',borderColor:'var(--brc)',boxShadow:'var(--sh)'}}>
                  <div className="text-sm font-bold mb-1" style={{color:'var(--t1)'}}>{s.question}</div>
                  <div className="text-[11px]" style={{color:'var(--t3)'}}>
                    {s.child.name} ({s.child.age}) · {COUNTRIES.find(c=>c.name===s.country)?.flag} · {BELIEFS.find(b=>b.name===s.belief)?.icon} · {s.layers.length} layers · {s.date}
                  </div>
                </div>
              ))}
            </div>
            <BottomNav active="saved" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {screen === 'settings' && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{background:'var(--bg1)',borderColor:'var(--brs)'}}>
              <Settings size={18} style={{color:'var(--ac)'}} />
              <span className="text-sm font-bold" style={{color:'var(--t1)'}}>Settings</span>
            </div>
            <div className="flex-1 overflow-y-auto pb-16" style={{scrollbarWidth:'none'}}>
              <div className="mx-4 mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--t3)'}}>Profile<div className="flex-1 h-px" style={{background:'var(--brs)'}} /></div>
              <div className="mx-4 mt-2 rounded-2xl border overflow-hidden" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
                {[['Language',`🇬🇧 ${selLanguage}`],['Country',`${COUNTRIES.find(c=>c.name===selCountry)?.flag||'🌍'} ${selCountry||'Not set'}`],['Family beliefs',`${BELIEFS.find(b=>b.name===selBelief)?.icon||''} ${selBelief||'Not set'}`]].map(([l,v],i,a) => (
                  <div key={l} className="flex justify-between items-center px-4 py-3.5 border-b cursor-pointer" style={{borderColor: i<a.length-1 ? 'var(--brs)' : 'transparent'}}>
                    <span className="text-[13px] font-semibold" style={{color:'var(--t1)'}}>{l}</span>
                    <div className="flex items-center gap-1"><span className="text-[12px]" style={{color:'var(--t3)'}}>{v}</span><ChevronRight size={14} style={{color:'var(--t3)'}} /></div>
                  </div>
                ))}
              </div>

              <div className="mx-4 mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--t3)'}}>Children<div className="flex-1 h-px" style={{background:'var(--brs)'}} /></div>
              <div className="mx-4 mt-2 rounded-2xl border overflow-hidden" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
                {children.map((c,i) => (
                  <div key={c.id} className="flex justify-between items-center px-4 py-3.5 border-b" style={{borderColor:'var(--brs)'}}>
                    <div className="flex items-center gap-2"><Baby size={14} style={{color:'var(--ac)'}} /><span className="text-[13px] font-semibold" style={{color:'var(--t1)'}}>{c.name}</span></div>
                    <span className="text-[12px] px-2 py-0.5 rounded-md" style={{background:'var(--a3g)',color:'var(--a3)'}}>{c.age}</span>
                  </div>
                ))}
                <button onClick={() => navigate('addchild')} className="flex items-center gap-2 px-4 py-3.5 w-full">
                  <Plus size={14} style={{color:'var(--ac)'}} /><span className="text-[13px] font-semibold" style={{color:'var(--ac)'}}>Add child</span>
                </button>
              </div>

              <div className="mx-4 mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--t3)'}}>Appearance<div className="flex-1 h-px" style={{background:'var(--brs)'}} /></div>
              <div className="mx-4 mt-2 rounded-2xl border overflow-hidden" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
                <div onClick={() => setDark(!dark)} className="flex justify-between items-center px-4 py-3.5 cursor-pointer">
                  <span className="text-[13px] font-semibold" style={{color:'var(--t1)'}}>Dark mode</span>
                  <div className="w-11 h-6 rounded-full relative cursor-pointer transition-all" style={{background: dark ? 'var(--ac)' : 'var(--chb)', border:`1px solid ${dark ? 'var(--ac)' : 'var(--chbr)'}`}}>
                    <div className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform" style={{left: dark ? 22 : 2}} />
                  </div>
                </div>
              </div>

              <div className="mx-4 mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--t3)'}}>Account<div className="flex-1 h-px" style={{background:'var(--brs)'}} /></div>
              <div className="mx-4 mt-2 rounded-2xl border overflow-hidden" style={{background:'var(--bg2)',borderColor:'var(--brc)'}}>
                <div className="flex justify-between items-center px-4 py-3.5 border-b cursor-pointer" style={{borderColor:'var(--brs)'}}>
                  <span className="text-[13px] font-semibold" style={{color:'var(--t1)'}}>Subscription</span>
                  <span className="text-[12px] font-bold" style={{color: isPro ? 'var(--ac)' : 'var(--a4)'}}>{isPro ? 'Pro' : `Free (${MAX_FREE - usageCount} left)`}</span>
                </div>
                {!isPro && (
                  <button onClick={() => navigate('paywall')} className="flex items-center gap-2 px-4 py-3.5 w-full border-b" style={{borderColor:'var(--brs)'}}>
                    <CreditCard size={14} style={{color:'var(--ac)'}} /><span className="text-[13px] font-semibold" style={{color:'var(--ac)'}}>Upgrade to Pro</span>
                  </button>
                )}
                {[['Privacy Policy','privacy'],['Terms of Service','terms'],['Refund Policy','refund']].map(([l,k]) => (
                  <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="flex justify-between items-center px-4 py-3.5 w-full border-b" style={{borderColor:'var(--brs)'}}>
                    <span className="text-[13px] font-semibold" style={{color:'var(--t1)'}}>{l}</span>
                    <ChevronRight size={14} style={{color:'var(--t3)'}} />
                  </button>
                ))}
                <button onClick={async () => { await signOut(); setIsLoggedIn(false); setDataLoaded(false); dataLoadedRef.current = false; setChildren([]); setSaved([]); navigate('auth'); }} className="flex items-center gap-2 px-4 py-3.5 w-full">
                  <LogOut size={14} style={{color:'var(--a2)'}} /><span className="text-[13px] font-semibold" style={{color:'var(--a2)'}}>Sign Out</span>
                </button>
              </div>
              <div className="text-center mt-6 text-[11px]" style={{color:'var(--t3)'}}>ChildTruths v1.0 · Made with ❤️</div>
            </div>
            <BottomNav active="settings" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ LEGAL ═══ */}
        {screen === 'legal' && (
          <div className="flex flex-col min-h-[836px]" style={{background:'var(--bg0)'}}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{background:'var(--bg1)',borderColor:'var(--brs)'}}>
              <IconBtn icon={ArrowLeft} onClick={() => navigate(prevScreen || 'settings')} />
              <span className="text-sm font-bold" style={{color:'var(--t1)'}}>
                {legalPage === 'privacy' ? 'Privacy Policy' : legalPage === 'terms' ? 'Terms of Service' : 'Refund Policy'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{scrollbarWidth:'none'}}>
              {legalPage === 'privacy' && <>
                <h3 className="text-lg font-bold" style={{color:'var(--t1)',fontFamily:'Baloo 2,cursive'}}>Privacy Policy</h3>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Last updated: March 2026</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>ChildTruths ("we", "our") respects your privacy and is committed to protecting the personal data of you and your family.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Data We Collect</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>We collect: your email address for authentication, your child's first name and age group for personalization, your country and belief preferences for content calibration, and the questions you submit. We do NOT collect your child's full name, date of birth, photos, location data, or any other identifying information about your child.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>How We Use Data</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Your data is used solely to generate personalized explanations. We do not sell, share, or monetize your data. Questions are processed by AI and are not stored on our servers beyond what's needed for your saved history.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Children's Privacy (COPPA)</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>ChildTruths is designed for parents, not children. We do not knowingly collect personal information from children under 13. The child's first name is provided by the parent and used only within the parent's account.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Data Security</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Stripe for payment processing — we never see or store your credit card details.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Your Rights</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>You can export, modify, or delete your data at any time from Settings. Account deletion permanently removes all your data within 30 days. Contact: privacy@childtruths.com</p>
              </>}
              {legalPage === 'terms' && <>
                <h3 className="text-lg font-bold" style={{color:'var(--t1)',fontFamily:'Baloo 2,cursive'}}>Terms of Service</h3>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Last updated: March 2026</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>By using ChildTruths, you agree to these terms. ChildTruths provides AI-generated educational content to help parents communicate with their children. We are not a substitute for professional advice from child psychologists, therapists, or medical professionals.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Content Disclaimer</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>AI-generated content is provided as a starting point for conversations. Parents should review all content before sharing with their children and adjust based on their judgment. We strive for accuracy but cannot guarantee all content will be appropriate for every family's specific situation.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Acceptable Use</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>You may not use ChildTruths to generate harmful, abusive, or inappropriate content. We reserve the right to terminate accounts that violate these terms.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Subscriptions</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Free accounts receive 3 explanations per month. Pro subscriptions are billed monthly or annually through the App Store or Google Play. You can cancel at any time — access continues until the end of your billing period.</p>
              </>}
              {legalPage === 'refund' && <>
                <h3 className="text-lg font-bold" style={{color:'var(--t1)',fontFamily:'Baloo 2,cursive'}}>Refund Policy</h3>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Last updated: March 2026</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>We want you to be completely satisfied with ChildTruths.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>7-Day Money-Back Guarantee</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>If you're not happy with your Pro subscription, you can request a full refund within 7 days of your first payment. No questions asked. Email refunds@childtruths.com with your account email.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>App Store / Google Play Purchases</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>For subscriptions purchased through the App Store or Google Play, refunds are handled according to Apple's and Google's respective refund policies. Please contact Apple or Google directly for these refunds.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>After 7 Days</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>After the 7-day window, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your current billing period. No partial refunds are issued for the remaining time.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Contact</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>For any billing questions: billing@childtruths.com</p>
              </>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
