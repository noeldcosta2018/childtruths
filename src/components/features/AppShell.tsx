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

const TOPICS_BY_LANG = {
  'English': [
    {emoji:"👶",label:"Babies",q:"Where do babies come from?"},
    {emoji:"🕊️",label:"Death",q:"Why do people die?"},
    {emoji:"💔",label:"Divorce",q:"Why are you and dad splitting up?"},
    {emoji:"❓",label:"Sex",q:"What is sex?"},
    {emoji:"🌙",label:"Afterlife",q:"What happens after we die?"},
    {emoji:"🏥",label:"Illness",q:"What happens when someone gets really sick?"},
  ],
  'العربية': [
    {emoji:"👶",label:"أطفال",q:"من أين يأتي الأطفال؟"},
    {emoji:"🕊️",label:"الموت",q:"لماذا يموت الناس؟"},
    {emoji:"💔",label:"الطلاق",q:"لماذا أنتما تنفصلان؟"},
    {emoji:"❓",label:"الجنس",q:"ما هو الجنس؟"},
    {emoji:"🌙",label:"الآخرة",q:"ماذا يحدث بعد الموت؟"},
    {emoji:"🏥",label:"المرض",q:"ماذا يحدث عندما يمرض شخص ما بشدة؟"},
  ],
  'हिन्दी': [
    {emoji:"👶",label:"बच्चे",q:"बच्चे कहाँ से आते हैं?"},
    {emoji:"🕊️",label:"मृत्यु",q:"लोग क्यों मरते हैं?"},
    {emoji:"💔",label:"तलाक",q:"आप और पापा अलग क्यों हो रहे हैं?"},
    {emoji:"❓",label:"सेक्स",q:"सेक्स क्या है?"},
    {emoji:"🌙",label:"परलोक",q:"मरने के बाद क्या होता है?"},
    {emoji:"🏥",label:"बीमारी",q:"जब कोई बहुत बीमार हो जाए तो क्या होता है?"},
  ],
  'Español': [
    {emoji:"👶",label:"Bebés",q:"¿De dónde vienen los bebés?"},
    {emoji:"🕊️",label:"Muerte",q:"¿Por qué muere la gente?"},
    {emoji:"💔",label:"Divorcio",q:"¿Por qué se están separando?"},
    {emoji:"❓",label:"Sexo",q:"¿Qué es el sexo?"},
    {emoji:"🌙",label:"Más allá",q:"¿Qué pasa después de morir?"},
    {emoji:"🏥",label:"Enfermedad",q:"¿Qué pasa cuando alguien se enferma mucho?"},
  ],
  'Français': [
    {emoji:"👶",label:"Bébés",q:"D'où viennent les bébés ?"},
    {emoji:"🕊️",label:"Mort",q:"Pourquoi les gens meurent ?"},
    {emoji:"💔",label:"Divorce",q:"Pourquoi vous séparez-vous ?"},
    {emoji:"❓",label:"Sexe",q:"C'est quoi le sexe ?"},
    {emoji:"🌙",label:"Au-delà",q:"Que se passe-t-il après la mort ?"},
    {emoji:"🏥",label:"Maladie",q:"Que se passe-t-il quand quelqu'un est très malade ?"},
  ],
  '中文': [
    {emoji:"👶",label:"宝宝",q:"宝宝是从哪里来的？"},
    {emoji:"🕊️",label:"死亡",q:"人为什么会死？"},
    {emoji:"💔",label:"离婚",q:"你们为什么要分开？"},
    {emoji:"❓",label:"性",q:"什么是性？"},
    {emoji:"🌙",label:"来世",q:"人死后会怎样？"},
    {emoji:"🏥",label:"疾病",q:"人生了重病会怎样？"},
  ],
  'Português': [
    {emoji:"👶",label:"Bebês",q:"De onde vêm os bebês?"},
    {emoji:"🕊️",label:"Morte",q:"Por que as pessoas morrem?"},
    {emoji:"💔",label:"Divórcio",q:"Por que vocês estão se separando?"},
    {emoji:"❓",label:"Sexo",q:"O que é sexo?"},
    {emoji:"🌙",label:"Além",q:"O que acontece depois que morremos?"},
    {emoji:"🏥",label:"Doença",q:"O que acontece quando alguém fica muito doente?"},
  ],
  'Deutsch': [
    {emoji:"👶",label:"Babys",q:"Woher kommen Babys?"},
    {emoji:"🕊️",label:"Tod",q:"Warum sterben Menschen?"},
    {emoji:"💔",label:"Scheidung",q:"Warum trennt ihr euch?"},
    {emoji:"❓",label:"Sex",q:"Was ist Sex?"},
    {emoji:"🌙",label:"Jenseits",q:"Was passiert nach dem Tod?"},
    {emoji:"🏥",label:"Krankheit",q:"Was passiert wenn jemand sehr krank wird?"},
  ],
};

const UI_STRINGS = {
  'English': { greeting:'Good evening', hereToHelp:"We're here to help", whatDidAsk:'What did {name} ask?', orPickTopic:'Or pick a topic', triggeredBy:'Triggered by', generate:'Generate Child Friendly Explanation', freeRemaining:'{n} free explanations remaining', signInMore:'Upgrade for unlimited', yourExplanation:'Your Explanation', save:'Save', copy:'Copy', share:'Share', read:'Read', howToUse:'How to use the layers', wrongInfo:'If they heard wrong info' },
  'العربية': { greeting:'مساء الخير', hereToHelp:'نحن هنا للمساعدة', whatDidAsk:'ماذا سأل {name}؟', orPickTopic:'أو اختر موضوعاً', triggeredBy:'السبب', generate:'إنشاء شرح مناسب للأطفال', freeRemaining:'{n} شروحات مجانية متبقية', signInMore:'سجل دخول للمزيد', yourExplanation:'شرحك', save:'حفظ', copy:'نسخ', share:'مشاركة', read:'قراءة', howToUse:'كيفية استخدام الطبقات', wrongInfo:'إذا سمعوا معلومات خاطئة' },
  'हिन्दी': { greeting:'शुभ संध्या', hereToHelp:'हम मदद के लिए यहाँ हैं', whatDidAsk:'{name} ने क्या पूछा?', orPickTopic:'या एक विषय चुनें', triggeredBy:'कारण', generate:'बच्चों के अनुकूल व्याख्या बनाएं', freeRemaining:'{n} मुफ्त व्याख्याएं शेष', signInMore:'अधिक के लिए साइन इन करें', yourExplanation:'आपकी व्याख्या', save:'सहेजें', copy:'कॉपी', share:'शेयर', read:'पढ़ें', howToUse:'परतों का उपयोग कैसे करें', wrongInfo:'अगर उन्होंने गलत जानकारी सुनी' },
  'Español': { greeting:'Buenas tardes', hereToHelp:'Estamos aquí para ayudar', whatDidAsk:'¿Qué preguntó {name}?', orPickTopic:'O elige un tema', triggeredBy:'Provocado por', generate:'Generar Explicación para Niños', freeRemaining:'{n} explicaciones gratuitas restantes', signInMore:'Inicia sesión para más', yourExplanation:'Tu Explicación', save:'Guardar', copy:'Copiar', share:'Compartir', read:'Leer', howToUse:'Cómo usar las capas', wrongInfo:'Si escucharon información incorrecta' },
  'Français': { greeting:'Bonsoir', hereToHelp:'Nous sommes là pour aider', whatDidAsk:"Qu'a demandé {name} ?", orPickTopic:'Ou choisissez un sujet', triggeredBy:'Déclenché par', generate:'Générer une explication adaptée', freeRemaining:'{n} explications gratuites restantes', signInMore:'Connectez-vous pour plus', yourExplanation:'Votre Explication', save:'Sauver', copy:'Copier', share:'Partager', read:'Lire', howToUse:'Comment utiliser les couches', wrongInfo:"S'ils ont entendu de fausses infos" },
  '中文': { greeting:'晚上好', hereToHelp:'我们来帮助您', whatDidAsk:'{name}问了什么？', orPickTopic:'或选择一个话题', triggeredBy:'触发原因', generate:'生成儿童友好解释', freeRemaining:'{n} 次免费解释剩余', signInMore:'登录获取更多', yourExplanation:'您的解释', save:'保存', copy:'复制', share:'分享', read:'朗读', howToUse:'如何使用分层', wrongInfo:'如果他们听到了错误信息' },
  'Português': { greeting:'Boa noite', hereToHelp:'Estamos aqui para ajudar', whatDidAsk:'O que {name} perguntou?', orPickTopic:'Ou escolha um tema', triggeredBy:'Provocado por', generate:'Gerar Explicação para Crianças', freeRemaining:'{n} explicações gratuitas restantes', signInMore:'Entre para mais', yourExplanation:'Sua Explicação', save:'Salvar', copy:'Copiar', share:'Compartilhar', read:'Ler', howToUse:'Como usar as camadas', wrongInfo:'Se ouviram informações erradas' },
  'Deutsch': { greeting:'Guten Abend', hereToHelp:'Wir sind hier um zu helfen', whatDidAsk:'Was hat {name} gefragt?', orPickTopic:'Oder wähle ein Thema', triggeredBy:'Ausgelöst durch', generate:'Kindgerechte Erklärung erstellen', freeRemaining:'{n} kostenlose Erklärungen übrig', signInMore:'Anmelden für mehr', yourExplanation:'Deine Erklärung', save:'Speichern', copy:'Kopieren', share:'Teilen', read:'Vorlesen', howToUse:'So verwendest du die Ebenen', wrongInfo:'Wenn sie falsche Infos gehört haben' },
};

