'use client'

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, ArrowLeft, ChevronDown, ChevronRight, Search,
  Bookmark, Copy, Share2, Volume2, Settings, Home, BookOpen,
  Plus, X, Check, AlertCircle, Shield, Loader2, Sparkles,
  Star, Baby, LogOut, User, Mail, KeyRound, Layers, Eye, EyeOff,
  Users, Heart, Globe, School, Smartphone, Tv, Ear, Lock,
  CreditCard, ChevronUp, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signInWithEmail, signUp, signOut, resetPassword } from "@/lib/auth";
import * as db from "@/lib/db";
import { supabase } from "@/lib/supabase";

// ═══════════════════════════════════════
// KIDZPLAINER — WARM LIGHT REDESIGN
// ═══════════════════════════════════════

// Brand palette
const B = {
  brand: '#F07854',
  brandSoft: '#FFF5F0',
  brandDark: '#D4603E',
  bg: '#FFFAF7',
  white: '#FFFFFF',
  text1: '#1C1917',
  text2: '#78716C',
  text3: '#A8A29E',
  border: 'rgba(0,0,0,0.08)',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  shadowMd: '0 6px 24px rgba(0,0,0,0.10)',
  l1: '#F07854', l1s: 'rgba(240,120,84,0.08)',
  l2: '#6366F1', l2s: 'rgba(99,102,241,0.08)',
  l3: '#EC4899', l3s: 'rgba(236,72,153,0.08)',
  l4: '#F59E0B', l4s: 'rgba(245,158,11,0.08)',
};

// ─── DATA ───────────────────────────────

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

const HOW_FOUND_OPTIONS = [
  {emoji:"🍎",label:"App Store"},
  {emoji:"👥",label:"Friend / Family"},
  {emoji:"📱",label:"Social Media"},
  {emoji:"🔍",label:"Google Search"},
  {emoji:"📺",label:"YouTube / TV"},
  {emoji:"✨",label:"Other"},
];

const PERSONALITIES = [
  {emoji:"🔍",label:"Very Curious"},
  {emoji:"💬",label:"Very Talkative"},
  {emoji:"🌸",label:"Sensitive"},
  {emoji:"📚",label:"Literal Thinker"},
  {emoji:"🎨",label:"Creative"},
  {emoji:"😌",label:"Calm & Shy"},
  {emoji:"😰",label:"Gets Anxious"},
  {emoji:"😊",label:"Outgoing"},
];

const TOPICS_BY_LANG: Record<string, {emoji:string,label:string,q:string}[]> = {
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

const UI_STRINGS: Record<string, Record<string, string>> = {
  'English': { greeting:'Good evening', hereToHelp:"We're here to help", whatDidAsk:'What did {name} ask?', orPickTopic:'Or pick a topic', triggeredBy:'Triggered by', generate:'Generate Child Friendly Explanation', freeRemaining:'{n} free explanations remaining', signInMore:'Upgrade for unlimited', yourExplanation:'Your Explanation', save:'Save', copy:'Copy', share:'Share', read:'Read', howToUse:'How to use the layers', wrongInfo:'If they heard wrong info' },
  'العربية': { greeting:'مساء الخير', hereToHelp:'نحن هنا للمساعدة', whatDidAsk:'ماذا سأل {name}؟', orPickTopic:'أو اختر موضوعاً', triggeredBy:'السبب', generate:'إنشاء شرح مناسب للأطفال', freeRemaining:'{n} شروحات مجانية متبقية', signInMore:'سجل دخول للمزيد', yourExplanation:'شرحك', save:'حفظ', copy:'نسخ', share:'مشاركة', read:'قراءة', howToUse:'كيفية استخدام الطبقات', wrongInfo:'إذا سمعوا معلومات خاطئة' },
  'हिन्दी': { greeting:'शुभ संध्या', hereToHelp:'हम मदद के लिए यहाँ हैं', whatDidAsk:'{name} ने क्या पूछा?', orPickTopic:'या एक विषय चुनें', triggeredBy:'कारण', generate:'बच्चों के अनुकूल व्याख्या बनाएं', freeRemaining:'{n} मुफ्त व्याख्याएं शेष', signInMore:'अधिक के लिए साइन इन करें', yourExplanation:'आपकी व्याख्या', save:'सहेजें', copy:'कॉपी', share:'शेयर', read:'पढ़ें', howToUse:'परतों का उपयोग कैसे करें', wrongInfo:'अगर उन्होंने गलत जानकारी सुनी' },
  'Español': { greeting:'Buenas tardes', hereToHelp:'Estamos aquí para ayudar', whatDidAsk:'¿Qué preguntó {name}?', orPickTopic:'O elige un tema', triggeredBy:'Provocado por', generate:'Generar Explicación para Niños', freeRemaining:'{n} explicaciones gratuitas restantes', signInMore:'Inicia sesión para más', yourExplanation:'Tu Explicación', save:'Guardar', copy:'Copiar', share:'Compartir', read:'Leer', howToUse:'Cómo usar las capas', wrongInfo:'Si escucharon información incorrecta' },
  'Français': { greeting:'Bonsoir', hereToHelp:'Nous sommes là pour aider', whatDidAsk:"Qu'a demandé {name} ?", orPickTopic:'Ou choisissez un sujet', triggeredBy:'Déclenché par', generate:'Générer une explication adaptée', freeRemaining:'{n} explications gratuites restantes', signInMore:'Connectez-vous pour plus', yourExplanation:'Votre Explication', save:'Sauver', copy:'Copier', share:'Partager', read:'Lire', howToUse:'Comment utiliser les couches', wrongInfo:"S'ils ont entendu de fausses infos" },
  '中文': { greeting:'晚上好', hereToHelp:'我们来帮助您', whatDidAsk:'{name}问了什么？', orPickTopic:'或选择一个话题', triggeredBy:'触发原因', generate:'生成儿童友好解释', freeRemaining:'{n} 次免费解释剩余', signInMore:'登录获取更多', yourExplanation:'您的解释', save:'保存', copy:'复制', share:'分享', read:'朗读', howToUse:'如何使用分层', wrongInfo:'如果他们听到了错误信息' },
  'Português': { greeting:'Boa noite', hereToHelp:'Estamos aqui para ajudar', whatDidAsk:'O que {name} perguntou?', orPickTopic:'Ou escolha um tema', triggeredBy:'Provocado por', generate:'Gerar Explicação para Crianças', freeRemaining:'{n} explicações gratuitas restantes', signInMore:'Entre para mais', yourExplanation:'Sua Explicação', save:'Salvar', copy:'Copiar', share:'Compartilhar', read:'Ler', howToUse:'Como usar as camadas', wrongInfo:'Se ouviram informações erradas' },
  'Deutsch': { greeting:'Guten Abend', hereToHelp:'Wir sind hier um zu helfen', whatDidAsk:'Was hat {name} gefragt?', orPickTopic:'Oder wähle ein Thema', triggeredBy:'Ausgelöst durch', generate:'Kindgerechte Erklärung erstellen', freeRemaining:'{n} kostenlose Erklärungen übrig', signInMore:'Anmelden für mehr', yourExplanation:'Deine Erklärung', save:'Speichern', copy:'Kopieren', share:'Teilen', read:'Vorlesen', howToUse:'So verwendest du die Ebenen', wrongInfo:'Wenn sie falsche Infos gehört haben' },
};

const TRIGGERS_BY_LANG: Record<string, string[]> = {
  'English': ['TV / Movie','iPad / Phone','Friend told them','At school','Overheard adults','Real event'],
  'العربية': ['تلفزيون / فيلم','آيباد / هاتف','أخبرهم صديق','في المدرسة','سمعوا الكبار','حدث حقيقي'],
  'हिन्दी': ['टीवी / फिल्म','आईपैड / फोन','दोस्त ने बताया','स्कूल में','बड़ों की बात सुनी','असली घटना'],
  'Español': ['TV / Película','iPad / Teléfono','Un amigo les dijo','En la escuela','Escucharon adultos','Evento real'],
  'Français': ['TV / Film','iPad / Téléphone','Un ami leur a dit','À l\'école','Entendu des adultes','Événement réel'],
  '中文': ['电视/电影','iPad/手机','朋友告诉的','在学校','听到大人说','真实事件'],
  'Português': ['TV / Filme','iPad / Celular','Amigo contou','Na escola','Ouviram adultos','Evento real'],
  'Deutsch': ['TV / Film','iPad / Handy','Freund erzählte','In der Schule','Erwachsene gehört','Echtes Ereignis'],
};

const TESTIMONIALS = [
  {quote:'My 5-year-old asked about death after grandpa passed. This app gave me the exact words I needed.',name:'Sarah M.',location:'Dubai, UAE',stars:5},
  {quote:'Finally, an app that respects our Islamic values while being honest with our kids.',name:'Ahmed K.',location:'Riyadh, SA',stars:5},
  {quote:'My daughter asked "what is sex" at dinner. Instead of panicking, I opened the app. Layer 1 was perfect.',name:'Jessica R.',location:'London, UK',stars:5},
  {quote:'As a Hindu family in the US, it\'s hard to find resources that respect our beliefs. This nails it.',name:'Priya S.',location:'New York, US',stars:5},
];

// ─── API ────────────────────────────────

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

// ═══════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════

function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center" style={{width:size,height:size,borderRadius:size*0.3,background:`linear-gradient(135deg, ${B.brand}, #E85D3A)`}}>
        <MessageCircle size={size*0.5} color="white" strokeWidth={2.5} />
      </div>
      <span className="font-extrabold tracking-tight" style={{fontFamily:'Baloo 2,cursive',fontSize:size*0.65,color:B.text1}}>Kidzplainer</span>
    </div>
  );
}