const TRIGGERS_BY_LANG = {
  'English': ['TV / Movie','iPad / Phone','Friend told them','At school','Overheard adults','Real event'],
  'العربية': ['تلفزيون / فيلم','آيباد / هاتف','أخبرهم صديق','في المدرسة','سمعوا الكبار','حدث حقيقي'],
  'हिन्दी': ['टीवी / फिल्म','आईपैड / फोन','दोस्त ने बताया','स्कूल में','बड़ों की बात सुनी','असली घटना'],
  'Español': ['TV / Película','iPad / Teléfono','Un amigo les dijo','En la escuela','Escucharon adultos','Evento real'],
  'Français': ['TV / Film','iPad / Téléphone','Un ami leur a dit','À l\'école','Entendu des adultes','Événement réel'],
  '中文': ['电视/电影','iPad/手机','朋友告诉的','在学校','听到大人说','真实事件'],
  'Português': ['TV / Filme','iPad / Celular','Amigo contou','Na escola','Ouviram adultos','Evento real'],
  'Deutsch': ['TV / Film','iPad / Handy','Freund erzählte','In der Schule','Erwachsene gehört','Echtes Ereignis'],
};

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
      <span className="font-bold tracking-tight" style={{fontFamily:'Baloo 2,cursive',fontSize:size*0.65,color:'var(--t1)'}}>Kidzplainer</span>
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

function LoadingStages({ stages }: { stages: { label: string; emoji: string }[] }) {
  const [currentStage, setCurrentStage] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage(prev => Math.min(prev + 1, stages.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [stages.length]);
  return (
    <div className="space-y-3 w-full max-w-xs">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-3 transition-all duration-500" style={{ opacity: i <= currentStage ? 1 : 0.2 }}>
          <span className="text-[18px] w-6 text-center">{i < currentStage ? <span style={{color:'#22D3B7'}}>&#10003;</span> : i === currentStage ? s.emoji : <span style={{color:'rgba(255,255,255,0.2)'}}>&#9675;</span>}</span>
          <span className="text-[16px] text-left" style={{ color: i <= currentStage ? '#FFFFFF' : 'rgba(255,255,255,0.3)', fontWeight: i === currentStage ? 600 : 400 }}>
            {s.label}
          </span>
        </div>
      ))}
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
  const bgColors = ['rgba(45,212,168,0.06)','rgba(129,140,248,0.06)','rgba(244,114,182,0.06)','rgba(251,191,36,0.06)'];
  const c = colors[index] || colors[0];
  const bg = bgColors[index] || bgColors[0];
  return (
    <div className="mx-5 mb-3 rounded-2xl overflow-hidden transition-all" style={{background:'rgba(255,255,255,0.03)',border: isOpen ? `1px solid ${c}33` : '1px solid rgba(255,255,255,0.06)',boxShadow: isOpen ? `0 4px 20px ${c}15` : 'none'}}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-5 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-extrabold text-white" style={{background:`linear-gradient(135deg, ${c}, ${c}cc)`,boxShadow:`0 3px 10px ${c}40`}}>{layer.level}</div>
          <div>
            <div className="text-[18px] font-bold" style={{color:'#FFFFFF'}}>{layer.title}</div>
            <div className="text-[15px] mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>{layer.subtitle}</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)'}}>
          <ChevronDown size={16} style={{color:'rgba(255,255,255,0.4)',transition:'transform 0.3s ease',transform:isOpen?'rotate(180deg)':'rotate(0)'}} />
        </div>
      </button>
      <div style={{maxHeight:isOpen?800:0,overflow:'hidden',transition:'max-height 0.5s ease-in-out'}}>
        <div className="px-5 pb-5">
          {/* Quote */}
          <div className="rounded-xl p-5 mb-3 relative" style={{background:bg,borderLeft:`3px solid ${c}`}}>
            <p className="text-[18px] italic leading-[1.7] font-medium" style={{color:'#FFFFFF'}}>{layer.quote}</p>
          </div>
          {/* Note */}
          <p className="text-[15px] leading-relaxed mb-3 px-1" style={{color:'rgba(255,255,255,0.4)'}}>{layer.note}</p>
          {/* Next question prompt */}
          {layer.nextQ && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all" style={{background:'rgba(244,114,182,0.06)',border:'1px solid rgba(244,114,182,0.1)'}}>
              <ChevronRight size={14} style={{color:'#f472b6'}} />
              <span className="text-[15px] font-semibold" style={{color:'#f472b6'}}>{layer.nextQ}</span>
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
  const [selectedPlan, setSelectedPlan] = useState('annual');

  // Usage
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const ADMIN_EMAIL = 'noeldcosta2018@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;
  const MAX_FREE = 7;

  // Saved
  const [saved, setSaved] = useState([]);

  // Legal
  const [legalPage, setLegalPage] = useState(null);

  // Reviews
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState('');
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

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

  // Handle Stripe checkout redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    if (checkoutStatus === 'success') {
      setToast('Subscription activated! Welcome to Pro.');
      setIsPro(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutStatus === 'cancel') {
      setToast('Checkout cancelled. You can try again anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
        setToast('Check your email for a password reset link.');
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
        setToast('Check your email to confirm your account.');
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
    if (usageCount >= MAX_FREE && !isPro && !isAdmin) { navigate('paywall'); return; }

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

        {/* Toast notification */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-2xl transition-all animate-fade-in max-w-[90vw]"
            style={{background:'var(--ac)',color:'#0A0E17'}}>
            <p className="text-[14px] font-semibold text-center">{toast}</p>
          </div>
        )}

        {/* Theme toggle removed — light only */}

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
              <div className="text-3xl font-extrabold mt-3" style={{fontFamily:'Baloo 2,cursive',color:'white'}}>Kidzplainer</div>
              <Loader2 size={20} className="mt-8 animate-spin" style={{color:'#2dd4a8'}} />
            </div>
          </div>
        )}

        {/* ═══ ONBOARDING ═══ */}
        {screen === 'onboarding' && (
          <div className="flex flex-col relative overflow-hidden" style={{background:'#0A0E17',minHeight:'100vh'}}>
            {/* Full-screen background video */}
            <div className="absolute inset-0 z-0">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover" style={{opacity:0.5}}>
                <source src="https://videos.pexels.com/video-files/9096885/9096885-hd_1080_1920_24fps.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0" style={{background:'linear-gradient(0deg, #0A0E17 5%, rgba(10,14,23,0.85) 45%, rgba(10,14,23,0.4) 70%, rgba(10,14,23,0.6) 100%)'}} />
            </div>

            {/* Content at bottom like Upwork */}
            <div className="relative z-10 flex flex-col flex-1 justify-end px-6 pb-10">
              <div className="flex items-center gap-2 mb-4">
                <FamilyLogo size={36} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{color:'rgba(255,255,255,0.5)',letterSpacing:'0.15em'}}>Kidzplainer</span>
              </div>

              <h1 className="text-[38px] font-extrabold leading-[1.1] mb-3" style={{fontFamily:'Plus Jakarta Sans,sans-serif',color:'white'}}>
                The hard talks,<br/>
                <span style={{color:'#2dd4a8'}}>made simple.</span>
              </h1>

              <p className="text-[15px] leading-relaxed mb-5 max-w-[320px]" style={{color:'rgba(255,255,255,0.65)'}}>
                Age-tuned, culturally aware explanations for every question your child asks. Start gentle. Go deeper only if they keep asking.
              </p>

              {/* Trustpilot rating */}
              <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-2xl" style={{background:'rgba(255,255,255,0.08)',backdropFilter:'blur(8px)'}}>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-[16px]">⭐</span>
                  ))}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{color:'#FFFFFF'}}>Parenting Conversations App</p>
                  <p className="text-[11px]" style={{color:'rgba(255,255,255,0.4)'}}>Age-tuned, culturally aware explanations</p>
                </div>
              </div>

              <button onClick={() => navigate('selling')} className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]" style={{background:'#2dd4a8',color:'#0A0E17',boxShadow:'0 8px 32px rgba(45,212,168,0.35)'}}>
                Get Started
              </button>

              <p className="text-center text-[12px] mt-4" style={{color:'rgba(255,255,255,0.35)'}}>
                Already have an account? <button onClick={() => navigate('auth')} className="font-bold underline" style={{color:'rgba(255,255,255,0.6)'}}>Sign in</button>
              </p>
            </div>
          </div>
        )}

        {/* ═══ SELLING / FOMO PAGE ═══ */}
        {screen === 'selling' && (
          <div className="flex flex-col relative overflow-hidden" style={{background:'#0A0E17',minHeight:'100vh'}}>
            <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:'none'}}>

              {/* Section 1: The Problem */}
              <div className="px-6 pt-14 pb-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#2dd4a8'}}>The problem</p>
                <h2 className="text-[28px] font-extrabold leading-[1.15] mb-5" style={{color:'#FFFFFF'}}>
                  Your child just asked<br/>a question you<br/><span style={{color:'#f472b6'}}>weren't ready for.</span>
                </h2>
                <div className="space-y-3">
                  {[
                    {emoji:'😰',text:'You freeze. You don\'t know what to say.'},
                    {emoji:'🤥',text:'You make something up. They\'ll find the truth later.'},
                    {emoji:'🙈',text:'You change the subject. They ask someone else.'},
                    {emoji:'📱',text:'They Google it. And find things no child should see.'},
                  ].map((item,i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.04)'}}>
                      <span className="text-[20px] flex-shrink-0">{item.emoji}</span>
                      <p className="text-[15px] leading-relaxed" style={{color:'rgba(255,255,255,0.7)'}}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: The Solution */}
              <div className="px-6 pb-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#2dd4a8'}}>The solution</p>
                <h2 className="text-[28px] font-extrabold leading-[1.15] mb-5" style={{color:'#FFFFFF'}}>
                  Kidzplainer gives you<br/>the <span style={{color:'#2dd4a8'}}>perfect words.</span>
                </h2>
                <div className="space-y-3">
                  {[
                    {emoji:'🧅',title:'4 Layered Answers',desc:'Start simple. Go deeper only if they keep asking.'},
                    {emoji:'🕌',title:'Belief-Aware',desc:'Framed naturally in your family\'s faith — Islam, Christianity, Hindu, Secular, and more.'},
                    {emoji:'🌍',title:'Culturally Tuned',desc:'A child in Dubai needs different context than one in New York.'},
                    {emoji:'👶',title:'Age-Appropriate',desc:'What works for a 4-year-old is different from a 12-year-old.'},
                    {emoji:'🗣️',title:'Read Aloud Ready',desc:'Every answer is written as if YOU are saying it. Natural, warm, loving.'},
                  ].map((item,i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{background:'rgba(45,212,168,0.06)',border:'1px solid rgba(45,212,168,0.1)'}}>
                      <span className="text-[20px] flex-shrink-0">{item.emoji}</span>
                      <div>
                        <p className="text-[15px] font-bold mb-0.5" style={{color:'#FFFFFF'}}>{item.title}</p>
                        <p className="text-[13px] leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Social Proof */}
              <div className="px-6 pb-10">
                <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#2dd4a8'}}>Parents love it</p>
                <div className="space-y-3">
                  {[
                    {quote:'My 5-year-old asked about death after grandpa passed. Kidzplainer gave me the exact words I needed. I cried.',name:'Sarah M.',location:'Dubai, UAE'},
                    {quote:'Finally! An app that respects our Islamic values while being honest with our kids.',name:'Ahmed K.',location:'Riyadh, SA'},
                    {quote:'My daughter asked "what is sex" at dinner. Instead of panicking, I opened the app. Layer 1 was perfect.',name:'Jessica R.',location:'London, UK'},
                  ].map((item,i) => (
                    <div key={i} className="p-5 rounded-2xl" style={{background:'rgba(255,255,255,0.04)'}}>
                      <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <span key={s} className="text-[14px]">⭐</span>)}</div>
                      <p className="text-[14px] italic leading-relaxed mb-3" style={{color:'rgba(255,255,255,0.75)'}}>"{item.quote}"</p>
                      <p className="text-[12px] font-semibold" style={{color:'var(--ac)'}}>{item.name} <span style={{color:'rgba(255,255,255,0.3)'}}>· {item.location}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Urgency */}
              <div className="px-6 pb-8">
                <div className="p-6 rounded-2xl text-center" style={{background:'linear-gradient(135deg, rgba(45,212,168,0.1), rgba(129,140,248,0.08))',border:'1px solid rgba(45,212,168,0.15)'}}>
                  <p className="text-[24px] mb-2">🕐</p>
                  <h3 className="text-[20px] font-extrabold mb-2" style={{color:'#FFFFFF'}}>The next question is coming.</h3>
                  <p className="text-[14px] leading-relaxed mb-1" style={{color:'rgba(255,255,255,0.5)'}}>
                    Every child asks. The only question is — will you be ready?
                  </p>
                  <p className="text-[13px] font-bold mt-3" style={{color:'#2dd4a8'}}>Try {MAX_FREE} explanations free. No credit card needed.</p>
                </div>
              </div>

            </div>

            {/* Fixed CTA at bottom */}
            <div className="px-6 pb-6 pt-3" style={{background:'linear-gradient(0deg, #0A0E17 80%, transparent 100%)'}}>
              <button onClick={() => navigate('auth')} className="w-full py-4 rounded-2xl text-[16px] font-bold transition-all active:scale-[0.97]" style={{background:'#2dd4a8',color:'#0A0E17',boxShadow:'0 8px 32px rgba(45,212,168,0.35)'}}>
                Start Free — No Card Needed
              </button>
            </div>
          </div>
        )}

        {/* ═══ AUTH ═══ */}
        {screen === 'auth' && (
          <div className="flex flex-col min-h-dvh relative overflow-hidden" style={{background:'#000000'}}>
            {/* Warm glow background like paywall */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full" style={{background:'radial-gradient(circle, rgba(45,212,168,0.12) 0%, rgba(34,211,183,0.05) 35%, transparent 65%)'}} />
              <div className="absolute top-[30%] right-[-15%] w-[350px] h-[350px] rounded-full" style={{background:'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 60%)'}} />
              <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle, rgba(45,212,168,0.06) 0%, transparent 60%)'}} />
            </div>

            <div className="relative z-10 flex flex-col min-h-dvh px-6 pt-8 pb-8">
              <Logo size={32} className="mb-8" />

              <h2 className="text-5xl font-extrabold mb-3 leading-[1.1]" style={{fontFamily:'Baloo 2,cursive',color:'#FFFFFF'}}>
                {authMode === 'login' ? 'Welcome back' : authMode === 'signup' ? 'Create account' : 'Reset password'}
              </h2>
              <p className="text-[20px] font-medium mb-2" style={{color:'rgba(255,255,255,0.5)'}}>
                {authMode === 'login' ? 'Sign in to continue' : authMode === 'signup' ? `Get ${MAX_FREE} free explanations — no card needed` : 'We\'ll send you a reset link'}
              </p>
              <p className="text-[15px] mb-8 leading-relaxed" style={{color:'rgba(255,255,255,0.35)'}}>
                {authMode === 'login' ? 'Culturally aware, belief-sensitive explanations for every hard question your child asks.' : authMode === 'signup' ? 'Never freeze when your child asks the hard stuff. Get the perfect words in seconds.' : 'No worries — we\'ll get you back in.'}
              </p>

              {authMode !== 'forgot' && (
                <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full py-4.5 rounded-2xl text-[18px] font-bold flex items-center justify-center gap-3 mb-5 transition-all active:scale-[0.97]"
                  style={{background:'white',color:'#000000',boxShadow:'0 0 40px rgba(255,255,255,0.08)',padding:'18px'}}>
                  {authLoading ? <Loader2 size={18} className="animate-spin" /> : <>
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                    Continue with Google
                  </>}
                </button>
              )}

              {authMode !== 'forgot' && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.1)'}} />
                  <span className="text-[14px] font-semibold" style={{color:'rgba(255,255,255,0.3)'}}>or</span>
                  <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.1)'}} />
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
                <p className="text-[14px] font-medium flex items-center gap-1 mb-3" style={{color:'var(--a2)'}}><AlertCircle size={14}/>{authError}</p>
              )}

              {authMode === 'login' && (
                <button onClick={() => setAuthMode('forgot')} className="text-[15px] font-semibold mb-5 text-right" style={{color:'#22D3B7'}}>Forgot password?</button>
              )}

              <button onClick={() => handleAuth(authMode)} disabled={authLoading}
                className="w-full py-4.5 rounded-2xl text-[19px] font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{background:'linear-gradient(135deg,#22D3B7,#1AB5A0)',color:'#000000',boxShadow:'0 8px 30px rgba(34,211,183,0.25)',opacity: authLoading ? 0.6 : 1, padding:'18px'}}>
                {authLoading ? <Loader2 size={18} className="animate-spin" /> :
                  authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>

              <div className="mt-5 text-center">
                {authMode === 'login' ? (
                  <p className="text-[16px]" style={{color:'rgba(255,255,255,0.4)'}}>Don't have an account? <button onClick={() => {setAuthMode('signup');setAuthError('')}} className="font-bold" style={{color:'#22D3B7'}}>Sign up</button></p>
                ) : (
                  <p className="text-[16px]" style={{color:'rgba(255,255,255,0.4)'}}>Already have an account? <button onClick={() => {setAuthMode('login');setAuthError('')}} className="font-bold" style={{color:'#22D3B7'}}>Sign in</button></p>
                )}
              </div>

              <div className="mt-auto pt-6 flex justify-center gap-4">
                {[['Privacy Policy','privacy'],['Terms of Service','terms']].map(([l,k]) => (
                  <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="text-[13px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SETUP ═══ */}
        {screen === 'setup' && (() => {
          const isFromSettings = prevScreen === 'settings';
          const saveAndReturn = async (updates) => {
            if (user) {
              try {
                await db.upsertProfile(user.id, {
                  email: user.email, name: userName,
                  language: selLanguage, country: selCountry, belief: selBelief,
                  ...updates,
                });
              } catch (err) { console.error('Error saving profile:', err); }
            }
            if (isFromSettings) navigate('settings');
          };
          return (
          <div className="flex flex-col min-h-dvh" style={{background:'var(--bg0)'}}>
            <div className="px-6 pt-5 pb-0">
              {isFromSettings && (
                <button onClick={() => navigate('settings')} className="flex items-center gap-2 mb-3">
                  <ArrowLeft size={18} style={{color:'var(--t2)'}} />
                  <span className="text-[14px] font-medium" style={{color:'var(--t2)'}}>Back to Settings</span>
                </button>
              )}
              {!isFromSettings && (
                <>
                  <h2 className="text-[22px] font-extrabold" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>Quick setup ⚡</h2>
                  <p className="text-[13px] mb-4" style={{color:'var(--t3)'}}>3 taps. That's it.</p>
                  <div className="flex gap-1.5 mb-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-1 rounded-full flex-1 transition-all duration-400" style={{background: i <= setupStep ? 'var(--ac)' : 'var(--chb)', boxShadow: i === setupStep ? '0 0 8px var(--acg)' : 'none'}} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 px-6 pb-6 overflow-y-auto" style={{scrollbarWidth:'none'}}>
              {setupStep === 1 && (
                <>
                  <p className="text-lg font-bold mb-1" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>What language do you speak at home?</p>
                  <p className="text-[13px] mb-5" style={{color:'var(--t3)'}}>Explanations will be in this language.</p>
                  <div className="flex flex-col gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.name} onClick={async () => {
                        setSelLanguage(l.name);
                        if (isFromSettings) { await saveAndReturn({language: l.name}); }
                        else { setSetupStep(2); }
                      }}
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
                      <button key={c.name} onClick={async () => {
                        setSelCountry(c.name);
                        if (isFromSettings) { await saveAndReturn({country: c.name}); }
                        else { setSetupStep(3); }
                      }}
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
                      <button key={b.name} onClick={async () => {
                        setSelBelief(b.name);
                        if (isFromSettings) { await saveAndReturn({belief: b.name}); }
                      }}
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
                  {!isFromSettings && (
                    <button disabled={!selBelief} onClick={async () => {
                      if (user) {
                        try {
                          await db.upsertProfile(user.id, {
                            email: user.email, name: userName,
                            language: selLanguage, country: selCountry, belief: selBelief,
                          });
                        } catch (err) { console.error('Error saving profile:', err); }
                      }
                      navigate('addchild');
                    }}
                      className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all hover:-translate-y-0.5"
                      style={{background:'linear-gradient(135deg,var(--ac),#1AB5A0)',color:'#fff',boxShadow:'0 6px 20px rgba(34,211,183,0.25)',opacity:selBelief?1:0.3}}>
                      Done — Add your child →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          );
        })()}

        {/* ═══ ADD CHILD ═══ */}
        {screen === 'addchild' && (
          <div className="flex flex-col min-h-dvh px-6 pt-6 pb-8" style={{background:'var(--bg0)'}}>
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
          <div className="flex flex-col relative" style={{height:'100vh',overflow:'hidden',background:'#0B1120'}}>
            {/* Background photo */}
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1543342384-1f1350e27861?w=800&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" style={{opacity:0.12}} />
              <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(11,17,32,0.7) 0%, rgba(11,17,32,0.92) 50%, rgba(11,17,32,0.98) 100%)'}} />
            </div>

            {/* ── Top bar ── */}
            <div className="relative z-10 flex justify-between items-center px-5 pt-12 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg, #2dd4a8, #818cf8)'}}>
                    <MessageCircle size={16} color="white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[17px] font-bold text-white">Kidzplainer</span>
                </div>
              </div>
              {children.length > 0 && selectedChild && (
                <button onClick={() => {
                  if (children.length <= 1) return;
                  const currentIdx = children.findIndex(c => c.id === selectedChild.id);
                  const nextIdx = (currentIdx + 1) % children.length;
                  setSelectedChild(children[nextIdx]);
                  setToast(`Switched to ${children[nextIdx].name}`);
                }} className="flex items-center gap-1.5 px-4 py-2 rounded-full" style={{border:'1.5px solid rgba(45,212,168,0.3)'}}>
                  <span className="text-[14px] font-semibold" style={{color:'#2dd4a8'}}>{selectedChild.name} ({selectedChild.age})</span>
                  {children.length > 1 && <ChevronDown size={14} style={{color:'#2dd4a8'}} />}
                </button>
              )}
            </div>

            {/* ── Hero ── */}
            {(() => {
              const t = UI_STRINGS[selLanguage] || UI_STRINGS['English'];
              const topics = TOPICS_BY_LANG[selLanguage] || TOPICS_BY_LANG['English'];
              const triggerLabels = TRIGGERS_BY_LANG[selLanguage] || TRIGGERS_BY_LANG['English'];
              const triggerEmojis = ['📺','📱','👥','🏫','👂','⚠️'];
              const isRTL = selLanguage === 'العربية';
              return (<>
            <div className="relative z-10 px-5 mt-7" style={{direction: isRTL ? 'rtl' : 'ltr'}}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{background:'#2dd4a8'}} />
                <p className="text-[16px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{t.hereToHelp}</p>
              </div>
              <h1 className="text-[32px] font-extrabold leading-[1.15]" style={{color:'#FFFFFF'}}>
                {t.whatDidAsk.replace('{name}', selectedChild?.name || 'they')}
              </h1>
            </div>

            {/* ── Question input ── */}
            <div className="relative z-10 px-5 mt-6">
              <div className="rounded-2xl px-5 py-4" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(10px)'}}>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={2}
                  placeholder={topics[0]?.q || '"What is sex?"'}
                  className="w-full bg-transparent border-none outline-none text-[19px] font-medium resize-none leading-relaxed placeholder:text-[rgba(255,255,255,0.25)]"
                  style={{color:'#FFFFFF',direction: isRTL ? 'rtl' : 'ltr'}} />
              </div>
            </div>

            {/* ── Quick topics — scrollable carousel ── */}
            <div className="relative z-10 mt-6 px-5" style={{direction: isRTL ? 'rtl' : 'ltr'}}>
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-3" style={{color:'rgba(255,255,255,0.3)'}}>{t.orPickTopic}</p>
              <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5" style={{scrollbarWidth:'none'}}>
                {topics.map(tp => (
                  <button key={tp.label} onClick={() => setQuestion(tp.q)}
                    className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl transition-all duration-150 active:scale-[0.95]"
                    style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',backdropFilter:'blur(8px)',width:100,height:85}}>
                    <span className="text-[26px] mb-1.5">{tp.emoji}</span>
                    <span className="text-[14px] font-semibold" style={{color:'rgba(255,255,255,0.55)'}}>{tp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Triggers — 3x2 grid ── */}
            <div className="relative z-10 px-5 mt-7" style={{direction: isRTL ? 'rtl' : 'ltr'}}>
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-2.5" style={{color:'rgba(255,255,255,0.3)'}}>⚡ {t.triggeredBy}</p>
              <div className="grid grid-cols-3 gap-2">
                {TRIGGERS.map((tr, idx) => (
                    <button key={tr.key} onClick={() => setSelectedTriggers(prev => prev.includes(tr.key) ? prev.filter(x=>x!==tr.key) : [...prev,tr.key])}
                      className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150"
                      style={{
                        background: selectedTriggers.includes(tr.key) ? '#2dd4a8' : 'rgba(255,255,255,0.06)',
                        color: selectedTriggers.includes(tr.key) ? '#0B1120' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${selectedTriggers.includes(tr.key) ? '#2dd4a8' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <span className="text-[11px]">{triggerEmojis[idx]}</span>{triggerLabels[idx]}
                    </button>
                ))}
              </div>
            </div>

            {genError && (
              <div className="relative z-10 mx-5 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.15)'}}>
                <AlertCircle size={15} style={{color:'#f87171'}} />
                <span className="text-[14px] font-medium" style={{color:'#f87171'}}>{genError}</span>
              </div>
            )}

            {/* ── CTA ── */}
            <div className="relative z-10 mt-auto px-5 pb-2">
              <button onClick={handleGenerate}
                className="w-full py-[18px] rounded-2xl text-[19px] font-bold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.97]"
                style={{background:'linear-gradient(135deg, #2dd4a8, #20c997)',color:'#FFFFFF',boxShadow:'0 8px 30px rgba(45,212,168,0.3)'}}>
                <Sparkles size={19}/>
                {t.generate}
              </button>
              {!isPro && !isAdmin && (
                <div className="mt-3 mx-auto flex items-center gap-2 px-4 py-2.5 rounded-full" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:'rgba(45,212,168,0.15)'}}><AlertCircle size={12} style={{color:'#22D3B7'}} /></div>
                  <span className="text-[14px] font-semibold" style={{color:'rgba(255,255,255,0.5)'}}>{t.freeRemaining.replace('{n}', String(MAX_FREE - usageCount))}</span>
                  <span className="text-[14px] font-bold" style={{color:'#22D3B7'}}>{t.signInMore}</span>
                </div>
              )}
            </div>
              </>);
            })()}

            <BottomNav active="home" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {screen === 'loading' && (() => {
          const stages = [
            { label: `Understanding ${selectedChild?.name || 'your child'}'s question...`, emoji: '🔍' },
            { label: 'Applying cultural context...', emoji: '🌍' },
            { label: 'Building age-appropriate layers...', emoji: '🧸' },
            { label: 'Adding belief-sensitive framing...', emoji: '💛' },
            { label: 'Finalizing your explanation...', emoji: '✨' },
          ];
          return (
          <div className="flex flex-col min-h-dvh relative overflow-hidden" style={{background:'#000000'}}>
            {/* Warm glow background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full" style={{background:'radial-gradient(circle, rgba(45,212,168,0.1) 0%, rgba(129,140,248,0.05) 40%, transparent 65%)'}} />
              <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 60%)'}} />
            </div>

            <div className="relative z-10 flex items-center gap-3 px-5 py-5">
              <IconBtn icon={ArrowLeft} onClick={() => navigate('home')} />
              <span className="text-[18px] font-bold" style={{color:'#FFFFFF'}}>Creating your explanation</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
              {/* Animated rings — bigger */}
              <div className="relative w-36 h-36 mb-10">
                <div className="absolute inset-0 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderTopColor:'#22D3B7',animationDuration:'1.5s'}} />
                <div className="absolute inset-3 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderBottomColor:'#818cf8',animationDuration:'2s',animationDirection:'reverse'}} />
                <div className="absolute inset-6 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderTopColor:'#f472b6',animationDuration:'2.5s'}} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">{stages[Math.min(Math.floor((Date.now() / 2500) % stages.length), stages.length - 1)].emoji}</span>
                </div>
              </div>

              {/* Stage text — bigger */}
              <p className="text-[28px] font-extrabold mb-2 leading-tight" style={{fontFamily:'Baloo 2,cursive',color:'#FFFFFF'}}>
                Personalizing for {selectedChild?.name}
              </p>
              <p className="text-[15px] font-medium mb-6" style={{color:'rgba(255,255,255,0.35)'}}>Crafting the perfect words for your conversation</p>
              <LoadingStages stages={stages} />

              {/* Progress bar */}
              <div className="w-full max-w-xs mt-8 h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                <div className="h-full rounded-full" style={{background:'linear-gradient(90deg, #22D3B7, #818cf8)',width:'70%',animation:'loadbar 3s ease-in-out infinite'}} />
              </div>
            </div>
            <style>{`@keyframes loadbar { 0%{width:10%} 50%{width:80%} 100%{width:95%} }`}</style>
          </div>
          );
        })()}

        {/* ═══ RESULT ═══ */}
        {screen === 'result' && layers && (
          <div className="flex flex-col min-h-dvh relative overflow-hidden" style={{background:'#000000'}}>
            {/* Subtle glow */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full" style={{background:'radial-gradient(circle, rgba(45,212,168,0.06) 0%, transparent 65%)'}} />
            </div>

            {/* Header with question */}
            <div className="relative z-10 px-5 pt-5 pb-5">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => navigate('home')} className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <ArrowLeft size={16} style={{color:'#FFFFFF'}} />
                </button>
                <span className="text-[18px] font-bold" style={{color:'#FFFFFF'}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).yourExplanation}</span>
              </div>
              {/* Original question as quote */}
              <div className="px-5 py-4 rounded-2xl" style={{background:'rgba(255,255,255,0.04)',borderLeft:'3px solid #22D3B7'}}>
                <p className="text-[18px] font-medium italic leading-relaxed" style={{color:'rgba(255,255,255,0.7)'}}>"{question}"</p>
                <p className="text-[15px] mt-2 font-semibold" style={{color:'#22D3B7'}}>-- {selectedChild?.name}, age {selectedChild?.age}</p>
              </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pb-20" style={{scrollbarWidth:'none'}}>
              {/* Context tags */}
              <div className="flex flex-wrap gap-2 px-5 mb-4">
                <span className="text-[13px] font-bold px-3.5 py-1.5 rounded-full" style={{background:'rgba(129,140,248,0.1)',color:'#818cf8'}}>Age {selectedChild?.age}</span>
                <span className="text-[13px] font-bold px-3.5 py-1.5 rounded-full" style={{background:'rgba(244,114,182,0.1)',color:'#f472b6'}}>{COUNTRIES.find(c=>c.name===selCountry)?.flag} {selCountry}</span>
                <span className="text-[13px] font-bold px-3.5 py-1.5 rounded-full" style={{background:'rgba(139,92,246,0.1)',color:'#8B5CF6'}}>{BELIEFS.find(b=>b.name===selBelief)?.icon} {selBelief}</span>
                <span className="text-[13px] font-bold px-3.5 py-1.5 rounded-full" style={{background:'rgba(45,212,168,0.1)',color:'#22D3B7'}}>Layered</span>
              </div>

              {/* Approach card */}
              <div className="mx-5 mb-4 rounded-2xl p-5" style={{background:'rgba(45,212,168,0.04)',border:'1px solid rgba(45,212,168,0.1)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={15} style={{color:'#22D3B7'}} />
                  <span className="text-[14px] font-extrabold uppercase tracking-[0.15em]" style={{color:'#22D3B7'}}>Layered approach</span>
                </div>
                <p className="text-[16px] leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>Start with Layer 1. Most kids are satisfied. Only open the next if they keep asking.</p>
              </div>

              {/* Layers */}
              {layers.map((l, i) => (
                <LayerCard key={i} layer={l} index={i} isOpen={openLayer === i} onToggle={() => setOpenLayer(openLayer === i ? -1 : i)} />
              ))}

              {/* Actions — vertical icon layout */}
              <div className="flex gap-2 px-5 py-4">
                {(() => { const t = UI_STRINGS[selLanguage]||UI_STRINGS['English'];
                const allText = layers.map((l,i) => `Layer ${i+1}: ${l.title}\n${l.quote}\n${l.note||''}`).join('\n\n');
                return [
                  {icon:Bookmark,label:t.save,action:saveResult},
                  {icon:Copy,label:t.copy,action:() => {
                    navigator.clipboard?.writeText(allText).then(() => {
                      setToast('Copied to clipboard!');
                    });
                  }},
                  {icon:Share2,label:t.share,action:() => {
                    const msg = encodeURIComponent(`🧒 My child asked: "${question}"\n\nHere's what Kidzplainer suggested:\n\n${layers[0]?.quote || ''}\n\nGet age-appropriate answers: https://kidzplainer.com`);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }},
                  {icon:Volume2,label:t.read,action:() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(layers[openLayer >= 0 ? openLayer : 0]?.quote || '');
                      utterance.rate = 0.9;
                      utterance.pitch = 1;
                      window.speechSynthesis.speak(utterance);
                    }
                  }},
                ]; })().map(a => (
                  <button key={a.label} onClick={a.action} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                    style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <a.icon size={20} style={{color:'#22D3B7'}} />
                    <span className="text-[12px] font-bold" style={{color:'rgba(255,255,255,0.5)'}}>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Tips */}
              {parentTip && (
                <div className="mx-5 mb-3 rounded-2xl p-5" style={{background:'rgba(45,212,168,0.04)',border:'1px solid rgba(45,212,168,0.1)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <span className="text-[13px] font-extrabold uppercase tracking-[0.12em]" style={{color:'#22D3B7'}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).howToUse}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>{parentTip}</p>
                </div>
              )}
              {misinfoTip && (
                <div className="mx-5 mb-3 rounded-2xl p-5" style={{background:'rgba(251,191,36,0.04)',border:'1px solid rgba(251,191,36,0.1)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-[13px] font-extrabold uppercase tracking-[0.12em]" style={{color:'#fbbf24'}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).wrongInfo}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>{misinfoTip}</p>
                </div>
              )}
            </div>

            <BottomNav active="" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ PAYWALL ═══ */}
        {screen === 'paywall' && (
          <div className="flex flex-col min-h-dvh relative overflow-hidden" style={{background:'#000000'}}>
            {/* ElevenLabs-style dramatic glow — warm red/orange behind, teal accent */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{background:'radial-gradient(circle, rgba(255,80,50,0.18) 0%, rgba(255,120,80,0.08) 30%, transparent 65%)'}} />
              <div className="absolute top-[10%] right-[-20%] w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle, rgba(220,60,60,0.12) 0%, transparent 60%)'}} />
              <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle, rgba(34,211,183,0.08) 0%, transparent 60%)'}} />
            </div>

            <div className="relative z-10 flex flex-col h-full px-6 pt-8 pb-6">
              {/* Top bar — close + badge */}
              <div className="flex justify-between items-center mb-8">
                <IconBtn icon={X} onClick={() => navigate('home')} />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{background:'rgba(34,211,183,0.1)',border:'1px solid rgba(34,211,183,0.2)'}}>
                  <Sparkles size={12} style={{color:'#22D3B7'}} />
                  <span className="text-[11px] font-bold tracking-widest" style={{color:'#22D3B7'}}>PRO</span>
                </div>
              </div>

              {/* HERO — Giant price like ElevenLabs $11,000,000 */}
              <div className="text-center flex-1 flex flex-col justify-center" style={{marginTop:'-2rem'}}>
                <p className="text-[16px] font-medium tracking-wide mb-3" style={{color:'rgba(255,255,255,0.4)'}}>
                  UNLIMITED EXPLANATIONS
                </p>
                <h1 className="font-black leading-none tracking-tighter" style={{
                  fontSize: selectedPlan === 'annual' ? '72px' : '80px',
                  fontFamily:'system-ui, -apple-system, sans-serif',
                  color:'white',
                  textShadow:'0 0 80px rgba(255,100,60,0.3), 0 0 160px rgba(255,80,50,0.15)',
                }}>
                  {selectedPlan === 'annual' ? '$49.99' : '$4.99'}
                </h1>
                <p className="text-[20px] font-light mt-2" style={{color:'rgba(255,255,255,0.45)'}}>
                  {selectedPlan === 'annual' ? 'per year' : 'per month'}
                </p>

                {/* Plan pills — ElevenLabs minimal style */}
                <div className="flex gap-2 mx-auto mt-8">
                  {[
                    {key:'monthly',label:'Monthly'},
                    {key:'annual',label:'Annual'},
                  ].map(p => (
                    <button key={p.key} onClick={() => setSelectedPlan(p.key)}
                      className="px-7 py-2.5 rounded-full text-[15px] font-semibold transition-all"
                      style={{
                        background: selectedPlan===p.key ? 'white' : 'rgba(255,255,255,0.08)',
                        color: selectedPlan===p.key ? '#000000' : 'rgba(255,255,255,0.45)',
                        border: selectedPlan===p.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {selectedPlan === 'annual' && (
                  <p className="text-[14px] font-medium mt-3" style={{color:'#22D3B7'}}>
                    That&apos;s just $4.17/mo — save 17%
                  </p>
                )}
              </div>

              {/* Bottom section — CTA + details */}
              <div className="mt-auto">
                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {['Unlimited','All 4 Layers','Cultural','Audio','Save & Share'].map(f => (
                    <span key={f} className="text-[12px] font-medium px-3 py-1.5 rounded-full" style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA — prominent like ElevenLabs "Sign up" */}
                <button onClick={async () => {
                  if (!user || !session) { setToast('Please sign in first'); return; }
                  setGenerating(true);
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: selectedPlan, email: user.email, userId: user.id }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      setToast(data.error || 'Failed to start checkout');
                      setGenerating(false);
                    }
                  } catch {
                    setToast('Something went wrong. Please try again.');
                    setGenerating(false);
                  }
                }}
                  disabled={generating}
                  className="w-full py-4.5 rounded-full text-[18px] font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                  style={{background:'white',color:'#000000',boxShadow:'0 0 40px rgba(255,255,255,0.1)',opacity: generating ? 0.7 : 1, padding:'18px'}}>
                  {generating ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : 'Start 7-Day Free Trial'}
                </button>

                <p className="text-center text-[13px] mt-3" style={{color:'rgba(255,255,255,0.3)'}}>
                  {selectedPlan === 'annual' ? '$49.99/year' : '$4.99/month'} after trial · Cancel anytime
                </p>

                {/* Payment methods — subtle */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>Apple Pay</span>
                  <span className="text-[11px]" style={{color:'rgba(255,255,255,0.15)'}}>·</span>
                  <span className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>Google Pay</span>
                  <span className="text-[11px]" style={{color:'rgba(255,255,255,0.15)'}}>·</span>
                  <span className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>Samsung Pay</span>
                  <span className="text-[11px]" style={{color:'rgba(255,255,255,0.15)'}}>·</span>
                  <span className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.25)'}}>Card</span>
                </div>
              </div>

              {isPro && (
                <button onClick={async () => {
                  if (!session) return;
                  try {
                    const res = await fetch('/api/manage-subscription', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${session.access_token}` },
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else setToast('Could not open subscription manager');
                  } catch { setToast('Something went wrong'); }
                }} className="mt-4 text-[14px] font-semibold text-center w-full underline" style={{color:'#22D3B7'}}>
                  Manage Subscription
                </button>
              )}

              <div className="mt-3 flex justify-center gap-4">
                {[['Refund Policy','refund'],['Terms','terms'],['Privacy','privacy']].map(([l,k]) => (
                  <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="text-[12px] font-medium underline" style={{color:'rgba(255,255,255,0.25)'}}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SAVED ═══ */}
        {screen === 'saved' && (
          <div className="flex flex-col min-h-dvh" style={{background:'var(--bg0)'}}>
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
                <div key={s.id} onClick={() => {
                  setQuestion(s.question);
                  setLayers(s.layers);
                  setOpenLayer(0);
                  navigate('result');
                }} className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]" style={{background:'var(--bg2)',borderColor:'var(--brc)',boxShadow:'var(--sh)'}}>
                  <div className="text-[15px] font-bold mb-1.5" style={{color:'var(--t1)'}}>{s.question}</div>
                  <div className="text-[13px]" style={{color:'var(--t3)'}}>
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
          <div className="flex flex-col min-h-dvh relative overflow-hidden" style={{background:'#000000'}}>
            {/* Subtle glow */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle, rgba(45,212,168,0.06) 0%, transparent 65%)'}} />
            </div>

            <div className="relative z-10 flex items-center gap-3 px-5 pt-12 pb-5">
              <Settings size={24} style={{color:'#22D3B7'}} />
              <span className="text-[24px] font-extrabold" style={{color:'#FFFFFF'}}>Settings</span>
            </div>
            <div className="relative z-10 flex-1 overflow-y-auto pb-16" style={{scrollbarWidth:'none'}}>
              {/* Profile */}
              <div className="mx-5 mt-2 text-[14px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'rgba(255,255,255,0.4)'}}>Profile<div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}} /></div>
              <p className="mx-5 mt-1.5 mb-3 text-[14px] leading-relaxed" style={{color:'rgba(255,255,255,0.3)'}}>Controls how explanations are framed for your family</p>
              <div className="mx-5 rounded-2xl overflow-hidden" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <button onClick={() => { setSetupStep(1); navigate('setup'); }} className="flex justify-between items-center px-5 py-4.5 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)',padding:'18px 20px'}}>
                  <div><span className="text-[17px] font-semibold block" style={{color:'#FFFFFF'}}>Language</span><span className="text-[13px]" style={{color:'rgba(255,255,255,0.3)'}}>Explanation output language</span></div>
                  <div className="flex items-center gap-2"><span className="text-[16px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{LANGUAGES.find(l=>l.name===selLanguage)?.flag||'🇬🇧'} {selLanguage}</span><ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} /></div>
                </button>
                <button onClick={() => { setSetupStep(2); navigate('setup'); }} className="flex justify-between items-center px-5 py-4.5 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)',padding:'18px 20px'}}>
                  <div><span className="text-[17px] font-semibold block" style={{color:'#FFFFFF'}}>Country</span><span className="text-[13px]" style={{color:'rgba(255,255,255,0.3)'}}>Cultural context for answers</span></div>
                  <div className="flex items-center gap-2"><span className="text-[16px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{COUNTRIES.find(c=>c.name===selCountry)?.flag||'🌍'} {selCountry||'Not set'}</span><ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} /></div>
                </button>
                <button onClick={() => { setSetupStep(3); navigate('setup'); }} className="flex justify-between items-center px-5 py-4.5 w-full transition-all active:bg-white/5" style={{borderColor:'transparent',padding:'18px 20px'}}>
                  <div><span className="text-[17px] font-semibold block" style={{color:'#FFFFFF'}}>Family beliefs</span><span className="text-[13px]" style={{color:'rgba(255,255,255,0.3)'}}>Shapes framing of sensitive topics</span></div>
                  <div className="flex items-center gap-2"><span className="text-[16px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{BELIEFS.find(b=>b.name===selBelief)?.icon||''} {selBelief||'Not set'}</span><ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} /></div>
                </button>
              </div>

              {/* Children */}
              <div className="mx-5 mt-6 text-[14px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'rgba(255,255,255,0.4)'}}>Children<div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}} /></div>
              <p className="mx-5 mt-1.5 mb-3 text-[14px] leading-relaxed" style={{color:'rgba(255,255,255,0.3)'}}>Explanations are personalized for each child's age</p>
              <div className="mx-5 rounded-2xl overflow-hidden" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                {children.map((c) => (
                  <div key={c.id} className="flex justify-between items-center px-5 py-4 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center gap-2.5"><Baby size={18} style={{color:'#22D3B7'}} /><span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>{c.name}</span></div>
                    <span className="text-[14px] px-3 py-1.5 rounded-full font-bold" style={{background:'rgba(129,140,248,0.12)',color:'#818cf8'}}>{c.age}</span>
                  </div>
                ))}
                <button onClick={() => navigate('addchild')} className="flex items-center gap-2 px-5 py-4 w-full transition-all active:bg-white/5">
                  <Plus size={18} style={{color:'#22D3B7'}} /><span className="text-[17px] font-semibold" style={{color:'#22D3B7'}}>Add child</span>
                </button>
              </div>

              {/* Account */}
              <div className="mx-5 mt-6 text-[14px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'rgba(255,255,255,0.4)'}}>Account<div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}} /></div>
              <p className="mx-5 mt-1.5 mb-3 text-[14px] leading-relaxed" style={{color:'rgba(255,255,255,0.3)'}}>Manage your subscription and account details</p>
              <div className="mx-5 rounded-2xl overflow-hidden" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div className="flex justify-between items-center px-5 py-4 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>Subscription</span>
                  <span className="text-[16px] font-bold px-3 py-1 rounded-full" style={{color: isPro || isAdmin ? '#000' : '#fbbf24', background: isPro || isAdmin ? '#22D3B7' : 'rgba(251,191,36,0.12)'}}>{isAdmin ? 'Admin' : isPro ? 'Pro' : `Free (${MAX_FREE - usageCount} left)`}</span>
                </div>
                {!isPro && !isAdmin && (
                  <button onClick={() => navigate('paywall')} className="flex items-center gap-2 px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                    <CreditCard size={18} style={{color:'#22D3B7'}} /><span className="text-[17px] font-semibold" style={{color:'#22D3B7'}}>Upgrade to Pro</span>
                  </button>
                )}
                {isPro && !isAdmin && (
                  <button onClick={async () => {
                    if (!session) return;
                    try {
                      const res = await fetch('/api/manage-subscription', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${session.access_token}` },
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else setToast('Could not open subscription manager');
                    } catch { setToast('Something went wrong'); }
                  }} className="flex items-center gap-2 px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                    <CreditCard size={18} style={{color:'#22D3B7'}} /><span className="text-[17px] font-semibold" style={{color:'#22D3B7'}}>Manage Subscription</span>
                  </button>
                )}
                {[['Privacy Policy','privacy'],['Terms of Service','terms'],['Refund Policy','refund']].map(([l,k]) => (
                  <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="flex justify-between items-center px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                    <span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>{l}</span>
                    <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} />
                  </button>
                ))}
                <button onClick={async () => { await signOut(); setIsLoggedIn(false); setDataLoaded(false); dataLoadedRef.current = false; setChildren([]); setSaved([]); navigate('auth'); }} className="flex items-center gap-2 px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <LogOut size={18} style={{color:'#f472b6'}} /><span className="text-[17px] font-semibold" style={{color:'#f472b6'}}>Sign Out</span>
                </button>
                <button onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone. All your data including saved explanations and children profiles will be permanently deleted.')) {
                    const msg = encodeURIComponent(`Please delete my Kidzplainer account. Email: ${user?.email || 'N/A'}, User ID: ${user?.id || 'N/A'}`);
                    window.open(`mailto:solutions@noeldcosta.com?subject=Delete My Kidzplainer Account&body=${msg}`, '_blank');
                    setToast('Account deletion request sent. We\'ll process it within 48 hours.');
                  }
                }} className="flex items-center gap-2 px-5 py-4 w-full transition-all active:bg-white/5">
                  <X size={18} style={{color:'rgba(255,255,255,0.3)'}} /><span className="text-[17px] font-semibold" style={{color:'rgba(255,255,255,0.3)'}}>Delete Account</span>
                </button>
              </div>

              {/* Feedback & Support */}
              <div className="mx-5 mt-6 text-[14px] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'rgba(255,255,255,0.4)'}}>Feedback & Support<div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}} /></div>
              <p className="mx-5 mt-1.5 mb-3 text-[14px] leading-relaxed" style={{color:'rgba(255,255,255,0.3)'}}>Help us improve Kidzplainer for every family</p>
              <div className="mx-5 rounded-2xl overflow-hidden" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <button onClick={() => { window.open(`mailto:solutions@noeldcosta.com?subject=Kidzplainer Feedback&body=Hi Kidzplainer team,%0A%0A`, '_blank'); }} className="flex justify-between items-center px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-2.5"><Mail size={18} style={{color:'#22D3B7'}} /><span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>Send Feedback</span></div>
                  <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} />
                </button>
                <button onClick={() => navigate('review')} className="flex justify-between items-center px-5 py-4 w-full border-b transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-2.5"><Star size={18} style={{color:'#fbbf24'}} /><span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>Leave a Review</span></div>
                  <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} />
                </button>
                <button onClick={() => { window.open(`https://wa.me/+971501234567?text=Hi, I need help with Kidzplainer`, '_blank'); }} className="flex justify-between items-center px-5 py-4 w-full transition-all active:bg-white/5" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-2.5"><MessageCircle size={18} style={{color:'#25D366'}} /><span className="text-[17px] font-semibold" style={{color:'#FFFFFF'}}>WhatsApp Support</span></div>
                  <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}} />
                </button>
              </div>

              <div className="text-center mt-8 mb-4 text-[15px] font-medium" style={{color:'rgba(255,255,255,0.2)'}}>Kidzplainer v1.0</div>
            </div>
            <BottomNav active="settings" onNav={s => navigate(s === 'home' ? 'home' : s === 'saved' ? 'saved' : 'settings')} />
          </div>
        )}

        {/* ═══ REVIEW ═══ */}
        {screen === 'review' && (
          <div className="flex flex-col min-h-dvh" style={{background:'var(--bg0)'}}>
            <div className="flex items-center gap-3 px-5 py-4">
              <IconBtn icon={ArrowLeft} onClick={() => { setReviewSubmitted(false); setReviewText(''); navigate('settings'); }} />
              <span className="text-[18px] font-bold" style={{color:'var(--t1)'}}>Leave a Review</span>
            </div>
            <div className="flex-1 px-6 pt-4">
              {reviewSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center mt-16">
                  <span className="text-5xl mb-4">🎉</span>
                  <h3 className="text-2xl font-extrabold mb-2" style={{fontFamily:'Baloo 2,cursive',color:'var(--t1)'}}>Thank you!</h3>
                  <p className="text-[16px] leading-relaxed" style={{color:'var(--t3)'}}>Your review has been submitted for approval. We appreciate your feedback!</p>
                  <button onClick={() => { setReviewSubmitted(false); setReviewText(''); navigate('settings'); }} className="mt-8 px-8 py-3.5 rounded-xl text-[16px] font-bold" style={{background:'var(--ac)',color:'#0A0E17'}}>Back to Settings</button>
                </div>
              ) : (
                <>
                  <p className="text-[16px] mb-6 leading-relaxed" style={{color:'var(--t2)'}}>Your review helps other parents discover Kidzplainer. All reviews are moderated before publishing.</p>

                  <p className="text-[14px] font-bold mb-3" style={{color:'var(--t1)'}}>How would you rate Kidzplainer?</p>
                  <div className="flex gap-2 mb-6">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewStars(s)} className="transition-all active:scale-90">
                        <Star size={36} fill={s <= reviewStars ? '#fbbf24' : 'transparent'} style={{color: s <= reviewStars ? '#fbbf24' : 'var(--t3)'}} />
                      </button>
                    ))}
                  </div>

                  <p className="text-[14px] font-bold mb-3" style={{color:'var(--t1)'}}>Tell us more (optional)</p>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What do you love about Kidzplainer? How has it helped your family?" rows={4} className="w-full rounded-xl p-4 text-[16px] resize-none outline-none transition-all focus:ring-2" style={{background:'var(--bg2)',color:'var(--t1)',border:'1px solid var(--brc)',focusRingColor:'var(--ac)'}} />

                  <button onClick={async () => {
                    try {
                      await db.submitReview(user?.id, user?.email, reviewStars, reviewText);
                    } catch(e) { /* table might not exist yet */ }
                    setReviewSubmitted(true);
                  }} className="w-full mt-6 py-4 rounded-xl text-[18px] font-bold transition-all active:scale-[0.97]" style={{background:'linear-gradient(135deg,var(--ac),#1AB5A0)',color:'#0A0E17',boxShadow:'0 6px 20px rgba(45,212,168,0.25)'}}>
                    Submit Review
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ LEGAL ═══ */}
        {screen === 'legal' && (
          <div className="flex flex-col min-h-dvh" style={{background:'var(--bg0)'}}>
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
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Kidzplainer ("we", "our") respects your privacy and is committed to protecting the personal data of you and your family.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Data We Collect</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>We collect: your email address for authentication, your child's first name and age group for personalization, your country and belief preferences for content calibration, and the questions you submit. We do NOT collect your child's full name, date of birth, photos, location data, or any other identifying information about your child.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>How We Use Data</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Your data is used solely to generate personalized explanations. We do not sell, share, or monetize your data. Questions are processed by AI and are not stored on our servers beyond what's needed for your saved history.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Children's Privacy (COPPA)</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Kidzplainer is designed for parents, not children. We do not knowingly collect personal information from children under 13. The child's first name is provided by the parent and used only within the parent's account.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Data Security</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Stripe for payment processing — we never see or store your credit card details.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Your Rights</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>You can export, modify, or delete your data at any time from Settings. Account deletion permanently removes all your data within 30 days. Contact: solutions@noeldcosta.com</p>
              </>}
              {legalPage === 'terms' && <>
                <h3 className="text-lg font-bold" style={{color:'var(--t1)',fontFamily:'Baloo 2,cursive'}}>Terms of Service</h3>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Last updated: March 2026</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>By using Kidzplainer, you agree to these terms. Kidzplainer provides AI-generated educational content to help parents communicate with their children. We are not a substitute for professional advice from child psychologists, therapists, or medical professionals.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Content Disclaimer</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>AI-generated content is provided as a starting point for conversations. Parents should review all content before sharing with their children and adjust based on their judgment. We strive for accuracy but cannot guarantee all content will be appropriate for every family's specific situation.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Acceptable Use</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>You may not use Kidzplainer to generate harmful, abusive, or inappropriate content. We reserve the right to terminate accounts that violate these terms.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Subscriptions</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Free accounts receive {MAX_FREE} explanations. Pro subscriptions are billed monthly ($6.99/mo) or annually ($49.99/yr). You can cancel at any time — access continues until the end of your billing period.</p>
              </>}
              {legalPage === 'refund' && <>
                <h3 className="text-lg font-bold" style={{color:'var(--t1)',fontFamily:'Baloo 2,cursive'}}>Refund Policy</h3>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>Last updated: March 2026</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>We want you to be completely satisfied with Kidzplainer.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>7-Day Money-Back Guarantee</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>If you're not happy with your Pro subscription, you can request a full refund within 7 days of your first payment. No questions asked. Email solutions@noeldcosta.com with your account email.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>App Store / Google Play Purchases</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>For subscriptions purchased through the App Store or Google Play, refunds are handled according to Apple's and Google's respective refund policies. Please contact Apple or Google directly for these refunds.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>After 7 Days</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>After the 7-day window, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your current billing period. No partial refunds are issued for the remaining time.</p>
                <p className="text-sm font-bold mt-2" style={{color:'var(--t1)'}}>Contact</p>
                <p className="text-[13px] leading-relaxed" style={{color:'var(--t2)'}}>For any billing questions: solutions@noeldcosta.com</p>
              </>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