function BrandBtn({ children, onClick, disabled = false, loading = false, variant = 'primary', full = true }: any) {
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.97]"
      style={{
        width: full ? '100%' : 'auto',
        height: 56, borderRadius: 16,
        background: isPrimary ? B.brand : B.white,
        color: isPrimary ? '#FFFFFF' : B.brand,
        border: isPrimary ? 'none' : `2px solid ${B.brand}`,
        boxShadow: isPrimary ? `0 4px 20px rgba(240,120,84,0.35)` : 'none',
        fontSize: 16, fontWeight: 700,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

function InputField({ label, icon: Icon, type = 'text', value, onChange, placeholder, error }: any) {
  const [show, setShow] = useState(false);
  const actualType = type === 'password' && show ? 'text' : type;
  return (
    <div style={{marginBottom:16}}>
      {label && <label className="block" style={{fontSize:12,fontWeight:700,color:B.text3,marginBottom:6,letterSpacing:'0.08em',textTransform:'uppercase'}}>{label}</label>}
      <div className="relative">
        {Icon && <Icon size={17} className="absolute" style={{left:14,top:'50%',transform:'translateY(-50%)',color:B.text3}} />}
        <input type={actualType} value={value} onChange={(e:any) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full outline-none transition-all"
          style={{height:52,borderRadius:14,border:`1.5px solid ${error ? '#EF4444' : B.border}`,background:B.white,paddingLeft:Icon?44:16,paddingRight:type==='password'?44:16,fontSize:15,fontWeight:500,color:B.text1,boxSizing:'border-box'}}
          onFocus={(e:any) => { e.target.style.borderColor = B.brand; }}
          onBlur={(e:any) => { e.target.style.borderColor = error ? '#EF4444' : B.border; }} />
        {type === 'password' && (
          <button onClick={() => setShow(!show)} className="absolute" style={{right:14,top:'50%',transform:'translateY(-50%)'}}>
            {show ? <EyeOff size={17} color={B.text3} /> : <Eye size={17} color={B.text3} />}
          </button>
        )}
      </div>
      {error && <p className="flex items-center gap-1" style={{fontSize:12,color:'#EF4444',marginTop:4}}><AlertCircle size={12}/>{error}</p>}
    </div>
  );
}

function SelectRow({ label, desc, icon, selected, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 text-left transition-all active:scale-[0.98]"
      style={{padding:'14px 16px',borderRadius:16,border:`1.5px solid ${selected ? B.brand : B.border}`,background:selected ? B.brandSoft : B.white,marginBottom:10}}>
      <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{fontSize:15,color:B.text1}}>{label}</p>
        {desc && <p className="truncate" style={{fontSize:12,color:B.text2,marginTop:1}}>{desc}</p>}
      </div>
      <div className="flex-shrink-0" style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${selected ? B.brand : B.border}`,background:selected ? B.brand : B.white,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
        {selected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
      </div>
    </button>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{width:i===current?24:8,height:8,borderRadius:4,background:i===current?B.brand:'rgba(0,0,0,0.12)',transition:'all 0.3s'}} />
      ))}
    </div>
  );
}

function ProgressBar({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({length:steps}).map((_,i) => (
        <div key={i} className="flex-1" style={{height:4,borderRadius:2,background:i<current?B.brand:i===current?B.brand+'80':'rgba(0,0,0,0.08)',transition:'all 0.3s'}} />
      ))}
    </div>
  );
}

function BottomNav({ active, onNav }: any) {
  const items = [
    {key:'home',icon:Home,label:'Home'},
    {key:'saved',icon:BookOpen,label:'Saved'},
    {key:'community',icon:Users,label:'Community'},
    {key:'settings',icon:Settings,label:'Settings'},
  ];
  return (
    <div className="sticky bottom-0 left-0 right-0 flex justify-around backdrop-blur-xl"
      style={{background:'rgba(255,255,255,0.97)',borderTop:`1px solid ${B.border}`,padding:'8px 0 24px'}}>
      {items.map(it => (
        <button key={it.key} onClick={() => onNav(it.key)} className="flex flex-col items-center gap-1 relative" style={{opacity:active===it.key?1:0.4,transition:'opacity 0.2s'}}>
          {active===it.key && <div className="absolute -top-2 w-5 h-[3px] rounded-full" style={{background:B.brand}} />}
          <it.icon size={20} style={{color:active===it.key?B.brand:B.text2}} />
          <span style={{fontSize:10,fontWeight:active===it.key?700:500,color:active===it.key?B.brand:B.text2}}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function LayerCard({ layer, isOpen, onToggle, index }: any) {
  const colors = [B.l1, B.l2, B.l3, B.l4];
  const softColors = [B.l1s, B.l2s, B.l3s, B.l4s];
  const c = colors[index] || colors[0];
  const sc = softColors[index] || softColors[0];
  return (
    <div className="mx-5 mb-3 overflow-hidden transition-all"
      style={{borderRadius:20,background:B.white,border:`1.5px solid ${isOpen ? c+'40' : B.border}`,boxShadow:isOpen ? `0 4px 20px ${c}15` : B.shadow}}>
      <button onClick={onToggle} className="w-full flex justify-between items-center text-left" style={{padding:'16px 18px'}}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center" style={{width:44,height:44,borderRadius:14,background:sc,border:`1.5px solid ${c}30`,fontSize:17,fontWeight:800,color:c}}>
            {layer.level}
          </div>
          <div>
            <p className="font-bold" style={{fontSize:16,color:B.text1}}>{layer.title}</p>
            <p style={{fontSize:13,color:B.text2,marginTop:2}}>{layer.subtitle}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center" style={{width:32,height:32,borderRadius:'50%',background:isOpen?B.brandSoft:'#F5F5F4',transition:'transform 0.3s',transform:isOpen?'rotate(180deg)':'rotate(0deg)'}}>
          <ChevronDown size={16} style={{color:isOpen?B.brand:B.text2}} />
        </div>
      </button>
      <div style={{maxHeight:isOpen?900:0,overflow:'hidden',transition:'max-height 0.45s ease-in-out'}}>
        <div style={{padding:'0 18px 18px'}}>
          <div style={{height:1,background:`${c}20`,marginBottom:16}} />
          <div style={{background:sc,borderLeft:`3px solid ${c}`,borderRadius:'0 12px 12px 0',padding:'16px 18px',marginBottom:14}}>
            <p style={{fontSize:17,fontStyle:'italic',lineHeight:1.7,color:B.text1,fontWeight:500}}>
              &ldquo;{layer.quote}&rdquo;
            </p>
          </div>
          {layer.note && <p style={{fontSize:14,color:B.text2,lineHeight:1.65,marginBottom:14}}>{layer.note}</p>}
          {layer.nextQ && (
            <div className="flex items-center gap-2.5" style={{background:`${c}08`,border:`1.5px solid ${c}25`,borderRadius:14,padding:'12px 16px'}}>
              <ChevronRight size={16} style={{color:c,flexShrink:0}} />
              <div>
                <p style={{fontSize:11,fontWeight:700,color:`${c}99`,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>If they ask more</p>
                <p style={{fontSize:14,fontWeight:600,color:c}}>{layer.nextQ}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingStages({ stages }: any) {
  const [currentStage, setCurrentStage] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setCurrentStage(prev => Math.min(prev + 1, stages.length - 1)), 2500);
    return () => clearInterval(interval);
  }, [stages.length]);
  return (
    <div className="space-y-3 w-full max-w-xs">
      {stages.map((s: any, i: number) => (
        <div key={i} className="flex items-center gap-3 transition-all" style={{opacity:i<=currentStage?1:0.2}}>
          <span className="text-[18px] w-6 text-center">
            {i < currentStage ? <Check size={16} color={B.brand} /> : i === currentStage ? s.emoji : <span style={{color:B.text3}}>&#9675;</span>}
          </span>
          <span style={{fontSize:15,textAlign:'left',color:i<=currentStage?B.text1:B.text3,fontWeight:i===currentStage?600:400}}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════

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

  // Setup (4 steps: language, country, belief, how-found)
  const [setupStep, setSetupStep] = useState(1);
  const [selLanguage, setSelLanguage] = useState('English');
  const [selCountry, setSelCountry] = useState('');
  const [selBelief, setSelBelief] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [howFound, setHowFound] = useState('');

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
  const [layers, setLayers] = useState<any[]|null>(null);
  const [parentTip, setParentTip] = useState('');
  const [misinfoTip, setMisinfoTip] = useState('');
  const [openLayer, setOpenLayer] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Usage
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const ADMIN_EMAIL = 'noeldcosta2018@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;
  const MAX_FREE = 7;

  // Saved
  const [saved, setSaved] = useState<any[]>([]);

  // Onboarding
  const [onboardingSlide, setOnboardingSlide] = useState(0);

  // Legal
  const [legalPage, setLegalPage] = useState<string|null>(null);

  // Reviews
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  // ─── Auth state handling ───
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
          try { profile = await db.getProfile(user.id); } catch (e) { console.log('Profile not found'); }
          let childrenData: any[] = [];
          try { childrenData = await db.getChildren(user.id); } catch (e) { console.log('No children'); }
          let usageData = 0;
          try { usageData = await db.getUsageCount(user.id); } catch (e) { console.log('No usage'); }
          let subscription = null;
          try { subscription = await db.getSubscription(user.id); } catch (e) { console.log('No subscription'); }

          if (profile) {
            if (profile.language) setSelLanguage(profile.language);
            if (profile.country) setSelCountry(profile.country);
            if (profile.belief) setSelBelief(profile.belief);
          }
          if (childrenData && childrenData.length > 0) {
            const mapped = childrenData.map((c: any) => ({ id: c.id, name: c.name, age: c.age_range }));
            setChildren(mapped);
            setSelectedChild(mapped[0]);
          }
          setUsageCount(usageData);
          setIsPro(!!subscription);
          setDataLoaded(true);

          if (profile?.country && profile?.belief && childrenData && childrenData.length > 0) {
            if (screen === 'splash' || screen === 'onboarding' || screen === 'auth') navigate('home');
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

      db.getSavedExplanations(user.id).then((explanations: any[]) => {
        const mapped = explanations.map((e: any) => ({
          id: e.id, question: e.question,
          child: { name: e.children?.name || 'Child', age: e.children?.age_range || '' },
          layers: e.layers, date: new Date(e.created_at).toLocaleDateString(),
          country: e.country, belief: e.belief, triggers: e.triggers || [],
        }));
        setSaved(mapped);
      }).catch(console.error);
    } else if (!authContextLoading) {
      setIsLoggedIn(false);
      setDataLoaded(false);
      dataLoadedRef.current = false;
    }
  }, [user, session, authContextLoading]);

  // Stripe checkout redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    if (checkoutStatus === 'success') { setToast('Subscription activated! Welcome to Pro.'); setIsPro(true); window.history.replaceState({}, '', window.location.pathname); }
    else if (checkoutStatus === 'cancel') { setToast('Checkout cancelled.'); window.history.replaceState({}, '', window.location.pathname); }
  }, []);

  // Splash timer
  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => {
        if (authContextLoading) return;
        if (user) return;
        navigate('onboarding');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [screen, authContextLoading, user]);

  // ─── Auth handlers ───
  const handleAuth = async (mode: string) => {
    setAuthError('');
    if (!email.trim()) return setAuthError('Email is required');
    if (!email.includes('@')) return setAuthError('Please enter a valid email');
    if (mode === 'forgot') {
      setAuthLoading(true);
      try { await resetPassword(email); setAuthError(''); setAuthMode('login'); setToast('Check your email for a reset link.'); }
      catch (err: any) { setAuthError(err.message || 'Failed to send reset email'); }
      finally { setAuthLoading(false); }
      return;
    }
    if (!password) return setAuthError('Password is required');
    if (password.length < 6) return setAuthError('Password must be at least 6 characters');
    if (mode === 'signup' && password !== confirmPass) return setAuthError('Passwords do not match');
    setAuthLoading(true);
    try {
      if (mode === 'signup') { await signUp(email, password); setToast('Check your email to confirm your account.'); setAuthMode('login'); }
      else { await signInWithEmail(email, password); }
    } catch (err: any) { setAuthError(err.message || 'Authentication failed'); }
    finally { setAuthLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try { await signInWithGoogle(); }
    catch (err: any) { setAuthError(err.message || 'Google sign-in failed'); setAuthLoading(false); }
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
      const result = await generateLayers(question, selectedChild.name, selectedChild.age, selCountry, selBelief, selectedTriggers.join(', '), triggerDetail, selLanguage, token);
      setLayers(result.layers);
      setParentTip(result.parentTip);
      setMisinfoTip(result.misinfoTip);
      setOpenLayer(0);
      setUsageCount(prev => prev + 1);
      navigate('result');
    } catch (err: any) {
      if (err.message === 'FREE_LIMIT_REACHED') { navigate('paywall'); return; }
      setGenError('Failed to generate explanation. Please try again.');
      navigate('home');
    } finally { setGenerating(false); }
  };

  const saveResult = async () => {
    if (!layers || !selectedChild || !user) return;
    try {
      const saved_entry = await db.saveExplanation(user.id, {
        child_id: selectedChild.id, question, triggers: selectedTriggers,
        trigger_detail: triggerDetail, layers, parent_tip: parentTip,
        misinfo_tip: misinfoTip, country: selCountry, belief: selBelief, language: selLanguage,
      });
      setSaved(prev => [{ id: saved_entry.id, question, child: selectedChild, layers, date: new Date().toLocaleDateString(), country: selCountry, belief: selBelief, triggers: selectedTriggers }, ...prev]);
      setToast('Saved!');
    } catch (err) { console.error('Error saving:', err); }
  };

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="flex flex-col items-center min-h-screen" style={{fontFamily:'Plus Jakarta Sans, sans-serif',background:B.bg}}>
      <div className="w-full max-w-[500px] overflow-hidden relative" style={{background:B.bg,minHeight:'100vh'}}>

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl max-w-[90vw]"
            style={{background:B.brand,color:'#FFFFFF',boxShadow:B.shadowMd}}>
            <p className="text-[14px] font-semibold text-center">{toast}</p>
          </div>
        )}

        {/* ═══ SPLASH ═══ */}
        {screen === 'splash' && (
          <div className="flex flex-col items-center justify-center text-center" style={{background:B.bg,minHeight:'100vh'}}>
            <div className="relative flex items-center justify-center" style={{width:80,height:80,borderRadius:24,background:`linear-gradient(135deg, ${B.brand}, #E85D3A)`,boxShadow:`0 8px 40px rgba(240,120,84,0.35)`}}>
              <MessageCircle size={40} color="white" strokeWidth={2.5} />
            </div>
            <div className="mt-4" style={{fontSize:28,fontWeight:800,fontFamily:'Baloo 2,cursive',color:B.text1}}>Kidzplainer</div>
            <Loader2 size={20} className="mt-6 animate-spin" style={{color:B.brand}} />
          </div>
        )}

        {/* ═══ ONBOARDING (3 slides) ═══ */}
        {screen === 'onboarding' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              {onboardingSlide === 0 && (<>
                <div className="mb-6" style={{fontSize:80}}>🤔</div>
                <h1 className="font-extrabold leading-tight mb-4" style={{fontSize:30,color:B.text1,fontFamily:'Baloo 2,cursive'}}>
                  Never freeze when your child asks<br/><span style={{color:B.brand}}>the hard stuff</span>
                </h1>
                <p style={{fontSize:16,color:B.text2,lineHeight:1.7,maxWidth:320}}>
                  Get the perfect words — personalised for your child's age, culture and beliefs.
                </p>
              </>)}
              {onboardingSlide === 1 && (<>
                <div className="mb-6" style={{fontSize:80}}>🧩</div>
                <h1 className="font-extrabold leading-tight mb-4" style={{fontSize:30,color:B.text1,fontFamily:'Baloo 2,cursive'}}>
                  Start simple.<br/><span style={{color:B.brand}}>Go deeper only if they ask more.</span>
                </h1>
                <p style={{fontSize:16,color:B.text2,lineHeight:1.7,maxWidth:320}}>
                  Our unique 4-layer approach means you always have the right answer ready — and you control how much they learn.
                </p>
              </>)}
              {onboardingSlide === 2 && (<>
                <div className="mb-6" style={{fontSize:80}}>🌍</div>
                <h1 className="font-extrabold leading-tight mb-4" style={{fontSize:30,color:B.text1,fontFamily:'Baloo 2,cursive'}}>
                  Trusted by parents<br/><span style={{color:B.brand}}>worldwide</span>
                </h1>
                <div className="flex gap-0.5 justify-center mb-3">{[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#F59E0B" color="#F59E0B" />)}</div>
                <p style={{fontSize:14,color:B.text2,lineHeight:1.7,maxWidth:300}}>
                  &ldquo;My daughter asked 'what is sex' at dinner. Instead of panicking, I opened the app. Layer 1 was perfect.&rdquo;
                </p>
                <p className="mt-2 font-bold" style={{fontSize:13,color:B.brand}}>— Jessica R., London</p>
              </>)}
            </div>

            <div className="px-8 pb-10">
              <ProgressDots total={3} current={onboardingSlide} />
              <div className="mt-6">
                {onboardingSlide < 2 ? (
                  <div className="flex gap-3">
                    <button onClick={() => navigate('auth')} className="flex-1 font-semibold" style={{height:56,borderRadius:16,fontSize:16,color:B.text2}}>Skip</button>
                    <BrandBtn full={false} onClick={() => setOnboardingSlide(prev => prev + 1)}>
                      <span style={{padding:'0 32px'}}>Next</span>
                    </BrandBtn>
                  </div>
                ) : (
                  <BrandBtn onClick={() => navigate('auth')}>Get Started</BrandBtn>
                )}
              </div>
              <p className="text-center mt-4" style={{fontSize:14,color:B.text3}}>
                Already have an account? <button onClick={() => {setAuthMode('login');navigate('auth')}} className="font-bold" style={{color:B.brand}}>Sign in</button>
              </p>
            </div>
          </div>
        )}

        {/* ═══ AUTH ═══ */}
        {screen === 'auth' && (
          <div className="flex flex-col min-h-dvh px-6 pt-8 pb-8" style={{background:B.bg}}>
            <Logo size={32} />

            <div className="mt-8 mb-2">
              <h2 className="font-extrabold leading-tight" style={{fontSize:30,color:B.text1,fontFamily:'Baloo 2,cursive'}}>
                {authMode === 'login' ? 'Welcome back' : authMode === 'signup' ? 'Create account' : 'Reset password'}
              </h2>
              <p className="mt-2" style={{fontSize:15,color:B.text2,lineHeight:1.6}}>
                {authMode === 'login' ? 'Sign in to continue helping your child understand the world.' : authMode === 'signup' ? `Get ${MAX_FREE} free explanations — no card needed.` : 'We\'ll send you a reset link.'}
              </p>
            </div>

            <div className="mt-6 flex-1">
              {authMode !== 'forgot' && (
                <>
                  <button onClick={handleGoogleAuth} disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.97]"
                    style={{height:56,borderRadius:16,background:B.white,color:B.text1,border:`1.5px solid ${B.border}`,boxShadow:B.shadow,fontSize:16,marginBottom:20}}>
                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : <>
                      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                      Continue with Google
                    </>}
                  </button>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{background:B.border}} />
                    <span style={{fontSize:13,fontWeight:600,color:B.text3}}>or</span>
                    <div className="flex-1 h-px" style={{background:B.border}} />
                  </div>
                </>
              )}

              <InputField label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="parent@example.com" error={authError && authError.includes('email') ? authError : ''} />
              {authMode !== 'forgot' && (
                <InputField label="Password" icon={KeyRound} type="password" value={password} onChange={setPassword} placeholder="••••••••" error={authError && authError.includes('assword') ? authError : ''} />
              )}
              {authMode === 'signup' && (
                <InputField label="Confirm Password" icon={KeyRound} type="password" value={confirmPass} onChange={setConfirmPass} placeholder="••••••••" error={authError && authError.includes('match') ? authError : ''} />
              )}

              {authError && !authError.includes('email') && !authError.includes('assword') && !authError.includes('match') && (
                <p className="flex items-center gap-1 mb-3" style={{fontSize:14,color:'#EF4444'}}><AlertCircle size={14}/>{authError}</p>
              )}

              {authMode === 'login' && (
                <button onClick={() => setAuthMode('forgot')} className="block ml-auto mb-4 font-semibold" style={{fontSize:14,color:B.brand}}>Forgot password?</button>
              )}

              <BrandBtn onClick={() => handleAuth(authMode)} loading={authLoading}>
                {authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </BrandBtn>

              <div className="mt-5 text-center">
                {authMode === 'login' ? (
                  <p style={{fontSize:15,color:B.text2}}>Don&apos;t have an account? <button onClick={() => {setAuthMode('signup');setAuthError('')}} className="font-bold" style={{color:B.brand}}>Sign up</button></p>
                ) : (
                  <p style={{fontSize:15,color:B.text2}}>Already have an account? <button onClick={() => {setAuthMode('login');setAuthError('')}} className="font-bold" style={{color:B.brand}}>Sign in</button></p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              {[['Privacy Policy','privacy'],['Terms','terms']].map(([l,k]) => (
                <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} style={{fontSize:12,color:B.text3}}>{l}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SETUP (language → country → belief → how found) ═══ */}
        {screen === 'setup' && (() => {
          const isFromSettings = prevScreen === 'settings';
          const saveAndReturn = async (updates: any) => {
            if (user) {
              try {
                await db.upsertProfile(user.id, { email: user.email, name: userName, language: selLanguage, country: selCountry, belief: selBelief, ...updates });
              } catch (err) { console.error('Error saving profile:', err); }
            }
            if (isFromSettings) navigate('settings');
          };
          return (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="px-6 pt-6 pb-0">
              {isFromSettings && (
                <button onClick={() => navigate('settings')} className="flex items-center gap-2 mb-3">
                  <ArrowLeft size={18} style={{color:B.text2}} />
                  <span style={{fontSize:14,fontWeight:600,color:B.text2}}>Back to Settings</span>
                </button>
              )}
              {!isFromSettings && (
                <>
                  <h2 className="font-extrabold mb-1" style={{fontSize:24,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Let&apos;s personalise your experience</h2>
                  <p className="mb-5" style={{fontSize:14,color:B.text3}}>This helps us frame answers perfectly for your family.</p>
                  <ProgressBar steps={4} current={setupStep - 1} />
                  <div className="h-5" />
                </>
              )}
            </div>

            <div className="flex-1 px-6 pb-6 overflow-y-auto" style={{scrollbarWidth:'none'}}>

              {/* Step 1: Language */}
              {setupStep === 1 && (<>
                <p className="font-bold mb-1" style={{fontSize:20,color:B.text1,fontFamily:'Baloo 2,cursive'}}>What language do you speak at home?</p>
                <p className="mb-5" style={{fontSize:13,color:B.text3}}>Explanations will be generated in this language.</p>
                {LANGUAGES.map(l => (
                  <SelectRow key={l.name} label={l.name} icon={l.flag} selected={selLanguage===l.name}
                    onClick={async () => {
                      setSelLanguage(l.name);
                      if (isFromSettings) { await saveAndReturn({language: l.name}); }
                      else setSetupStep(2);
                    }} />
                ))}
              </>)}

              {/* Step 2: Country */}
              {setupStep === 2 && (<>
                <p className="font-bold mb-1" style={{fontSize:20,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Where are you raising your child?</p>
                <p className="mb-4" style={{fontSize:13,color:B.text3}}>A 5-year-old in India needs different context than one in the US.</p>
                <div className="relative mb-3">
                  <Search size={16} className="absolute" style={{left:14,top:'50%',transform:'translateY(-50%)',color:B.text3}} />
                  <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search country..."
                    className="w-full outline-none"
                    style={{height:48,borderRadius:14,border:`1.5px solid ${B.border}`,background:B.white,paddingLeft:44,paddingRight:16,fontSize:15,color:B.text1}} />
                </div>
                <div className="max-h-[380px] overflow-y-auto" style={{scrollbarWidth:'none'}}>
                  {filteredCountries.map(c => (
                    <SelectRow key={c.name} label={c.name} icon={c.flag} selected={selCountry===c.name}
                      onClick={async () => {
                        setSelCountry(c.name);
                        if (isFromSettings) { await saveAndReturn({country: c.name}); }
                        else setSetupStep(3);
                      }} />
                  ))}
                </div>
                {!isFromSettings && <button onClick={() => setSetupStep(1)} className="mt-3 font-semibold" style={{fontSize:14,color:B.brand}}>← Back</button>}
              </>)}

              {/* Step 3: Belief */}
              {setupStep === 3 && (<>
                <p className="font-bold mb-1" style={{fontSize:20,color:B.text1,fontFamily:'Baloo 2,cursive'}}>What does your family believe?</p>
                <p className="mb-5" style={{fontSize:13,color:B.text3,lineHeight:1.6}}>This shapes how we frame answers — especially around death, purpose, and relationships. Always truthful. This adjusts framing, not facts.</p>
                {BELIEFS.map(b => (
                  <SelectRow key={b.name} label={b.name} desc={b.desc} icon={b.icon} selected={selBelief===b.name}
                    onClick={async () => {
                      setSelBelief(b.name);
                      if (isFromSettings) { await saveAndReturn({belief: b.name}); }
                    }} />
                ))}
                {!isFromSettings && selBelief && (
                  <BrandBtn onClick={() => setSetupStep(4)} disabled={!selBelief}>Next</BrandBtn>
                )}
                {!isFromSettings && <button onClick={() => setSetupStep(2)} className="mt-3 font-semibold block mx-auto" style={{fontSize:14,color:B.brand}}>← Back</button>}
              </>)}

              {/* Step 4: How found */}
              {setupStep === 4 && (<>
                <p className="font-bold mb-1" style={{fontSize:20,color:B.text1,fontFamily:'Baloo 2,cursive'}}>How did you find us?</p>
                <p className="mb-5" style={{fontSize:13,color:B.text3}}>This helps us serve more parents like you.</p>
                {HOW_FOUND_OPTIONS.map(h => (
                  <SelectRow key={h.label} label={h.label} icon={h.emoji} selected={howFound===h.label}
                    onClick={() => setHowFound(h.label)} />
                ))}
                <div className="mt-4">
                  <BrandBtn disabled={!selBelief || !selCountry} onClick={async () => {
                    if (user) {
                      try {
                        await db.upsertProfile(user.id, { email: user.email, name: userName, language: selLanguage, country: selCountry, belief: selBelief });
                      } catch (err) { console.error('Error saving profile:', err); }
                    }
                    navigate('addchild');
                  }}>
                    Done — Add your child
                  </BrandBtn>
                </div>
                <button onClick={() => setSetupStep(3)} className="mt-3 font-semibold block mx-auto" style={{fontSize:14,color:B.brand}}>← Back</button>
              </>)}
            </div>
          </div>
          );
        })()}

        {/* ═══ ADD CHILD ═══ */}
        {screen === 'addchild' && (
          <div className="flex flex-col min-h-dvh px-6 pt-6 pb-8" style={{background:B.bg}}>
            <Logo size={24} />
            <h2 className="mt-5 font-extrabold" style={{fontSize:24,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Add your child</h2>
            <div className="flex items-center gap-2 mt-2 mb-5 px-3 py-2.5 rounded-xl" style={{background:B.brandSoft,border:`1px solid ${B.brand}30`}}>
              <Shield size={14} style={{color:B.brand,flexShrink:0}} />
              <p style={{fontSize:13,color:B.brandDark,fontWeight:500}}>Use their first name only — never their full name</p>
            </div>

            <InputField label="Child's first name" icon={User} value={childName} onChange={setChildName} placeholder="e.g. Omar, Sarah, Arjun" />

            <div className="mb-4">
              <label className="block" style={{fontSize:12,fontWeight:700,color:B.text3,marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}}>Age group</label>
              <div className="grid grid-cols-4 gap-2">
                {['3-5','6-8','9-11','12-14'].map(a => (
                  <button key={a} onClick={() => setChildAge(a)}
                    className="text-center font-bold transition-all active:scale-[0.95]"
                    style={{height:48,borderRadius:14,fontSize:14,background:childAge===a?B.brand:B.white,color:childAge===a?'#FFFFFF':B.text2,border:`1.5px solid ${childAge===a?B.brand:B.border}`,boxShadow:childAge===a?`0 4px 16px rgba(240,120,84,0.3)`:B.shadow}}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block" style={{fontSize:12,fontWeight:700,color:B.text3,marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}}>What&apos;s their nature? (pick any)</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITIES.map(p => {
                  const sel = childPersonalities.includes(p.label);
                  return (
                    <button key={p.label} onClick={() => setChildPersonalities(prev => sel ? prev.filter(x=>x!==p.label) : [...prev, p.label])}
                      className="flex items-center gap-1.5 transition-all active:scale-[0.95]"
                      style={{padding:'8px 14px',borderRadius:12,fontSize:13,fontWeight:600,background:sel?B.brandSoft:B.white,color:sel?B.brand:B.text2,border:`1.5px solid ${sel?B.brand:B.border}`}}>
                      <span>{p.emoji}</span>{p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {children.length > 0 && (
              <div className="mb-4">
                <label className="block" style={{fontSize:12,fontWeight:700,color:B.text3,marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase'}}>Added children</label>
                {children.map(c => (
                  <div key={c.id} className="flex items-center justify-between mb-2" style={{padding:'12px 16px',borderRadius:14,background:B.white,border:`1.5px solid ${B.border}`}}>
                    <div className="flex items-center gap-2">
                      <Baby size={16} style={{color:B.brand}} />
                      <span className="font-semibold" style={{fontSize:15,color:B.text1}}>{c.name}</span>
                      <span style={{fontSize:12,padding:'2px 8px',borderRadius:8,background:B.l2s,color:B.l2,fontWeight:600}}>{c.age}</span>
                    </div>
                    <button onClick={() => setChildren(prev => prev.filter(x => x.id !== c.id))}><X size={14} style={{color:B.text3}} /></button>
                  </div>
                ))}
              </div>
            )}

            <BrandBtn variant="outline" onClick={async () => {
              if (childName.trim() && childAge && user) {
                try {
                  const newChild = await db.addChild(user.id, childName.trim(), childAge);
                  const mapped = { name: newChild.name, age: newChild.age_range, id: newChild.id };
                  setChildren(prev => [...prev, mapped]);
                  setSelectedChild(mapped);
                  setChildName(''); setChildAge(''); setChildPersonalities([]);
                } catch (err) { console.error('Error adding child:', err); }
              }
            }} disabled={!childName.trim() || !childAge}>
              <Plus size={16} /> Add child
            </BrandBtn>

            <div className="mt-3">
              <BrandBtn onClick={async () => {
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
              }} disabled={children.length === 0 && (!childName.trim() || !childAge)}>
                Continue to app
              </BrandBtn>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-center gap-2">
              <Shield size={12} style={{color:B.text3}} />
              <span style={{fontSize:11,color:B.text3}}>Your child&apos;s data is encrypted and never shared</span>
            </div>
          </div>
        )}

        {/* ═══ HOME ═══ */}
        {screen === 'home' && (() => {
          const t = UI_STRINGS[selLanguage] || UI_STRINGS['English'];
          const topics = TOPICS_BY_LANG[selLanguage] || TOPICS_BY_LANG['English'];
          const triggerLabels = TRIGGERS_BY_LANG[selLanguage] || TRIGGERS_BY_LANG['English'];
          const triggerEmojis = ['📺','📱','👥','🏫','👂','⚠️'];
          const isRTL = selLanguage === 'العربية';
          const hour = new Date().getHours();
          const greetingText = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
          return (
          <div className="flex flex-col relative" style={{height:'100vh',overflow:'hidden',background:B.bg}}>
            <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:'none',paddingBottom:90}}>

              {/* Top bar */}
              <div className="flex justify-between items-start px-5 pt-12 pb-2">
                <div>
                  <p className="mb-0.5" style={{fontSize:14,color:B.text3,fontWeight:500}}>{greetingText} 👋</p>
                  <Logo size={28} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {!isPro && !isAdmin && (
                    <button onClick={() => navigate('paywall')} className="flex items-center gap-1.5" style={{padding:'6px 12px',borderRadius:20,background:B.brandSoft,border:`1px solid ${B.brand}30`}}>
                      <span style={{fontSize:13,fontWeight:700,color:B.brand}}>{MAX_FREE - usageCount} free left</span>
                    </button>
                  )}
                  {isPro && (
                    <div className="flex items-center gap-1" style={{padding:'6px 12px',borderRadius:20,background:B.brandSoft,border:`1px solid ${B.brand}30`}}>
                      <Sparkles size={12} style={{color:B.brand}} />
                      <span style={{fontSize:12,fontWeight:700,color:B.brand}}>PRO</span>
                    </div>
                  )}
                  {children.length > 0 && selectedChild && (
                    <button onClick={() => {
                      if (children.length <= 1) return;
                      const idx = children.findIndex((c:any) => c.id === selectedChild.id);
                      const next = (idx + 1) % children.length;
                      setSelectedChild(children[next]);
                      setToast(`Switched to ${children[next].name}`);
                    }} className="flex items-center gap-1" style={{padding:'6px 12px',borderRadius:20,background:B.white,border:`1px solid ${B.border}`}}>
                      <span style={{fontSize:13,fontWeight:600,color:B.text1}}>{selectedChild.name}</span>
                      {children.length > 1 && <ChevronDown size={12} style={{color:B.text3}} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Hero title */}
              <div className="px-5 mt-6 mb-5" style={{direction:isRTL?'rtl':'ltr'}}>
                <h1 className="font-extrabold leading-[1.1] tracking-tight" style={{fontSize:34,color:B.text1,fontFamily:'Plus Jakarta Sans,sans-serif'}}>
                  {t.whatDidAsk.replace('{name}', selectedChild?.name || 'they')} <span style={{color:B.brand}}>🤔</span>
                </h1>
              </div>

              {/* Question input */}
              <div className="px-5 mb-5" style={{direction:isRTL?'rtl':'ltr'}}>
                <div style={{borderRadius:20,padding:'18px 20px',background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                  <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                    placeholder={topics[0]?.q || '"What is sex?"'}
                    className="w-full bg-transparent border-none outline-none resize-none leading-relaxed"
                    style={{color:B.text1,direction:isRTL?'rtl':'ltr',fontSize:17,fontWeight:500}} />
                  <div className="flex items-center justify-between pt-2" style={{borderTop:`1px solid ${B.border}`}}>
                    <span style={{fontSize:12,color:B.text3}}>Type their question above</span>
                    {question.length > 0 && (
                      <button onClick={() => setQuestion('')} style={{fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:20,background:B.brandSoft,color:B.brand}}>Clear</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick topics carousel */}
              <div className="mb-5" style={{direction:isRTL?'rtl':'ltr'}}>
                <p className="px-5 mb-3" style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.2em',color:B.text3}}>{t.orPickTopic}</p>
                <div className="flex gap-3 overflow-x-auto px-5" style={{scrollbarWidth:'none'}}>
                  {topics.map(tp => (
                    <button key={tp.label} onClick={() => setQuestion(tp.q)}
                      className="flex-shrink-0 flex flex-col items-center justify-center transition-all active:scale-[0.95]"
                      style={{width:90,height:80,borderRadius:18,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                      <span style={{fontSize:28,marginBottom:4}}>{tp.emoji}</span>
                      <span style={{fontSize:12,fontWeight:600,color:B.text2}}>{tp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers 3x2 */}
              <div className="px-5 mb-5" style={{direction:isRTL?'rtl':'ltr'}}>
                <p className="mb-3" style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.2em',color:B.text3}}>⚡ {t.triggeredBy}</p>
                <div className="grid grid-cols-3 gap-2">
                  {TRIGGERS.map((tr, idx) => {
                    const active = selectedTriggers.includes(tr.key);
                    return (
                      <button key={tr.key} onClick={() => setSelectedTriggers(prev => prev.includes(tr.key) ? prev.filter(x=>x!==tr.key) : [...prev,tr.key])}
                        className="flex items-center justify-center gap-1.5 transition-all active:scale-[0.95]"
                        style={{padding:'12px 6px',borderRadius:14,fontSize:12,fontWeight:600,background:active?B.brandSoft:B.white,color:active?B.brand:B.text2,border:`1.5px solid ${active?B.brand:B.border}`,boxShadow:active?`0 2px 12px rgba(240,120,84,0.15)`:B.shadow}}>
                        <span>{triggerEmojis[idx]}</span>
                        <span>{triggerLabels[idx]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {genError && (
                <div className="mx-5 mb-4 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)'}}>
                  <AlertCircle size={15} style={{color:'#EF4444'}} />
                  <span style={{fontSize:14,fontWeight:500,color:'#EF4444'}}>{genError}</span>
                </div>
              )}

              {/* CTA */}
              <div className="px-5 pb-4">
                <BrandBtn onClick={handleGenerate}>
                  <Sparkles size={18} /> {t.generate}
                </BrandBtn>
              </div>
            </div>
            <BottomNav active="home" onNav={(s:string) => navigate(s)} />
          </div>
          );
        })()}

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
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex items-center gap-3 px-5 py-5">
              <button onClick={() => navigate('home')} style={{width:40,height:40,borderRadius:12,background:B.white,border:`1.5px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ArrowLeft size={18} style={{color:B.text1}} />
              </button>
              <span className="font-bold" style={{fontSize:18,color:B.text1}}>Creating your explanation</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="relative" style={{width:120,height:120,marginBottom:32}}>
                <div className="absolute inset-0 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderTopColor:B.brand,animationDuration:'1.5s'}} />
                <div className="absolute inset-3 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderBottomColor:B.l2,animationDuration:'2s',animationDirection:'reverse'}} />
                <div className="absolute inset-6 rounded-full border-[3px] animate-spin" style={{borderColor:'transparent',borderTopColor:B.l3,animationDuration:'2.5s'}} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{fontSize:32}}>{stages[Math.min(Math.floor((Date.now() / 2500) % stages.length), stages.length - 1)].emoji}</span>
                </div>
              </div>
              <p className="font-extrabold leading-tight mb-2" style={{fontSize:24,color:B.text1,fontFamily:'Baloo 2,cursive'}}>
                Personalizing for {selectedChild?.name}
              </p>
              <p className="mb-6" style={{fontSize:15,color:B.text3}}>Crafting the perfect words for your conversation</p>
              <LoadingStages stages={stages} />
              <div className="w-full max-w-xs mt-8 overflow-hidden" style={{height:6,borderRadius:3,background:'rgba(0,0,0,0.06)'}}>
                <div style={{height:'100%',borderRadius:3,background:`linear-gradient(90deg, ${B.brand}, ${B.l2})`,width:'70%',animation:'loadbar 3s ease-in-out infinite'}} />
              </div>
            </div>
            <style>{`@keyframes loadbar { 0%{width:10%} 50%{width:80%} 100%{width:95%} }`}</style>
          </div>
          );
        })()}

        {/* ═══ RESULT ═══ */}
        {screen === 'result' && layers && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            {/* Header */}
            <div className="px-5 pt-12 pb-4" style={{borderBottom:`1px solid ${B.border}`}}>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('home')} style={{width:40,height:40,borderRadius:12,background:B.white,border:`1.5px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:B.shadow}}>
                  <ArrowLeft size={16} style={{color:B.text1}} />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-bold" style={{fontSize:16,color:B.text1}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).yourExplanation}</span>
                </div>
                <div style={{width:40}} />
              </div>
              <div style={{borderRadius:16,padding:'16px 18px',background:B.brandSoft,borderLeft:`3px solid ${B.brand}`}}>
                <p className="italic leading-relaxed font-medium" style={{color:B.text1,fontSize:16}}>&ldquo;{question}&rdquo;</p>
                <p className="mt-1.5 font-bold" style={{color:B.brand,fontSize:13}}>— {selectedChild?.name}, age {selectedChild?.age}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20" style={{scrollbarWidth:'none'}}>
              {/* Context pills */}
              <div className="flex gap-2 px-5 py-4 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                <span className="flex-shrink-0 font-bold" style={{fontSize:12,padding:'6px 12px',borderRadius:20,background:B.l2s,color:B.l2}}>🎂 Age {selectedChild?.age}</span>
                <span className="flex-shrink-0 font-bold" style={{fontSize:12,padding:'6px 12px',borderRadius:20,background:B.l3s,color:B.l3}}>{COUNTRIES.find(c=>c.name===selCountry)?.flag} {selCountry}</span>
                <span className="flex-shrink-0 font-bold" style={{fontSize:12,padding:'6px 12px',borderRadius:20,background:'rgba(139,92,246,0.08)',color:'#8B5CF6'}}>{BELIEFS.find(b=>b.name===selBelief)?.icon} {selBelief}</span>
              </div>

              {/* How to use */}
              <div className="mx-5 mb-5" style={{borderRadius:20,padding:'16px 20px',background:B.brandSoft,border:`1px solid ${B.brand}20`}}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={15} style={{color:B.brand}} />
                  <span style={{fontSize:12,fontWeight:800,color:B.brand,textTransform:'uppercase',letterSpacing:'0.15em'}}>How to use</span>
                </div>
                <p style={{fontSize:14,color:B.text2,lineHeight:1.65}}>
                  Start with Layer 1. Most kids are satisfied after that. Only open the next layer if they keep asking.
                </p>
              </div>

              {/* Layers */}
              {layers.map((l, i) => (
                <LayerCard key={i} layer={l} index={i} isOpen={openLayer === i} onToggle={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setOpenLayer(openLayer === i ? -1 : i);
                }} />
              ))}

              {/* Actions */}
              <div className="px-5 py-5">
                {(() => {
                  const t = UI_STRINGS[selLanguage]||UI_STRINGS['English'];
                  const allText = layers.map((l,i) => `Layer ${i+1}: ${l.title}\n${l.quote}\n${l.note||''}`).join('\n\n');
                  return [
                    {icon:Bookmark,label:t.save,action:saveResult,color:B.l2},
                    {icon:Copy,label:t.copy,action:() => {
                      navigator.clipboard?.writeText(allText).then(() => setToast('Copied!'));
                    },color:B.brand},
                    {icon:Share2,label:t.share,action:() => {
                      const msg = encodeURIComponent(`🧒 My child asked: "${question}"\n\nHere's what Kidzplainer suggested:\n\n${layers[0]?.quote || ''}\n\nGet age-appropriate answers: https://kidzplainer.com`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    },color:B.l3},
                    {icon: isSpeaking ? X : Volume2, label: isSpeaking ? 'Stop' : t.read, action:() => {
                      if (!('speechSynthesis' in window)) return;
                      if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
                      const text = layers[openLayer >= 0 ? openLayer : 0]?.quote || '';
                      const utterance = new SpeechSynthesisUtterance(text);
                      const voices = window.speechSynthesis.getVoices();
                      const preferred = ['Google UK English Female','Google US English','Samantha','Karen','Moira','Tessa','Victoria','Fiona','Daniel','Alex'];
                      let picked: SpeechSynthesisVoice | null = null;
                      for (const name of preferred) { picked = voices.find(v => v.name === name) || picked; if (picked?.name === name) break; }
                      if (!picked) picked = voices.find(v => /en-US|en-GB|en-AU/i.test(v.lang)) || voices[0];
                      if (picked) utterance.voice = picked;
                      utterance.rate = 0.88; utterance.pitch = 1.05; utterance.volume = 1;
                      utterance.onstart = () => setIsSpeaking(true);
                      utterance.onend = () => setIsSpeaking(false);
                      utterance.onerror = () => setIsSpeaking(false);
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    },color: isSpeaking ? '#EF4444' : B.l4},
                  ].map(a => (
                    <button key={a.label} onClick={a.action}
                      className="flex items-center gap-4 w-full mb-2 transition-all active:scale-[0.98]"
                      style={{padding:'14px 18px',borderRadius:16,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                      <div className="flex-shrink-0 flex items-center justify-center" style={{width:40,height:40,borderRadius:12,background:`${a.color}12`,border:`1px solid ${a.color}25`}}>
                        <a.icon size={18} style={{color:a.color}} />
                      </div>
                      <span className="font-semibold" style={{fontSize:15,color:B.text1}}>{a.label}</span>
                      <ChevronRight size={14} className="ml-auto" style={{color:B.text3}} />
                    </button>
                  ));
                })()}
              </div>

              {/* Tips */}
              {parentTip && (
                <div className="mx-5 mb-3" style={{borderRadius:20,padding:'16px 20px',background:B.brandSoft,border:`1px solid ${B.brand}15`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{fontSize:16}}>💡</span>
                    <span style={{fontSize:12,fontWeight:800,color:B.brand,textTransform:'uppercase',letterSpacing:'0.15em'}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).howToUse}</span>
                  </div>
                  <p style={{fontSize:14,color:B.text2,lineHeight:1.65}}>{parentTip}</p>
                </div>
              )}
              {misinfoTip && (
                <div className="mx-5 mb-4" style={{borderRadius:20,padding:'16px 20px',background:B.l4s,border:`1px solid ${B.l4}15`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{fontSize:16}}>⚠️</span>
                    <span style={{fontSize:12,fontWeight:800,color:B.l4,textTransform:'uppercase',letterSpacing:'0.15em'}}>{(UI_STRINGS[selLanguage]||UI_STRINGS['English']).wrongInfo}</span>
                  </div>
                  <p style={{fontSize:14,color:B.text2,lineHeight:1.65}}>{misinfoTip}</p>
                </div>
              )}
            </div>
            <BottomNav active="" onNav={(s:string) => navigate(s)} />
          </div>
        )}

        {/* ═══ PAYWALL ═══ */}
        {screen === 'paywall' && (
          <div className="flex flex-col min-h-dvh relative" style={{background:B.bg}}>
            {/* Soft warm glow at top */}
            <div className="absolute top-0 left-0 right-0 h-[300px]" style={{background:`linear-gradient(180deg, ${B.brandSoft} 0%, ${B.bg} 100%)`}} />

            <div className="relative z-10 flex flex-col h-full px-6 pt-8 pb-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('home')} style={{width:40,height:40,borderRadius:12,background:B.white,border:`1.5px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <X size={18} style={{color:B.text1}} />
                </button>
                <div className="flex items-center gap-1.5" style={{padding:'6px 14px',borderRadius:20,background:B.brandSoft,border:`1px solid ${B.brand}30`}}>
                  <Sparkles size={12} style={{color:B.brand}} />
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:B.brand}}>PRO</span>
                </div>
              </div>

              <div className="text-center flex-1 flex flex-col justify-center" style={{marginTop:'-2rem'}}>
                <p style={{fontSize:15,fontWeight:600,color:B.text3,marginBottom:8}}>UNLIMITED EXPLANATIONS</p>
                <h1 className="font-black leading-none tracking-tighter" style={{fontSize:selectedPlan==='annual'?64:72,color:B.text1,fontFamily:'system-ui, -apple-system, sans-serif'}}>
                  {selectedPlan === 'annual' ? '$49.99' : '$4.99'}
                </h1>
                <p style={{fontSize:18,color:B.text3,marginTop:8}}>{selectedPlan === 'annual' ? 'per year' : 'per month'}</p>

                <div className="flex gap-2 mx-auto mt-8">
                  {[{key:'monthly',label:'Monthly'},{key:'annual',label:'Annual'}].map(p => (
                    <button key={p.key} onClick={() => setSelectedPlan(p.key)}
                      className="font-semibold transition-all"
                      style={{padding:'10px 28px',borderRadius:20,fontSize:15,background:selectedPlan===p.key?B.brand:B.white,color:selectedPlan===p.key?'#FFFFFF':B.text2,border:`1.5px solid ${selectedPlan===p.key?B.brand:B.border}`,boxShadow:selectedPlan===p.key?`0 4px 16px rgba(240,120,84,0.3)`:B.shadow}}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {selectedPlan === 'annual' && (
                  <p className="mt-3 font-medium" style={{fontSize:14,color:B.brand}}>That&apos;s just $4.17/mo — save 17%</p>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {['Unlimited','All 4 Layers','Cultural','Audio','Save & Share'].map(f => (
                    <span key={f} className="font-medium" style={{fontSize:12,padding:'6px 14px',borderRadius:20,background:B.white,color:B.text2,border:`1px solid ${B.border}`}}>{f}</span>
                  ))}
                </div>

                <BrandBtn onClick={async () => {
                  if (!user || !session) { setToast('Please sign in first'); return; }
                  setGenerating(true);
                  try {
                    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: selectedPlan, email: user.email, userId: user.id }) });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else { setToast(data.error || 'Failed to start checkout'); setGenerating(false); }
                  } catch { setToast('Something went wrong.'); setGenerating(false); }
                }} loading={generating}>
                  Start 7-Day Free Trial
                </BrandBtn>

                <p className="text-center mt-3" style={{fontSize:13,color:B.text3}}>
                  {selectedPlan === 'annual' ? '$49.99/year' : '$4.99/month'} after trial · Cancel anytime
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  {['Apple Pay','Google Pay','Samsung Pay','Card'].map((m,i) => (
                    <span key={m}>{i>0 && <span style={{color:B.text3,marginRight:8}}>·</span>}<span style={{fontSize:11,fontWeight:500,color:B.text3}}>{m}</span></span>
                  ))}
                </div>

                {isPro && (
                  <button onClick={async () => {
                    if (!session) return;
                    try { const res = await fetch('/api/manage-subscription', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } }); const data = await res.json(); if (data.url) window.location.href = data.url; else setToast('Could not open subscription manager'); }
                    catch { setToast('Something went wrong'); }
                  }} className="mt-4 font-semibold text-center w-full underline" style={{fontSize:14,color:B.brand}}>Manage Subscription</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SAVED ═══ */}
        {screen === 'saved' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex items-center gap-3 px-5 pt-12 pb-4">
              <BookOpen size={20} style={{color:B.brand}} />
              <span className="font-extrabold" style={{fontSize:22,color:B.text1}}>Saved Explanations</span>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-20 space-y-3" style={{scrollbarWidth:'none'}}>
              {saved.length === 0 ? (
                <div className="text-center pt-20">
                  <BookOpen size={40} className="mx-auto mb-3" style={{color:B.text3,opacity:0.3}} />
                  <p className="font-medium" style={{fontSize:15,color:B.text3}}>No saved explanations yet</p>
                  <p className="mt-1" style={{fontSize:13,color:B.text3,opacity:0.6}}>Generate one and tap Save</p>
                </div>
              ) : saved.map(s => (
                <button key={s.id} onClick={() => { setQuestion(s.question); setLayers(s.layers); setOpenLayer(0); navigate('result'); }}
                  className="w-full text-left transition-all active:scale-[0.98]"
                  style={{padding:'16px 18px',borderRadius:18,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                  <div className="font-bold mb-1.5" style={{fontSize:15,color:B.text1}}>{s.question}</div>
                  <div style={{fontSize:13,color:B.text3}}>
                    {s.child.name} ({s.child.age}) · {COUNTRIES.find((c:any)=>c.name===s.country)?.flag} · {BELIEFS.find((b:any)=>b.name===s.belief)?.icon} · {s.layers.length} layers · {s.date}
                  </div>
                </button>
              ))}
            </div>
            <BottomNav active="saved" onNav={(s:string) => navigate(s)} />
          </div>
        )}

        {/* ═══ COMMUNITY ═══ */}
        {screen === 'community' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="px-5 pt-12 pb-4">
              <h1 className="font-extrabold" style={{fontSize:24,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Parents Like You</h1>
              <p style={{fontSize:14,color:B.text3,marginTop:4}}>Real stories from families using Kidzplainer</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-20 space-y-4" style={{scrollbarWidth:'none'}}>
              {/* Social proof banner */}
              <div className="flex items-center gap-4" style={{padding:'16px 20px',borderRadius:20,background:B.brandSoft,border:`1px solid ${B.brand}20`}}>
                <div className="text-center flex-shrink-0">
                  <p className="font-extrabold" style={{fontSize:28,color:B.brand}}>4.9</p>
                  <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}</div>
                </div>
                <div>
                  <p className="font-bold" style={{fontSize:15,color:B.text1}}>50,000+ parents trust us</p>
                  <p style={{fontSize:13,color:B.text2}}>Across 40+ countries worldwide</p>
                </div>
              </div>

              {/* Testimonials */}
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{padding:'18px 20px',borderRadius:20,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s<=t.stars?'#F59E0B':'transparent'} color={s<=t.stars?'#F59E0B':B.text3} />)}</div>
                  <p className="italic leading-relaxed mb-3" style={{fontSize:14,color:B.text1}}>&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-bold" style={{fontSize:13,color:B.brand}}>{t.name} <span style={{color:B.text3,fontWeight:400}}>· {t.location}</span></p>
                </div>
              ))}

              {/* Leave a review CTA */}
              <div className="text-center pt-4">
                <p className="mb-3" style={{fontSize:14,color:B.text2}}>Have your own experience to share?</p>
                <BrandBtn variant="outline" onClick={() => navigate('review')}>
                  <Star size={16} /> Leave a Review
                </BrandBtn>
              </div>
            </div>
            <BottomNav active="community" onNav={(s:string) => navigate(s)} />
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {screen === 'settings' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex items-center gap-3 px-5 pt-12 pb-5">
              <Settings size={22} style={{color:B.brand}} />
              <span className="font-extrabold" style={{fontSize:24,color:B.text1}}>Settings</span>
            </div>
            <div className="flex-1 overflow-y-auto pb-20" style={{scrollbarWidth:'none'}}>

              {/* Profile section */}
              <div className="mx-5 mb-1 flex items-center gap-2">
                <span style={{fontSize:13,fontWeight:700,color:B.text3,textTransform:'uppercase',letterSpacing:'0.1em'}}>Profile</span>
                <div className="flex-1 h-px" style={{background:B.border}} />
              </div>
              <p className="mx-5 mb-3" style={{fontSize:13,color:B.text3}}>Controls how explanations are framed for your family</p>
              <div className="mx-5 overflow-hidden" style={{borderRadius:20,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                <button onClick={() => { setSetupStep(1); navigate('setup'); }} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'16px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <div><span className="font-semibold block" style={{fontSize:16,color:B.text1}}>Language</span><span style={{fontSize:12,color:B.text3}}>Explanation output language</span></div>
                  <div className="flex items-center gap-2"><span style={{fontSize:14,color:B.text2}}>{LANGUAGES.find(l=>l.name===selLanguage)?.flag} {selLanguage}</span><ChevronRight size={16} style={{color:B.text3}} /></div>
                </button>
                <button onClick={() => { setSetupStep(2); navigate('setup'); }} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'16px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <div><span className="font-semibold block" style={{fontSize:16,color:B.text1}}>Country</span><span style={{fontSize:12,color:B.text3}}>Cultural context for answers</span></div>
                  <div className="flex items-center gap-2"><span style={{fontSize:14,color:B.text2}}>{COUNTRIES.find(c=>c.name===selCountry)?.flag||'🌍'} {selCountry||'Not set'}</span><ChevronRight size={16} style={{color:B.text3}} /></div>
                </button>
                <button onClick={() => { setSetupStep(3); navigate('setup'); }} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'16px 20px'}}>
                  <div><span className="font-semibold block" style={{fontSize:16,color:B.text1}}>Family beliefs</span><span style={{fontSize:12,color:B.text3}}>Shapes framing of sensitive topics</span></div>
                  <div className="flex items-center gap-2"><span style={{fontSize:14,color:B.text2}}>{BELIEFS.find(b=>b.name===selBelief)?.icon||''} {selBelief||'Not set'}</span><ChevronRight size={16} style={{color:B.text3}} /></div>
                </button>
              </div>

              {/* Children */}
              <div className="mx-5 mt-6 mb-1 flex items-center gap-2">
                <span style={{fontSize:13,fontWeight:700,color:B.text3,textTransform:'uppercase',letterSpacing:'0.1em'}}>Children</span>
                <div className="flex-1 h-px" style={{background:B.border}} />
              </div>
              <p className="mx-5 mb-3" style={{fontSize:13,color:B.text3}}>Explanations are personalized for each child&apos;s age</p>
              <div className="mx-5 overflow-hidden" style={{borderRadius:20,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                {children.map((c) => (
                  <div key={c.id} className="flex justify-between items-center" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                    <div className="flex items-center gap-2.5"><Baby size={18} style={{color:B.brand}} /><span className="font-semibold" style={{fontSize:16,color:B.text1}}>{c.name}</span></div>
                    <span className="font-bold" style={{fontSize:13,padding:'4px 12px',borderRadius:10,background:B.l2s,color:B.l2}}>{c.age}</span>
                  </div>
                ))}
                <button onClick={() => navigate('addchild')} className="flex items-center gap-2 w-full transition-all active:bg-gray-50" style={{padding:'14px 20px'}}>
                  <Plus size={18} style={{color:B.brand}} /><span className="font-semibold" style={{fontSize:16,color:B.brand}}>Add child</span>
                </button>
              </div>

              {/* Account */}
              <div className="mx-5 mt-6 mb-1 flex items-center gap-2">
                <span style={{fontSize:13,fontWeight:700,color:B.text3,textTransform:'uppercase',letterSpacing:'0.1em'}}>Account</span>
                <div className="flex-1 h-px" style={{background:B.border}} />
              </div>
              <div className="mx-5 overflow-hidden" style={{borderRadius:20,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                <div className="flex justify-between items-center" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <span className="font-semibold" style={{fontSize:16,color:B.text1}}>Subscription</span>
                  <span className="font-bold" style={{fontSize:13,padding:'4px 12px',borderRadius:10,color:isPro||isAdmin?'#FFFFFF':B.l4,background:isPro||isAdmin?B.brand:B.l4s}}>{isAdmin ? 'Admin' : isPro ? 'Pro' : `Free (${MAX_FREE - usageCount} left)`}</span>
                </div>
                {!isPro && !isAdmin && (
                  <button onClick={() => navigate('paywall')} className="flex items-center gap-2 w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                    <CreditCard size={18} style={{color:B.brand}} /><span className="font-semibold" style={{fontSize:16,color:B.brand}}>Upgrade to Pro</span>
                  </button>
                )}
                {isPro && !isAdmin && (
                  <button onClick={async () => {
                    if (!session) return;
                    try { const res = await fetch('/api/manage-subscription', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` } }); const data = await res.json(); if (data.url) window.location.href = data.url; else setToast('Could not open subscription manager'); }
                    catch { setToast('Something went wrong'); }
                  }} className="flex items-center gap-2 w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                    <CreditCard size={18} style={{color:B.brand}} /><span className="font-semibold" style={{fontSize:16,color:B.brand}}>Manage Subscription</span>
                  </button>
                )}
                {[['Privacy Policy','privacy'],['Terms of Service','terms'],['Refund Policy','refund']].map(([l,k]) => (
                  <button key={k} onClick={() => {setLegalPage(k);navigate('legal')}} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                    <span className="font-semibold" style={{fontSize:16,color:B.text1}}>{l}</span>
                    <ChevronRight size={16} style={{color:B.text3}} />
                  </button>
                ))}
                <button onClick={async () => { await signOut(); setIsLoggedIn(false); setDataLoaded(false); dataLoadedRef.current = false; setChildren([]); setSaved([]); navigate('auth'); }}
                  className="flex items-center gap-2 w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <LogOut size={18} style={{color:'#EF4444'}} /><span className="font-semibold" style={{fontSize:16,color:'#EF4444'}}>Sign Out</span>
                </button>
                <button onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    const msg = encodeURIComponent(`Please delete my Kidzplainer account. Email: ${user?.email || 'N/A'}, User ID: ${user?.id || 'N/A'}`);
                    window.open(`mailto:solutions@noeldcosta.com?subject=Delete My Kidzplainer Account&body=${msg}`, '_blank');
                    setToast('Account deletion request sent.');
                  }
                }} className="flex items-center gap-2 w-full transition-all active:bg-gray-50" style={{padding:'14px 20px'}}>
                  <X size={18} style={{color:B.text3}} /><span className="font-semibold" style={{fontSize:16,color:B.text3}}>Delete Account</span>
                </button>
              </div>

              {/* Feedback */}
              <div className="mx-5 mt-6 mb-1 flex items-center gap-2">
                <span style={{fontSize:13,fontWeight:700,color:B.text3,textTransform:'uppercase',letterSpacing:'0.1em'}}>Feedback & Support</span>
                <div className="flex-1 h-px" style={{background:B.border}} />
              </div>
              <div className="mx-5 overflow-hidden" style={{borderRadius:20,background:B.white,border:`1.5px solid ${B.border}`,boxShadow:B.shadow}}>
                <button onClick={() => { window.open(`mailto:solutions@noeldcosta.com?subject=Kidzplainer Feedback`, '_blank'); }} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <div className="flex items-center gap-2.5"><Mail size={18} style={{color:B.brand}} /><span className="font-semibold" style={{fontSize:16,color:B.text1}}>Send Feedback</span></div>
                  <ChevronRight size={16} style={{color:B.text3}} />
                </button>
                <button onClick={() => navigate('review')} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'14px 20px',borderBottom:`1px solid ${B.border}`}}>
                  <div className="flex items-center gap-2.5"><Star size={18} style={{color:'#F59E0B'}} /><span className="font-semibold" style={{fontSize:16,color:B.text1}}>Leave a Review</span></div>
                  <ChevronRight size={16} style={{color:B.text3}} />
                </button>
                <button onClick={() => { window.open(`https://wa.me/+971501234567?text=Hi, I need help with Kidzplainer`, '_blank'); }} className="flex justify-between items-center w-full transition-all active:bg-gray-50" style={{padding:'14px 20px'}}>
                  <div className="flex items-center gap-2.5"><MessageCircle size={18} style={{color:'#25D366'}} /><span className="font-semibold" style={{fontSize:16,color:B.text1}}>WhatsApp Support</span></div>
                  <ChevronRight size={16} style={{color:B.text3}} />
                </button>
              </div>

              <div className="text-center mt-8 mb-4" style={{fontSize:14,color:B.text3}}>Kidzplainer v1.0</div>
            </div>
            <BottomNav active="settings" onNav={(s:string) => navigate(s)} />
          </div>
        )}

        {/* ═══ REVIEW ═══ */}
        {screen === 'review' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex items-center gap-3 px-5 py-5">
              <button onClick={() => { setReviewSubmitted(false); setReviewText(''); navigate(prevScreen || 'settings'); }} style={{width:40,height:40,borderRadius:12,background:B.white,border:`1.5px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ArrowLeft size={18} style={{color:B.text1}} />
              </button>
              <span className="font-bold" style={{fontSize:18,color:B.text1}}>Leave a Review</span>
            </div>
            <div className="flex-1 px-6 pt-4">
              {reviewSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center mt-16">
                  <span style={{fontSize:56,marginBottom:16}}>🎉</span>
                  <h3 className="font-extrabold mb-2" style={{fontSize:24,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Thank you!</h3>
                  <p style={{fontSize:15,color:B.text2,lineHeight:1.6}}>Your review has been submitted. We appreciate your feedback!</p>
                  <div className="mt-8"><BrandBtn onClick={() => { setReviewSubmitted(false); setReviewText(''); navigate('settings'); }}>Back to Settings</BrandBtn></div>
                </div>
              ) : (<>
                <p className="mb-6" style={{fontSize:15,color:B.text2,lineHeight:1.6}}>Your review helps other parents discover Kidzplainer.</p>
                <p className="font-bold mb-3" style={{fontSize:14,color:B.text1}}>How would you rate Kidzplainer?</p>
                <div className="flex gap-2 mb-6">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewStars(s)} className="transition-all active:scale-90">
                      <Star size={36} fill={s<=reviewStars?'#F59E0B':'transparent'} style={{color:s<=reviewStars?'#F59E0B':B.text3}} />
                    </button>
                  ))}
                </div>
                <p className="font-bold mb-3" style={{fontSize:14,color:B.text1}}>Tell us more (optional)</p>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What do you love about Kidzplainer?" rows={4}
                  className="w-full outline-none resize-none"
                  style={{borderRadius:16,padding:16,fontSize:15,background:B.white,color:B.text1,border:`1.5px solid ${B.border}`}} />
                <div className="mt-6">
                  <BrandBtn onClick={async () => {
                    try { await db.submitReview(user?.id, user?.email, reviewStars, reviewText); } catch(e) { /* table might not exist */ }
                    setReviewSubmitted(true);
                  }}>Submit Review</BrandBtn>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ═══ LEGAL ═══ */}
        {screen === 'legal' && (
          <div className="flex flex-col min-h-dvh" style={{background:B.bg}}>
            <div className="flex items-center gap-3 px-5 py-4" style={{borderBottom:`1px solid ${B.border}`}}>
              <button onClick={() => navigate(prevScreen || 'settings')} style={{width:40,height:40,borderRadius:12,background:B.white,border:`1.5px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ArrowLeft size={18} style={{color:B.text1}} />
              </button>
              <span className="font-bold" style={{fontSize:16,color:B.text1}}>
                {legalPage === 'privacy' ? 'Privacy Policy' : legalPage === 'terms' ? 'Terms of Service' : 'Refund Policy'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{scrollbarWidth:'none'}}>
              {legalPage === 'privacy' && <>
                <h3 className="font-bold" style={{fontSize:18,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Privacy Policy</h3>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Last updated: March 2026</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Kidzplainer (&ldquo;we&rdquo;, &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal data of you and your family.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Data We Collect</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>We collect: your email address for authentication, your child&apos;s first name and age group for personalization, your country and belief preferences for content calibration, and the questions you submit. We do NOT collect your child&apos;s full name, date of birth, photos, location data, or any other identifying information about your child.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>How We Use Data</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Your data is used solely to generate personalized explanations. We do not sell, share, or monetize your data.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Children&apos;s Privacy (COPPA)</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Kidzplainer is designed for parents, not children. We do not knowingly collect personal information from children under 13.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Data Security</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Stripe for payment processing — we never see or store your credit card details.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Your Rights</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>You can export, modify, or delete your data at any time from Settings. Contact: solutions@noeldcosta.com</p>
              </>}
              {legalPage === 'terms' && <>
                <h3 className="font-bold" style={{fontSize:18,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Terms of Service</h3>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Last updated: March 2026</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>By using Kidzplainer, you agree to these terms. Kidzplainer provides AI-generated educational content to help parents communicate with their children.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Content Disclaimer</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>AI-generated content is provided as a starting point. Parents should review all content before sharing with their children.</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>Subscriptions</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Free accounts receive {MAX_FREE} explanations. Pro subscriptions: monthly ($4.99/mo) or annually ($49.99/yr). Cancel at any time.</p>
              </>}
              {legalPage === 'refund' && <>
                <h3 className="font-bold" style={{fontSize:18,color:B.text1,fontFamily:'Baloo 2,cursive'}}>Refund Policy</h3>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Last updated: March 2026</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>7-Day Money-Back Guarantee</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>If you&apos;re not happy with your Pro subscription, request a full refund within 7 days. Email solutions@noeldcosta.com</p>
                <p className="font-bold mt-2" style={{fontSize:14,color:B.text1}}>After 7 Days</p>
                <p style={{fontSize:13,color:B.text2,lineHeight:1.7}}>Cancel anytime. Access continues until the end of your billing period. No partial refunds.</p>
              </>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
