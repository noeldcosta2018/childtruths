'use client'

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signInWithEmail, signUp, signOut, resetPassword } from "@/lib/auth";
import * as db from "@/lib/db";
import { supabase } from "@/lib/supabase";

// ===================================================
// THE NURTURED PATH -- DESIGN SYSTEM
// ===================================================
const C = {
  surface: '#fef8f1',
  surfaceLow: '#f9f3ec',
  surfaceContainer: '#f3ede6',
  surfaceHigh: '#ede7e0',
  surfaceHighest: '#e7e2db',
  white: '#ffffff',
  surfaceLowest: '#ffffff',
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

const HL: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const BODY: React.CSSProperties = { fontFamily: "'Manrope', sans-serif" };
const HANDWRITTEN: React.CSSProperties = { fontFamily: "'Caveat', cursive" };
const SERIF: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };

function MIcon({ name, size = 20, style, filled }: { name: string; size?: number; style?: React.CSSProperties; filled?: boolean }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, ...style, ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}) }}>{name}</span>
  );
}

// ===================================================
// DATA
// ===================================================
const COUNTRIES = [
  {flag:"\u{1F1E6}\u{1F1EA}",name:"UAE"},{flag:"\u{1F1FA}\u{1F1F8}",name:"United States"},{flag:"\u{1F1EC}\u{1F1E7}",name:"United Kingdom"},
  {flag:"\u{1F1EE}\u{1F1F3}",name:"India"},{flag:"\u{1F1F8}\u{1F1E6}",name:"Saudi Arabia"},{flag:"\u{1F1E8}\u{1F1E6}",name:"Canada"},
  {flag:"\u{1F1E6}\u{1F1FA}",name:"Australia"},{flag:"\u{1F1E9}\u{1F1EA}",name:"Germany"},{flag:"\u{1F1EB}\u{1F1F7}",name:"France"},
  {flag:"\u{1F1EA}\u{1F1EC}",name:"Egypt"},{flag:"\u{1F1F5}\u{1F1F0}",name:"Pakistan"},{flag:"\u{1F1F3}\u{1F1EC}",name:"Nigeria"},
  {flag:"\u{1F1EF}\u{1F1F5}",name:"Japan"},{flag:"\u{1F1E7}\u{1F1F7}",name:"Brazil"},{flag:"\u{1F1F2}\u{1F1FD}",name:"Mexico"},
  {flag:"\u{1F1F9}\u{1F1F7}",name:"Turkey"},{flag:"\u{1F1EE}\u{1F1E9}",name:"Indonesia"},{flag:"\u{1F1F2}\u{1F1FE}",name:"Malaysia"},
  {flag:"\u{1F1FF}\u{1F1E6}",name:"South Africa"},{flag:"\u{1F1F0}\u{1F1EA}",name:"Kenya"}
];

const BELIEFS = [
  {icon:"\u{1F54C}",name:"Islam",desc:"References to Allah, Quran & Islamic values"},
  {icon:"\u271D\uFE0F",name:"Christianity",desc:"References to God, Jesus & Biblical values"},
  {icon:"\u{1F549}\uFE0F",name:"Hinduism",desc:"References to dharma, karma & soul's journey"},
  {icon:"\u2721\uFE0F",name:"Judaism",desc:"References to God, Torah & Jewish values"},
  {icon:"\u2638\uFE0F",name:"Buddhism",desc:"Compassion, mindfulness & cycle of life"},
  {icon:"\u{1F33F}",name:"Spiritual",desc:"Universe, energy & connectedness"},
  {icon:"\u{1F52C}",name:"Secular",desc:"Science-based, no religious framing"},
];

const LANGUAGES = [
  {flag:"\u{1F1EC}\u{1F1E7}",name:"English"},{flag:"\u{1F1F8}\u{1F1E6}",name:"\u0627\u0644\u0639\u0631\u0628\u064A\u0629"},{flag:"\u{1F1EE}\u{1F1F3}",name:"\u0939\u093F\u0928\u094D\u0926\u0940"},
  {flag:"\u{1F1EA}\u{1F1F8}",name:"Espa\u00F1ol"},{flag:"\u{1F1EB}\u{1F1F7}",name:"Fran\u00E7ais"},{flag:"\u{1F1E8}\u{1F1F3}",name:"\u4E2D\u6587"},
  {flag:"\u{1F1F5}\u{1F1F9}",name:"Portugu\u00EAs"},{flag:"\u{1F1E9}\u{1F1EA}",name:"Deutsch"}
];

const ROLES = [
  {icon:"family_restroom",label:"Parent"},
  {icon:"school",label:"Educator"},
  {icon:"child_care",label:"Guardian"},
  {icon:"more_horiz",label:"Other"},
];

const PERSONALITIES = [
  {emoji:"\u{1F50D}",label:"Very Curious"},{emoji:"\u{1F4AC}",label:"Very Talkative"},
  {emoji:"\u{1F338}",label:"Sensitive"},{emoji:"\u{1F4DA}",label:"Literal Thinker"},
  {emoji:"\u{1F3A8}",label:"Creative"},{emoji:"\u{1F60C}",label:"Calm & Shy"},
  {emoji:"\u{1F630}",label:"Gets Anxious"},{emoji:"\u{1F60A}",label:"Outgoing"},
];

const TOPICS_BY_LANG: Record<string, {emoji:string;label:string;q:string}[]> = {
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

const TRIGGERS_BY_LANG: Record<string, string[]> = {
  'English': ['TV / Movie','iPad / Phone','Friend told them','At school','Overheard adults','Real event'],
  'العربية': ['تلفزيون / فيلم','آيباد / هاتف','أخبرهم صديق','في المدرسة','سمعوا الكبار','حدث حقيقي'],
  'हिन्दी': ['टीवी / फिल्म','आईपैड / फोन','दोस्त ने बताया','स्कूल में','बड़ों की बात सुनी','असली घटना'],
  'Español': ['TV / Película','iPad / Teléfono','Un amigo les dijo','En la escuela','Escucharon adultos','Evento real'],
  'Français': ['TV / Film','iPad / Téléphone','Un ami leur a dit',"À l'école",'Entendu des adultes','Événement réel'],
  '中文': ['电视/电影','iPad/手机','朋友告诉的','在学校','听到大人说','真实事件'],
  'Português': ['TV / Filme','iPad / Celular','Amigo contou','Na escola','Ouviram adultos','Evento real'],
  'Deutsch': ['TV / Film','iPad / Handy','Freund erzählte','In der Schule','Erwachsene gehört','Echtes Ereignis'],
};

const TRIGGER_ICONS = ['📺','📱','👥','🏫','👂','🌍'];
const TRIGGER_KEYS = ['tv','ipad','friend','school','overheard','event'];

const UI_STRINGS: Record<string, Record<string, string>> = {
  'English': { whatDidAsk:'What did {name} ask?', quickTopics:'Quick Topics', triggeredBy:'What Triggered It?', explain:'Explain', explore:'Explore by Topic', trending:'Community Trending' },
  'العربية': { whatDidAsk:'ماذا سأل {name}؟', quickTopics:'مواضيع سريعة', triggeredBy:'ما السبب؟', explain:'اشرح', explore:'استكشف حسب الموضوع', trending:'الأسئلة الشائعة' },
  'हिन्दी': { whatDidAsk:'{name} ने क्या पूछा?', quickTopics:'त्वरित विषय', triggeredBy:'कारण', explain:'समझाएं', explore:'विषय के अनुसार खोजें', trending:'सामुदायिक चर्चा' },
  'Español': { whatDidAsk:'¿Qué preguntó {name}?', quickTopics:'Temas rápidos', triggeredBy:'¿Qué lo provocó?', explain:'Explicar', explore:'Explorar por tema', trending:'Tendencias' },
  'Français': { whatDidAsk:"Qu'a demandé {name} ?", quickTopics:'Sujets rapides', triggeredBy:'Déclencheur', explain:'Expliquer', explore:'Explorer par sujet', trending:'Tendances' },
  '中文': { whatDidAsk:'{name}问了什么？', quickTopics:'快速话题', triggeredBy:'触发原因', explain:'解释', explore:'按话题探索', trending:'社区热门' },
  'Português': { whatDidAsk:'O que {name} perguntou?', quickTopics:'Tópicos rápidos', triggeredBy:'O que provocou?', explain:'Explicar', explore:'Explorar por tópico', trending:'Tendências' },
  'Deutsch': { whatDidAsk:'Was hat {name} gefragt?', quickTopics:'Schnelle Themen', triggeredBy:'Auslöser', explain:'Erklären', explore:'Nach Thema erkunden', trending:'Im Trend' },
};

const LAYER_META = [
  { name: 'The Spark', matIcon: 'auto_awesome', color: C.primary, softBg: `${C.primaryFixed}60`, ringColor: `${C.primary}20` },
  { name: 'The Story', matIcon: 'menu_book', color: C.secondary, softBg: `${C.secondaryContainer}60`, ringColor: `${C.secondary}20` },
  { name: 'The Science', matIcon: 'science', color: C.tertiary, softBg: `${C.tertiaryFixed}40`, ringColor: `${C.tertiary}20` },
  { name: 'The Deep Dive', matIcon: 'psychology', color: C.onSurface, softBg: C.surfaceHigh, ringColor: `${C.onSurface}15` },
];

const TESTIMONIALS = [
  { name: 'Sarah J.', role: 'Mom of Two', text: 'This app saved me during the "Why?" phase. It gives me the perfect words for my 4-year-old.', stars: 5, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhe9q8AN98QlA9agg_ofIQhc8MKZbJSRR9EmvwdvRoY2PfVVCFFA6Mos_kNhOErcY6HwCXHFmadDADeGi6TCdX3xlvFwOF8zcclCBU_rPGVFDwYCLL9if5LFArtdL_D1PJFUu2fhsUAuDvTBHSAFPxMdg5OqHkRQ8jdIkz7nZBVdJAUBqm97ZFtmZrpj7OnCfyyQIf4Z8oulBFh_Gupq5WHJDNLH94z1vHqVkzR8dIN5GHnZxh68sJzro0wLw8XgPjPVcY2m1gMcbe' },
  { name: 'David M.', role: 'Educator & Dad', text: 'Finally, a tool that helps me talk about difficult world events in a way that feels safe.', stars: 5, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN5EPdBp-zkB3Ku9RWQpc0puSQJULSYPhgW4ul0JZeqzKHPCiFXUIH1UrZk1T9biDmNpJIdGMUI-bhMv9QAtbLbNPfWltMeCFa_4wPtxrZkr0DQFjLj3c_RkgE1ks2qR-ATirGxCMJpEqgRL17VSLFktacDsWqI9bjHvYsBBid4sxQpC8uUWYTnkHiVc2pJSyEN-O-562Ubhno_hmc3Nc018WNrb-U0t4L-yKpen1DwGUwtJTeXrGtVg7MQXEoJrNGu9KgudrSgWe9' },
  { name: 'Priya R.', role: 'Mom of Three', text: 'The cultural sensitivity is incredible. It respects our values while being scientifically accurate.', stars: 5 },
];

const IMAGES = {
  parentChild: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAveL4KWkKTsjYEqCaPhEunTQbsvVavcfkJZEHkYSsRgztVCyyAtszUHPJwqXrVqUGKxgSN8dTCmNuYaYwp-MGQoH7-t6GdcrnbAIGXfavKX5GYmaUrTkxYDhiYxRYfZqEjLq9JIjrM6aeBYsshWSYgr3gsrmLoGCc7XiKyB3i5F1vMTdY3hGYR6I-dXY22LUrCie-cQgI1V2bIDFS-Ff3PrLUGJzBaD9jBrqOk4UWCJyGpPMn3sa_B9Dg8fzOyXiMw5sEhAckI53JZ',
  founder: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByRok3luCtYLLMg_bpimKbCkwGWR2bJHmMpXFrmChb6M8RbEYc7OyTUt5UZ9_SddKroJbOiIUtz-KfzDduMrx9wyzPW5kU5JgJknQWDhIEo2xK1Rq5yoBMUczFSj7XyKlboth8F5ugE6i2q1MHRxIBmW9A9-6zFgLF7qcyDJvTWfmY_KPEoJ_QdY6cSwh4nPhPZq7S6GTgd4ZsERhlgKVsNc7R4Rr0loa8nvztXKc6LfGcHCTZJMfEIUv2uyXFi29XuBcsI5ALHk1s',
  setupAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaOGjZx3kzxI3lD0u1piauaVMNSOo9K-nYd0z3rAiReQCElCarzfmxFZF-aqOOunxLNQaE5Ku2Qe0SMPFQ-_R6WvlDG7iDF4I6nLUONtvKInQGZrI6zwof3cTwoVHQuU9dJMJSB41YnmzeH5-gtwNYS2EhgC7gk0ZpwrwpWrles-_Lz9-zhZCk3KzCIxoYJ12DFCOv7Y5qZBQFtYCzNZ7wZjIxr0KBSnFkH9s3Dm7whNRA537jBxUl8R58BviY0qE0kqCJfXXQY_5s',
};

// ===================================================
// API
// ===================================================
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

// ===================================================
// FLOATING NAV (shared)
// ===================================================
// ===================================================
// LOADING SCREENS
// ===================================================
function SplashScreen() {
  const [step, setStep] = useState(0);
  const steps = ['Loading your experience...', 'Preparing your sanctuary...', 'Almost ready...'];
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ background: C.surface, minHeight: '100vh' }}>
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-30" style={{ background: C.secondaryFixed }} />
      <div className="absolute bottom-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: C.primaryFixed }} />
      <div className="relative z-10 flex flex-col items-center">
        <p style={{ ...HL, color: C.primary, fontSize: 36, fontWeight: 800 }}>Kidzplainer</p>
        <div className="h-1.5 w-8 rounded-full mt-2" style={{ background: C.tertiaryContainer }} />
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: C.surfaceHigh }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ background: C.primary, width: step === 0 ? '30%' : step === 1 ? '65%' : '95%' }} />
          </div>
          <p className="text-sm font-medium transition-opacity duration-300" style={{ color: C.onSurfaceVariant }}>{steps[step]}</p>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen({ childName, belief, country }: { childName: string; belief: string; country: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: 'psychology', text: `Understanding ${childName}'s perspective...` },
    { icon: 'auto_awesome', text: 'Crafting age-appropriate language...' },
    { icon: 'volunteer_activism', text: belief ? `Weaving in ${belief} values...` : 'Adding cultural sensitivity...' },
    { icon: 'layers', text: 'Building 4 layers of explanation...' },
  ];
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3500),
      setTimeout(() => setStep(3), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full animate-pulse opacity-15" style={{ background: C.primaryFixed }} />
      </div>
      <div className="relative z-10 w-full max-w-xs">
        <p style={{ ...HL, color: C.primary, fontSize: 20, fontWeight: 800, marginBottom: 32 }}>Kidzplainer</p>
        <div className="space-y-4 text-left">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 transition-all duration-500" style={{ opacity: i <= step ? 1 : 0.25, transform: i <= step ? 'translateX(0)' : 'translateX(8px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500" style={{ background: i < step ? C.secondaryContainer : i === step ? C.primaryFixed : C.surfaceHigh }}>
                {i < step ? (
                  <MIcon name="check" size={18} style={{ color: C.secondary }} />
                ) : i === step ? (
                  <MIcon name={s.icon} size={18} style={{ color: C.primary, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ) : (
                  <MIcon name={s.icon} size={18} style={{ color: C.outline }} />
                )}
              </div>
              <p className="text-sm font-semibold" style={{ color: i <= step ? C.onSurface : C.outline }}>{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.surfaceHigh }}>
          <div className="h-full rounded-full transition-all duration-1500 ease-out" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.primaryContainer})`, width: `${Math.min(100, (step + 1) * 25)}%`, transition: 'width 1.5s ease-out' }} />
        </div>
        <p className="text-xs mt-3 font-medium" style={{ color: C.onSurfaceVariant }}>Personalized for {childName}'s world</p>
      </div>
    </div>
  );
}

function FloatingNav({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  const items = [
    { key: 'home', icon: 'chat_bubble', label: 'Ask' },
    { key: 'saved', icon: 'auto_stories', label: 'Library' },
    { key: 'community', icon: 'family_restroom', label: 'Connect' },
    { key: 'settings', icon: 'person_4', label: 'You' },
  ];
  return (
    <div className="fixed bottom-6 left-0 w-full z-50 flex justify-center px-4">
      <nav className="flex justify-between items-center w-full max-w-[440px] rounded-full p-2" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: `0 20px 50px rgba(29,27,23,0.1)`, border: `1px solid ${C.outlineVariant}20` }}>
        {items.map(n => (
          <button key={n.key} onClick={() => onNav(n.key)} className="flex flex-col items-center px-5 py-2.5 rounded-3xl transition-all active:scale-95" style={{ background: active === n.key ? C.secondaryContainer + '80' : 'transparent' }}>
            <MIcon name={n.icon} size={20} style={{ color: active === n.key ? C.primary : C.onSurfaceVariant + '80' }} filled={active === n.key} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ ...BODY, color: active === n.key ? C.primary : C.onSurfaceVariant + '80' }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ===================================================
// MAIN APP
// ===================================================
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

  // -- Auth state handler --
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

  // -- Handlers --
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
  const t = UI_STRINGS[selLanguage] || UI_STRINGS['English'];
  const topics = TOPICS_BY_LANG[selLanguage] || TOPICS_BY_LANG['English'];
  const triggerLabels = TRIGGERS_BY_LANG[selLanguage] || TRIGGERS_BY_LANG['English'];

  // ===================================================
  // RENDER
  // ===================================================
  return (
    <div style={{ ...BODY, background: C.surface, minHeight: '100vh' }} className="flex flex-col items-center">
      <div className="w-full max-w-[500px] relative overflow-hidden" style={{ background: C.surface, minHeight: '100vh' }}>

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-xl" style={{ background: C.secondary, color: '#fff' }}>
            <p className="text-sm font-semibold text-center">{toast}</p>
          </div>
        )}

        {/* === SPLASH === */}
        {screen === 'splash' && <SplashScreen />}

        {/* === ONBOARDING === */}
        {screen === 'onboarding' && (
          <div className="flex flex-col items-center justify-between text-center relative overflow-hidden px-6 py-10" style={{ background: C.surface, minHeight: '100vh' }}>
            {/* Organic blobs */}
            <div className="absolute -top-10 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-20" style={{ background: C.secondaryFixed }} />
            <div className="absolute top-1/3 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-15 rotate-45" style={{ background: C.tertiaryFixed }} />
            <div className="absolute -bottom-10 left-10 w-56 h-56 rounded-full blur-[100px] opacity-20" style={{ background: C.primaryFixed }} />

            {/* Logo */}
            <div className="flex flex-col items-center">
              <p style={{ ...HL, color: C.primary, fontSize: 28, fontWeight: 800 }}>Kidzplainer</p>
              <div className="h-1.5 w-8 rounded-full mt-1" style={{ background: C.tertiaryContainer }} />
            </div>

            {/* Hero image */}
            <div className="relative w-full max-w-[280px] aspect-square my-6" style={{ animation: 'float 6s ease-in-out infinite' }}>
              <div className="absolute inset-0 rounded-full transform -rotate-6 scale-110 opacity-40" style={{ background: C.surfaceHigh }} />
              <div className="relative z-10 w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                <img src={IMAGES.parentChild} alt="Parent and child silhouette" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating glass card */}
              <div className="absolute -bottom-2 -right-2 p-4 rounded-2xl shadow-xl z-20 max-w-[180px]" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', animation: 'float 6s ease-in-out infinite', animationDelay: '-3s' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.primary }}>Smart Parenting</p>
                <p className="text-xs font-medium leading-snug" style={{ color: C.onSurfaceVariant }}>Answers crafted for their curiosity and your peace of mind.</p>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-4 px-2 max-w-sm">
              <h1 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Because they ask.<br /><span style={{ color: C.primary, fontStyle: 'italic', fontWeight: 600 }}>Because you care.</span>
              </h1>
              <p className="text-base leading-relaxed font-medium" style={{ color: `${C.onSurfaceVariant}cc` }}>
                Turn curiosity into connection with AI-powered explanations designed for growing minds.
              </p>
            </div>

            {/* CTAs */}
            <div className="w-full space-y-4 mt-6">
              <button onClick={() => { setAuthMode('signup'); navigate('auth'); }} className="w-full py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 20px 40px -12px rgba(145,75,49,0.3)' }}>
                Get Started for Free <MIcon name="arrow_forward" size={18} style={{ color: C.onPrimary }} />
              </button>
              <button onClick={() => { setAuthMode('login'); navigate('auth'); }} className="w-full py-3 font-bold text-sm" style={{ color: C.secondary }}>Log into your account</button>
            </div>

            {/* Trust badges */}
            <div className="flex justify-between items-center w-full px-4 py-4 mt-4">
              {[
                {icon:'verified_user',label:'Trusted'},
                {icon:'favorite',label:'Parent-First'},
                {icon:'encrypted',label:'Secure'}
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8" style={{ background: C.outlineVariant + '40' }} />}
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <MIcon name={b.icon} size={18} style={{ color: C.onSurfaceVariant }} />
                    <span className="text-[9px] uppercase font-extrabold tracking-widest" style={{ color: C.onSurfaceVariant }}>{b.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === AUTH === */}
        {screen === 'auth' && (
          <div className="flex flex-col px-6 py-10 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[100px] opacity-15" style={{ background: C.primaryContainer }} />
            <button onClick={() => navigate('onboarding')} className="p-2 rounded-full w-10 h-10 flex items-center justify-center mb-6" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.06)` }}>
              <MIcon name="arrow_back" size={18} style={{ color: C.onSurface }} />
            </button>
            <h1 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.15, marginBottom: 8 }}>
              {authMode === 'signup' ? 'Create your account' : authMode === 'forgot' ? 'Reset password' : 'Welcome back'}
            </h1>
            <p className="text-base mb-8" style={{ color: C.onSurfaceVariant }}>{authMode === 'signup' ? 'Start your free 7-day trial.' : authMode === 'forgot' ? 'Enter your email to reset.' : 'Sign in to continue.'}</p>

            {authMode !== 'forgot' && (<>
              <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 mb-6 active:scale-[0.97] transition-all" style={{ background: C.white, border: `1.5px solid ${C.outlineVariant}50`, boxShadow: `0 2px 8px rgba(29,27,23,0.04)` }}>
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
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <MIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} style={{ color: C.outline }} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Confirm password</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter password" className="w-full px-5 py-4 rounded-2xl text-base outline-none" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} />
              </div>
            )}

            {authError && <p className="text-sm mb-4 flex items-center gap-2" style={{ color: '#ba1a1a' }}><MIcon name="error" size={14} style={{ color: '#ba1a1a' }} />{authError}</p>}

            <button onClick={() => handleAuth(authMode)} disabled={authLoading} className="w-full py-5 rounded-2xl font-bold text-lg mt-2 flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading && <MIcon name="progress_activity" size={18} style={{ color: C.onPrimary, animation: 'spin 1s linear infinite' }} />}
              {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
            </button>

            <div className="flex justify-center gap-1 mt-6 text-sm">
              {authMode === 'login' && <><span style={{ color: C.outline }}>New here?</span><button onClick={() => { setAuthMode('signup'); setAuthError(''); }} className="font-bold" style={{ color: C.primary }}>Sign up</button></>}
              {authMode === 'signup' && <><span style={{ color: C.outline }}>Already have an account?</span><button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="font-bold" style={{ color: C.primary }}>Sign in</button></>}
            </div>
            {authMode === 'login' && <button onClick={() => { setAuthMode('forgot'); setAuthError(''); }} className="w-full text-center text-sm font-bold mt-3" style={{ color: C.tertiary }}>Forgot password?</button>}
          </div>
        )}

        {/* === SETUP === */}
        {screen === 'setup' && (
          <div className="flex flex-col px-6 pt-6 pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            {/* Fixed header */}
            <div className="flex items-center justify-between mb-2">
              {setupStep > 1 ? (
                <button onClick={() => setSetupStep(s => s - 1)} className="p-2 rounded-full" style={{ background: C.white }}>
                  <MIcon name="arrow_back" size={18} style={{ color: C.primary }} />
                </button>
              ) : <div className="w-10" />}
              <p style={{ ...HL, fontWeight: 700, color: C.onSurface, fontSize: 16 }}>Kidzplainer</p>
              <div className="flex gap-1.5">
                {[1,2,3,4].map(s => (
                  <div key={s} className="h-1.5 rounded-full transition-all duration-500" style={{ width: s === setupStep ? 24 : 8, background: s === setupStep ? C.primary : s < setupStep ? C.secondary : C.outlineVariant }} />
                ))}
              </div>
            </div>

            {/* Step badge */}
            <div className="flex justify-center mt-6 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: C.primaryFixed + '80', color: C.primary }}>Step {setupStep} of 4</span>
            </div>

            {/* Step 1: About yourself */}
            {setupStep === 1 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>Tell us about yourself.</h2>
                <p className="text-center text-base" style={{ color: C.onSurfaceVariant }}>Let's customize your experience.</p>

                {/* Avatar section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden" style={{ padding: 3, background: `linear-gradient(135deg, ${C.primary}, ${C.secondaryContainer})` }}>
                      <div className="w-full h-full rounded-full overflow-hidden" style={{ background: C.surfaceContainer }}>
                        <img src={IMAGES.setupAvatar} alt="Profile avatar" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.primary, boxShadow: `0 4px 12px rgba(29,27,23,0.15)` }}>
                      <MIcon name="add_a_photo" size={14} style={{ color: C.onPrimary }} />
                    </button>
                  </div>
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: `${C.onSurfaceVariant}b0` }}>Your role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(r => (
                      <button key={r.label} onClick={() => setSelRole(r.label)} className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-[0.97]" style={{ background: selRole === r.label ? C.primaryFixed : C.white, border: `2px solid ${selRole === r.label ? C.primary : C.surfaceHigh}` }}>
                        <MIcon name={r.icon} size={28} style={{ color: selRole === r.label ? C.primary : C.onSurfaceVariant }} />
                        <span className="font-bold text-sm" style={{ color: C.onSurface }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: C.secondaryContainer + '40' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.secondaryContainer }}>
                    <MIcon name="verified_user" size={16} style={{ color: C.secondary }} />
                  </div>
                  <p className="text-xs font-medium leading-snug" style={{ color: C.onSurfaceVariant }}>Your data is encrypted and never shared with third parties.</p>
                </div>
              </div>
            )}

            {/* Step 2: Language */}
            {setupStep === 2 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>What language do you speak at home?</h2>
                <div className="space-y-2.5">
                  {LANGUAGES.map(l => (
                    <button key={l.name} onClick={() => setSelLanguage(l.name)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selLanguage === l.name ? C.primaryFixed : C.white, border: `1.5px solid ${selLanguage === l.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-2xl">{l.flag}</span>
                      <span className="font-semibold text-base" style={{ color: C.onSurface }}>{l.name}</span>
                      {selLanguage === l.name && <MIcon name="check_circle" size={18} style={{ color: C.primary }} filled />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Country */}
            {setupStep === 3 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>Where are you raising your child?</h2>
                <div className="relative">
                  <MIcon name="search" size={18} style={{ color: C.outline, position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search countries..." className="w-full pl-12 pr-5 py-4 rounded-2xl text-base outline-none" style={{ background: C.white, border: `1.5px solid ${C.surfaceHigh}`, color: C.onSurface }} />
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {filteredCountries.map(c => (
                    <button key={c.name} onClick={() => setSelCountry(c.name)} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selCountry === c.name ? C.primaryFixed : C.white, border: `1.5px solid ${selCountry === c.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-semibold text-sm" style={{ color: C.onSurface }}>{c.name}</span>
                      {selCountry === c.name && <MIcon name="check_circle" size={16} style={{ color: C.primary }} filled />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Belief */}
            {setupStep === 4 && (
              <div className="space-y-6">
                <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, textAlign: 'center', lineHeight: 1.15 }}>What's your worldview?</h2>
                <p className="text-center text-sm" style={{ color: C.onSurfaceVariant }}>This helps us frame answers with sensitivity.</p>
                <div className="space-y-2.5">
                  {BELIEFS.map(b => (
                    <button key={b.name} onClick={() => setSelBelief(b.name)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: selBelief === b.name ? C.primaryFixed : C.white, border: `1.5px solid ${selBelief === b.name ? C.primary + '40' : 'transparent'}` }}>
                      <span className="text-2xl">{b.icon}</span>
                      <div className="text-left flex-1"><p className="font-bold text-sm" style={{ color: C.onSurface }}>{b.name}</p><p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>{b.desc}</p></div>
                      {selBelief === b.name && <MIcon name="check_circle" size={16} style={{ color: C.primary }} filled />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center" style={{ background: `linear-gradient(transparent, ${C.surface} 30%)` }}>
              <div className="w-full max-w-[500px] space-y-3">
                <button onClick={async () => {
                  if (setupStep < 4) { setSetupStep(s => s + 1); return; }
                  if (user) { try { await db.upsertProfile(user.id, { language: selLanguage, country: selCountry, belief: selBelief }); } catch (e) { console.error(e); } }
                  navigate('addchild');
                }} disabled={(setupStep === 3 && !selCountry) || (setupStep === 4 && !selBelief)} className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)', opacity: (setupStep === 3 && !selCountry) || (setupStep === 4 && !selBelief) ? 0.5 : 1 }}>
                  Continue to Step {setupStep < 4 ? setupStep + 1 : 4} <MIcon name="arrow_forward" size={18} style={{ color: C.onPrimary }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === ADD CHILD === */}
        {screen === 'addchild' && (
          <div className="flex flex-col px-6 py-10 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute top-10 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-15" style={{ background: C.tertiaryContainer }} />
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, lineHeight: 1.15, marginBottom: 8 }}>Add your child</h2>
            <p className="text-sm mb-2" style={{ color: C.onSurfaceVariant }}>We'll personalize explanations for their age and personality.</p>
            <div className="flex items-center gap-2 p-3 rounded-2xl mb-6" style={{ background: C.secondaryContainer + '40', border: `1px solid ${C.secondaryContainer}50` }}>
              <MIcon name="encrypted" size={16} style={{ color: C.secondary }} />
              <p className="text-xs font-medium" style={{ color: C.secondary }}>Use their first name only -- never their full name.</p>
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
              Continue <MIcon name="arrow_forward" size={18} style={{ color: C.onPrimary }} />
            </button>
            {children.length > 0 && <button onClick={() => navigate('home')} className="w-full text-center text-sm font-bold mt-4" style={{ color: C.tertiary }}>Skip -- go to home</button>}
          </div>
        )}

        {/* === HOME === */}
        {screen === 'home' && (
          <div className="flex flex-col pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -right-20 w-72 h-72 rounded-full blur-[80px] opacity-20" style={{ background: C.secondaryFixed }} />
            <div className="absolute top-1/3 -left-32 w-60 h-60 rounded-full blur-[80px] opacity-15" style={{ background: C.primaryFixed }} />

            {/* Top header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-xl" style={{ background: C.white }}>
                  <MIcon name="menu" size={20} style={{ color: C.onSurface }} />
                </button>
                <h1 style={{ ...HL, fontWeight: 800, fontSize: 20, color: C.primary }}>Kidzplainer</h1>
              </div>
              <div className="flex items-center gap-2">
                {!isPro && !isAdmin && <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.primaryFixed, color: C.primary }}>{freeLeft} free left</span>}
                {(isPro || isAdmin) && <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.secondaryContainer, color: C.secondary }}>PRO</span>}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: C.primaryFixed, color: C.primary }}>
                  {userName?.[0]?.toUpperCase() || 'P'}
                </div>
              </div>
            </div>

            {/* Hero heading */}
            <div className="px-6 mb-6 relative z-10">
              <h2 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Curiosity met with{' '}
                <span style={{ color: C.primary, fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: C.primaryContainer, textUnderlineOffset: 4 }}>Expertise.</span>
              </h2>
            </div>

            {/* Premium search bar */}
            <div className="px-6 mb-8 relative z-10">
              <div className="relative flex items-center rounded-2xl p-2 transition-all" style={{ background: C.white, boxShadow: '0 10px 30px -10px rgba(145,75,49,0.12), 0 4px 10px -5px rgba(145,75,49,0.04)' }}>
                <div className="flex items-center flex-1 px-4">
                  <MIcon name="chat_bubble" size={18} style={{ color: C.primary + '80', marginRight: 12, flexShrink: 0 }} />
                  <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. 'Why is the sky blue?'" className="w-full bg-transparent border-none outline-none text-base py-3 placeholder:opacity-40" style={{ color: C.onSurface }} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                </div>
                <button onClick={handleGenerate} className="px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-all" style={{ background: C.primary, color: C.onPrimary, boxShadow: '0 4px 12px rgba(145,75,49,0.2)' }}>{t.explain}</button>
              </div>
              {genError && <p className="text-sm mt-2 flex items-center gap-1" style={{ color: '#ba1a1a' }}><MIcon name="error" size={14} style={{ color: '#ba1a1a' }} />{genError}</p>}
            </div>

            {/* Child selector */}
            {children.length > 0 && (
              <div className="px-6 mb-6 relative z-10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {children.map((ch: any) => (
                    <button key={ch.id || ch.name} onClick={() => setSelectedChild(ch)} className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all" style={{ background: selectedChild?.id === ch.id ? C.secondaryContainer : C.white, color: selectedChild?.id === ch.id ? C.secondary : C.onSurfaceVariant }}>{ch.name} ({ch.age})</button>
                  ))}
                  <button onClick={() => navigate('addchild')} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.surfaceLow }}>
                    <MIcon name="add" size={16} style={{ color: C.outline }} />
                  </button>
                </div>
              </div>
            )}

            {/* Community Trending */}
            <div className="px-6 mb-8 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.primary + 'cc' }}>Community Trending</p>
              <div className="space-y-3">
                {/* Large featured card */}
                <div className="p-6 rounded-3xl" style={{ background: C.white, boxShadow: '0 8px 32px rgba(29,27,23,0.06)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3" style={{ background: C.tertiaryFixed + '40', color: C.tertiary }}>Science & Nature</span>
                  <h3 style={{ ...HL, fontSize: 20, fontWeight: 800, color: C.onSurface, lineHeight: 1.2, marginBottom: 12 }}>"Where do dreams go when we wake up?"</h3>
                  <p className="text-sm mb-4" style={{ color: C.onSurfaceVariant }}>How to explain the subconscious mind and memory consolidation to a 5-year-old.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[C.primaryContainer, C.secondaryContainer, C.tertiaryContainer].map((bg, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2" style={{ background: bg, borderColor: C.white }} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: C.onSurfaceVariant + 'b0' }}>12 parents joined</span>
                    </div>
                    <button onClick={() => setQuestion("Where do dreams go when we wake up?")} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: C.surfaceHigh + '80', color: C.onSurfaceVariant }}>Read Answer</button>
                  </div>
                </div>

                {/* Two secondary cards side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Warm card */}
                  <div className="p-5 rounded-3xl flex flex-col justify-between min-h-[160px]" style={{ background: '#E58B6E' }}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>Social Skills</span>
                      <p style={{ ...HL, fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>"Why can't I always win at games?"</p>
                    </div>
                    <p className="text-[11px] font-semibold mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>84 parents asked today</p>
                  </div>

                  {/* Sage card */}
                  <div className="p-5 rounded-3xl flex flex-col justify-between min-h-[160px]" style={{ background: '#B7C7B0' }}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3" style={{ background: 'rgba(45,62,40,0.1)', color: '#2D3E28' }}>Life Events</span>
                      <p style={{ ...HL, fontSize: 16, fontWeight: 800, color: '#2D3E28', lineHeight: 1.25 }}>"Why did our goldfish go to sleep forever?"</p>
                    </div>
                    <p className="text-[11px] font-semibold mt-3" style={{ color: C.onSurfaceVariant }}>Spiking in Toddlers (3-5)</p>
                  </div>
                </div>

                {/* Weekly tip card */}
                <div className="p-5 rounded-3xl flex items-center gap-4" style={{ background: C.white, boxShadow: '0 2px 8px rgba(29,27,23,0.04)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: C.tertiaryFixed + '30' }}>
                    <MIcon name="auto_awesome" size={22} style={{ color: C.tertiary }} filled />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ ...HL, color: C.onSurface }}>Weekly Parenting Tip</p>
                    <p className="text-sm mt-0.5" style={{ color: C.onSurfaceVariant }}>The 'Pause' method for explaining difficult emotions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore by Topic */}
            <div className="px-6 mb-6 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.primary + 'cc' }}>{t.explore}</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {topics.map(tp => (
                  <button key={tp.label} onClick={() => setQuestion(tp.q)} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]" style={{ background: C.white, boxShadow: '0 2px 8px rgba(29,27,23,0.04)', border: `1px solid ${C.outlineVariant}20` }}>
                    <span>{tp.emoji}</span> {tp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* What Triggered It */}
            <div className="px-6 mb-6 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.primary + 'cc' }}>{t.triggeredBy}</p>
              <div className="grid grid-cols-3 gap-2.5">
                {triggerLabels.map((label, i) => {
                  const key = TRIGGER_KEYS[i];
                  const sel = selectedTriggers.includes(key);
                  return <button key={key} onClick={() => setSelectedTriggers(prev => sel ? prev.filter(x => x !== key) : [...prev, key])} className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-[0.97]" style={{ background: sel ? C.primaryFixed : C.white, border: `1.5px solid ${sel ? C.primary + '30' : C.surfaceHigh}` }}>
                    <span className="text-xl">{TRIGGER_ICONS[i]}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: C.onSurface }}>{label}</span>
                  </button>;
                })}
              </div>
            </div>

            {/* FAB */}
            <button onClick={() => { setQuestion(''); document.querySelector<HTMLInputElement>('input[placeholder]')?.focus(); }} className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-40 active:scale-90 transition-all" style={{ background: C.primary, boxShadow: '0 8px 24px rgba(145,75,49,0.3)' }}>
              <MIcon name="add" size={24} style={{ color: C.onPrimary }} />
            </button>

            <FloatingNav active="home" onNav={navigate} />
          </div>
        )}

        {/* === LOADING === */}
        {screen === 'loading' && <GeneratingScreen childName={selectedChild?.name || 'your child'} belief={selBelief} country={selCountry} />}

        {/* === RESULT === */}
        {screen === 'result' && layers && (
          <div className="pb-32 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            {/* Fixed top bar */}
            <div className="fixed top-0 left-0 w-full z-50" style={{ background: `${C.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.outlineVariant}15` }}>
              <div className="max-w-[500px] mx-auto flex items-center justify-between px-6 h-16">
                <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full active:scale-90 transition-all">
                  <MIcon name="arrow_back" size={20} style={{ color: C.onSurface }} />
                </button>
                <span className="text-sm font-extrabold uppercase tracking-widest" style={{ ...HL, color: C.primary + 'cc' }}>KIDZPLAINER</span>
                <div className="flex items-center gap-2">
                  <button onClick={saveResult} className="p-2 rounded-full">
                    <MIcon name="bookmark_add" size={18} style={{ color: C.onSurface }} />
                  </button>
                  <button className="p-2 rounded-full">
                    <MIcon name="more_vert" size={18} style={{ color: C.onSurface }} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-24 px-6">
              {/* Hero section */}
              <div className="mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4" style={{ background: C.secondaryFixed, color: C.secondary }}>
                  {selectedChild?.name ? `For ${selectedChild.name}` : 'Answer'}
                </span>
                <h1 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 12 }}>{question}</h1>
                <p className="text-lg leading-relaxed font-medium" style={{ color: C.onSurfaceVariant }}>Discover the answer through {layers.length} layers of understanding.</p>
              </div>

              {/* Progressive Insight label */}
              <p className="text-sm font-bold uppercase tracking-widest mb-4 px-1" style={{ color: C.outline }}>Progressive Insight</p>

              {/* Layer accordion cards */}
              <div className="space-y-4">
                {layers.map((layer: any, i: number) => {
                  const meta = LAYER_META[i] || LAYER_META[0];
                  const isOpen = openLayer === i;
                  return (
                    <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300" style={{
                      background: C.surfaceLowest,
                      border: `1px solid ${C.outlineVariant}20`,
                      boxShadow: isOpen ? `0 16px 40px rgba(29,27,23,0.08)` : `0 2px 8px rgba(29,27,23,0.04)`,
                      ...(isOpen ? { ring: `1px solid ${meta.ringColor}` } : {})
                    }}>
                      <button onClick={() => setOpenLayer(isOpen ? -1 : i)} className="w-full flex items-center justify-between p-5 text-left transition-all" style={{ background: isOpen ? `${meta.color}08` : 'transparent' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: meta.softBg }}>
                            <MIcon name={meta.matIcon} size={20} style={{ color: meta.color }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>Layer {String(i+1).padStart(2,'0')}</p>
                            <h3 style={{ ...HL, fontWeight: 700, fontSize: 17, color: C.onSurface }}>{meta.name}</h3>
                          </div>
                        </div>
                        <MIcon name="expand_more" size={18} style={{ color: C.outline, transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                      </button>
                      <div style={{ maxHeight: isOpen ? 800 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' }}>
                        <div className="px-5 pb-6">
                          <p className="text-xl font-bold leading-snug italic mb-4" style={{ ...HL, color: C.onSurface }}>"{layer.quote}"</p>
                          {layer.note && <p className="text-sm leading-relaxed mb-4" style={{ color: C.onSurfaceVariant }}>{layer.note}</p>}

                          {/* Science layer: key concept callout */}
                          {i === 2 && layer.note && (
                            <div className="p-4 rounded-2xl mb-4" style={{ background: C.tertiaryFixed + '20', border: `1px solid ${C.tertiary}15` }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.tertiary }}>Key Concept</p>
                              <p className="text-sm font-semibold" style={{ color: C.onSurface }}>{layer.note}</p>
                            </div>
                          )}

                          {/* Deep dive layer: data grid example */}
                          {i === 3 && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {[{ label: 'Simplified', value: 'Age-appropriate' }, { label: 'Depth', value: 'Full context' }].map((d, di) => (
                                <div key={di} className="p-3 rounded-xl text-center" style={{ background: C.surfaceHigh }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.outline }}>{d.label}</p>
                                  <p className="text-sm font-bold mt-1" style={{ color: C.onSurface }}>{d.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {layer.nextQ && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: meta.softBg, border: `1px solid ${meta.color}20` }}>
                              <MIcon name="arrow_forward" size={14} style={{ color: meta.color, flexShrink: 0 }} />
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

              {/* Editorial footer */}
              <div className="mt-8 p-6 rounded-3xl" style={{ background: C.primary }}>
                <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: C.onPrimary + '90' }}>Kidzplainer</p>
                <h3 style={{ ...HL, fontSize: 22, fontWeight: 800, color: C.onPrimary, lineHeight: 1.2, marginBottom: 12 }}>Empower their curiosity.</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.onPrimary + 'cc' }}>Share this guide with your co-parent, teacher, or caregiver.</p>
                <button onClick={() => { if (navigator.share) navigator.share({ title: 'Kidzplainer', text: layers[0]?.quote || question }); }} className="px-6 py-3 rounded-full font-bold text-sm" style={{ background: C.onPrimary, color: C.primary }}>
                  Share Guide
                </button>
              </div>

              {/* Action buttons row */}
              <div className="flex gap-3 mt-6">
                {[
                  { icon: 'bookmark_add', label: 'Save', action: saveResult },
                  { icon: 'content_copy', label: 'Copy', action: () => { navigator.clipboard.writeText(layers.map((l:any) => `${l.title}: ${l.quote}`).join('\n\n')); setToast('Copied!'); } },
                  { icon: 'share', label: 'Share', action: () => { if (navigator.share) navigator.share({ title: 'Kidzplainer', text: layers[0]?.quote || question }); } },
                  { icon: isSpeaking ? 'stop' : 'record_voice_over', label: isSpeaking ? 'Stop' : 'Read', action: handleSpeak },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} className="flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl font-semibold text-xs transition-all active:scale-[0.97]" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.04)`, color: C.onSurfaceVariant }}>
                    <MIcon name={a.icon} size={16} style={{ color: C.onSurfaceVariant }} />
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Parent tip card */}
              {parentTip && (
                <div className="mt-8 p-6 rounded-2xl" style={{ background: C.secondaryContainer + '40' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>Parent Tip</p>
                  <p className="text-sm leading-relaxed" style={{ color: C.onSurface }}>{parentTip}</p>
                </div>
              )}
            </div>
            <FloatingNav active="home" onNav={navigate} />
          </div>
        )}

        {/* === FOUNDER'S NOTE === */}
        {screen === 'founder' && (
          <div className="pb-20 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <button onClick={() => navigate(prevScreen || 'settings')} className="p-2 rounded-full" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.06)` }}>
                <MIcon name="arrow_back" size={18} style={{ color: C.onSurface }} />
              </button>
              <span className="text-sm font-extrabold uppercase tracking-widest" style={{ ...HL, color: C.primary + 'cc' }}>Founder's Note</span>
              <div className="w-10" />
            </div>

            <div className="px-6 mt-4">
              {/* Portrait */}
              <div className="flex justify-center mb-8">
                <div className="relative" style={{ transform: 'rotate(-3deg)' }}>
                  <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl">
                    <img src={IMAGES.founder} alt="Sarah Mitchell, Founder" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.primaryFixed, boxShadow: `0 4px 12px rgba(29,27,23,0.1)` }}>
                    <MIcon name="auto_awesome" size={16} style={{ color: C.primary }} />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="flex justify-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: C.primaryFixed + '60', color: C.primary }}>Personal Reflections</span>
              </div>

              {/* Heading */}
              <h2 style={{ ...SERIF, fontSize: 28, fontWeight: 700, fontStyle: 'italic', color: C.onSurface, lineHeight: 1.25, textAlign: 'center', marginBottom: 24 }}>
                For the moments when "Why?" feels like the hardest question in the world.
              </h2>

              {/* Editorial letter */}
              <div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: C.surfaceLowest, boxShadow: `0 8px 32px rgba(29,27,23,0.06)` }}>
                {/* Texture overlay */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231d1b17\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")', }} />

                <div className="relative z-10 space-y-4 text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  <p>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: C.primary, float: 'left', lineHeight: 0.8, marginRight: 8, marginTop: 4, ...HL }}>I</span>
                    started Kidzplainer because my daughter once asked me a question I had no idea how to answer. She was five, staring at me with those wide, trusting eyes, and I froze.
                  </p>
                  <p>
                    It was not the lack of knowledge that scared me. It was the fear of saying the wrong thing. Of planting the wrong seed. Of not honoring her intelligence while protecting her innocence.
                  </p>

                  {/* Blockquote */}
                  <div className="pl-4 py-2" style={{ borderLeft: `3px solid ${C.primary}` }}>
                    <p className="italic font-semibold" style={{ color: C.onSurface }}>
                      "Every child deserves an answer that respects both their curiosity and their innocence."
                    </p>
                  </div>

                  <p>
                    So I built this -- not as a replacement for the parent, but as a partner. An assistant that helps you find the right words, at the right depth, with the right sensitivity.
                  </p>
                  <p>
                    Because you are the expert on your child. We just help you find the words.
                  </p>
                </div>

                {/* Signature */}
                <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${C.outlineVariant}30` }}>
                  <p style={{ ...HANDWRITTEN, fontSize: 48, color: C.primary, lineHeight: 1 }}>With love & care,</p>
                  <p className="mt-2 font-bold text-lg" style={{ ...SERIF, color: C.onSurface }}>Sarah Mitchell</p>
                  <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>Founder, Kidzplainer</p>
                </div>
              </div>

              {/* Let's Begin button */}
              <button onClick={() => navigate('home')} className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all mt-8" style={{ ...HL, background: C.primary, color: C.onPrimary, boxShadow: '0 12px 24px -8px rgba(145,75,49,0.4)' }}>
                Let's Begin <MIcon name="arrow_forward" size={18} style={{ color: C.onPrimary }} />
              </button>

              {/* Trust line */}
              <p className="text-center text-xs font-semibold mt-4" style={{ color: C.onSurfaceVariant + '80' }}>Trusted by 12,000+ conscious parents</p>
            </div>
          </div>
        )}

        {/* === PAYWALL === */}
        {screen === 'paywall' && (
          <div className="pb-20 px-6 pt-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: C.secondaryFixed }} />
            <button onClick={() => navigate('home')} className="p-2 rounded-full mb-4" style={{ background: C.white }}>
              <MIcon name="close" size={18} style={{ color: C.primary }} />
            </button>

            {/* Heading */}
            <h1 style={{ ...HL, fontSize: 40, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Turn "Why?" into <span style={{ color: C.primary, fontStyle: 'italic' }}>Wonder.</span>
            </h1>
            <p className="text-base mb-8" style={{ color: C.onSurfaceVariant }}>Unlock unlimited, expert-backed answers for every question.</p>

            {/* 3 bento feature cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: 'psychology', label: 'Age-Matched Logic', color: C.primary, bg: C.primaryFixed },
                { icon: 'auto_stories', label: 'Infinite Library', color: C.secondary, bg: C.secondaryFixed },
                { icon: 'volunteer_activism', label: 'Parenting Calm', color: C.tertiary, bg: C.tertiaryFixed },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center" style={{ background: f.bg + '40' }}>
                  <MIcon name={f.icon} size={24} style={{ color: f.color }} />
                  <span className="text-[11px] font-bold leading-tight" style={{ color: f.color }}>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Plans */}
            <div className="space-y-4 mb-8">
              {/* Monthly plan */}
              <button onClick={() => setSelectedPlan('monthly')} className="w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden" style={{ background: selectedPlan === 'monthly' ? C.surfaceLow : C.white, border: `1.5px solid ${selectedPlan === 'monthly' ? C.outlineVariant : C.outlineVariant + '40'}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.onSurfaceVariant }}>Flexible</p>
                <p className="text-xl font-bold" style={{ ...HL, color: C.onSurface }}>Monthly</p>
                <p className="text-3xl font-extrabold mt-2" style={{ color: C.onSurface }}>$4.99<span className="text-base font-medium" style={{ color: C.onSurfaceVariant }}>/mo</span></p>
                <div className="mt-4 space-y-2.5">
                  {['Unlimited AI-powered answers','Save favorite explanations','Cancel anytime'].map((f,fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <MIcon name="check_circle" size={16} style={{ color: C.tertiary }} />
                      <span className="text-sm" style={{ color: C.onSurfaceVariant }}>{f}</span>
                    </div>
                  ))}
                </div>
              </button>

              {/* Annual plan - best value */}
              <button onClick={() => setSelectedPlan('annual')} className="w-full p-6 rounded-3xl text-left transition-all relative overflow-hidden" style={{
                background: C.white,
                border: `2px solid ${selectedPlan === 'annual' ? C.primary + '50' : C.outlineVariant + '30'}`,
                boxShadow: selectedPlan === 'annual' ? '0 8px 32px rgba(145,75,49,0.12)' : 'none',
                ...(selectedPlan === 'annual' ? { backgroundImage: `linear-gradient(135deg, ${C.white}, ${C.primaryFixed}15)` } : {})
              }}>
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: C.secondary, color: C.onPrimary }}>Save 40%</span>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>Most Trusted</p>
                <p className="text-2xl font-bold" style={{ ...HL, color: C.onSurface }}>Annual Premium</p>
                <p className="text-4xl font-extrabold mt-2" style={{ color: C.onSurface }}>$49.99<span className="text-base font-medium" style={{ color: C.onSurfaceVariant }}>/year</span></p>
                <p className="text-sm font-semibold mt-1" style={{ color: C.secondary }}>Less than $4.20 per month</p>
                <div className="mt-4 space-y-2.5">
                  {['7-Day Free Trial Included','Unlimited AI-powered answers','Priority access to new guides','Downloadable parenting tips'].map((f,fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <MIcon name="check_circle" size={16} style={{ color: C.secondary }} filled />
                      <span className="text-sm" style={{ color: fi === 0 ? C.onSurface : C.onSurfaceVariant, fontWeight: fi === 0 ? 700 : 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            </div>

            {/* Unlock button */}
            <button onClick={() => handleCheckout(selectedPlan)} className="w-full py-6 rounded-full font-extrabold text-xl active:scale-[0.97] transition-all" style={{ ...HL, background: `linear-gradient(135deg, ${C.primary}, #b35d3d)`, color: C.onPrimary, boxShadow: '0 20px 40px -12px rgba(145,75,49,0.3)' }}>Unlock All Answers</button>
            <p className="text-center text-[10px] mt-4 font-bold uppercase tracking-widest" style={{ color: C.onSurfaceVariant + '80' }}>Secure Checkout -- Cancel Anytime</p>

            {/* Testimonials */}
            <div className="mt-10">
              <p className="text-center text-sm font-extrabold uppercase tracking-widest mb-6" style={{ color: C.onSurface }}>Trusted by 50,000+ Families</p>
              <div className="space-y-4">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="p-6 rounded-3xl" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.04)` }}>
                    <div className="flex items-center gap-3 mb-3">
                      {t.img ? (
                        <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.primaryFixed }}>
                          <span className="text-sm font-bold" style={{ color: C.primary }}>{t.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.onSurface }}>{t.name}</p>
                        <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{t.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({length: t.stars}).map((_, s) => (
                        <MIcon key={s} name="star" size={14} style={{ color: C.primary }} filled />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed italic" style={{ color: C.onSurfaceVariant }}>"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust footer */}
            <div className="flex justify-center gap-6 mt-8 pb-4">
              {[
                { icon: 'verified_user', label: 'Safe' },
                { icon: 'workspace_premium', label: 'Premium' },
                { icon: 'family_restroom', label: 'Family' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1 opacity-50">
                  <MIcon name={b.icon} size={18} style={{ color: C.onSurfaceVariant }} />
                  <span className="text-[9px] uppercase font-extrabold tracking-widest" style={{ color: C.onSurfaceVariant }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SAVED / LIBRARY === */}
        {screen === 'saved' && (
          <div className="pb-32 px-6 pt-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>Your Library</h2>
            {saved.length === 0 ? (
              <div className="text-center py-20">
                <MIcon name="auto_stories" size={48} style={{ color: C.outlineVariant }} />
                <p className="font-bold text-lg mt-4" style={{ color: C.onSurface }}>No saved explanations yet</p>
                <p className="text-sm mt-2" style={{ color: C.onSurfaceVariant }}>Your saved answers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {saved.map((s: any) => (
                  <button key={s.id} onClick={() => { setQuestion(s.question); setLayers(s.layers); setOpenLayer(0); navigate('result'); }} className="w-full text-left p-5 rounded-2xl transition-all active:scale-[0.98]" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.04)` }}>
                    <p className="font-bold text-base mb-1" style={{ color: C.onSurface }}>{s.question}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: C.onSurfaceVariant }}><span>{s.child?.name}</span><span>.</span><span>{s.date}</span></div>
                  </button>
                ))}
              </div>
            )}
            <FloatingNav active="saved" onNav={navigate} />
          </div>
        )}

        {/* === COMMUNITY / CONNECT === */}
        {screen === 'community' && (
          <div className="pb-32 px-6 pt-8 relative" style={{ background: C.surface, minHeight: '100vh' }}>
            <div className="absolute -top-10 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20" style={{ background: C.secondaryFixed }} />
            <h2 style={{ ...HL, fontSize: 36, fontWeight: 800, color: C.onSurface, lineHeight: 1.1, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Curiosity met with <span style={{ color: C.primary, fontStyle: 'italic' }}>Expertise.</span>
            </h2>
            <p className="text-base mb-8" style={{ color: C.onSurfaceVariant }}>See what other parents are asking.</p>

            {/* Trending cards */}
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.primary + 'cc' }}>Community Trending</p>
            <div className="space-y-4 mb-10">
              {[
                { q: '"Where do dreams go when we wake up?"', tag: 'Science & Nature', count: '12 parents joined' },
                { q: '"Why can\'t I always win at games?"', tag: 'Social Skills', count: '84 parents asked today' },
                { q: '"Why did our goldfish go to sleep forever?"', tag: 'Life Events', count: 'Spiking in Toddlers (3-5)' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-3xl" style={{ background: C.white, boxShadow: `0 4px 16px rgba(29,27,23,0.05)` }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block" style={{ background: C.tertiaryFixed + '40', color: C.tertiary }}>{item.tag}</span>
                  <h3 style={{ ...HL, fontSize: 20, fontWeight: 800, color: C.onSurface, lineHeight: 1.2, marginBottom: 8 }}>{item.q}</h3>
                  <p className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>{item.count}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.primary + 'cc' }}>What Parents Say</p>
            <div className="space-y-4">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-6 rounded-3xl" style={{ background: C.white, boxShadow: `0 2px 8px rgba(29,27,23,0.04)` }}>
                  <div className="flex items-center gap-3 mb-3">
                    {t.img ? (
                      <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.primaryFixed }}>
                        <span className="text-sm font-bold" style={{ color: C.primary }}>{t.name[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.onSurface }}>{t.name}</p>
                      <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({length: t.stars}).map((_, s) => (
                      <MIcon key={s} name="star" size={14} style={{ color: C.primary }} filled />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed italic" style={{ color: C.onSurfaceVariant }}>"{t.text}"</p>
                </div>
              ))}
            </div>
            <FloatingNav active="community" onNav={navigate} />
          </div>
        )}

        {/* === SETTINGS === */}
        {screen === 'settings' && (
          <div className="pb-32 px-6 pt-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <h2 style={{ ...HL, fontSize: 32, fontWeight: 800, color: C.onSurface, marginBottom: 16 }}>Your Profile</h2>

            <div className="p-6 rounded-2xl mb-6" style={{ background: C.white, boxShadow: `0 4px 16px rgba(29,27,23,0.05)` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: C.primaryFixed, color: C.primary }}>{userName?.[0]?.toUpperCase() || 'P'}</div>
                <div><p className="font-bold text-lg" style={{ color: C.onSurface }}>{userName}</p><p className="text-sm" style={{ color: C.onSurfaceVariant }}>{user?.email}</p></div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: isPro || isAdmin ? C.secondaryContainer + '50' : C.primaryFixed + '50' }}>
                <MIcon name={isPro || isAdmin ? 'verified' : 'lock_open'} size={14} style={{ color: isPro || isAdmin ? C.secondary : C.primary }} />
                <span className="text-xs font-bold" style={{ color: isPro || isAdmin ? C.secondary : C.primary }}>{isPro || isAdmin ? 'Pro Member' : `Free Plan -- ${freeLeft} left`}</span>
              </div>
            </div>

            <div className="space-y-3">
              {[{ label: 'Language', value: selLanguage },{ label: 'Country', value: selCountry },{ label: 'Worldview', value: selBelief }].map((item, i) => (
                <button key={i} onClick={() => { setSetupStep(i + 2); navigate('setup'); }} className="w-full flex items-center justify-between p-5 rounded-2xl active:scale-[0.98] transition-all" style={{ background: C.white }}>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.onSurfaceVariant + 'b0' }}>{item.label}</p><p className="font-semibold text-base" style={{ color: C.onSurface }}>{item.value || 'Not set'}</p></div>
                  <MIcon name="arrow_forward" size={18} style={{ color: C.outline }} />
                </button>
              ))}

              <button onClick={() => navigate('paywall')} className="w-full p-5 rounded-2xl text-left" style={{ background: C.primaryFixed + '60' }}>
                <p className="font-bold" style={{ color: C.primary }}>{isPro || isAdmin ? 'View Pricing (Pro active)' : 'Upgrade to Pro'}</p>
                <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{isPro || isAdmin ? 'Preview pricing and plans' : 'Unlimited answers, priority features'}</p>
              </button>

              {/* Founder's Note link */}
              <button onClick={() => navigate('founder')} className="w-full flex items-center justify-between p-5 rounded-2xl" style={{ background: C.white }}>
                <div className="flex items-center gap-3">
                  <MIcon name="auto_awesome" size={18} style={{ color: C.primary }} />
                  <span className="font-semibold" style={{ color: C.onSurface }}>Founder's Note</span>
                </div>
                <MIcon name="arrow_forward" size={18} style={{ color: C.outline }} />
              </button>

              <button onClick={() => { setLegalPage('privacy'); navigate('legal'); }} className="w-full flex items-center justify-between p-5 rounded-2xl" style={{ background: C.white }}>
                <span className="font-semibold" style={{ color: C.onSurface }}>Privacy Policy</span>
                <MIcon name="arrow_forward" size={18} style={{ color: C.outline }} />
              </button>
              <button onClick={() => { setLegalPage('terms'); navigate('legal'); }} className="w-full flex items-center justify-between p-5 rounded-2xl" style={{ background: C.white }}>
                <span className="font-semibold" style={{ color: C.onSurface }}>Terms of Service</span>
                <MIcon name="arrow_forward" size={18} style={{ color: C.outline }} />
              </button>

              <button onClick={async () => { await signOut(); navigate('onboarding'); }} className="w-full p-5 rounded-2xl flex items-center gap-3" style={{ background: C.errorContainer + '40' }}>
                <MIcon name="logout" size={18} style={{ color: '#ba1a1a' }} />
                <span className="font-bold" style={{ color: '#ba1a1a' }}>Sign Out</span>
              </button>
            </div>
            <FloatingNav active="settings" onNav={navigate} />
          </div>
        )}

        {/* === LEGAL === */}
        {screen === 'legal' && (
          <div className="px-6 py-8" style={{ background: C.surface, minHeight: '100vh' }}>
            <button onClick={() => navigate('settings')} className="p-2 rounded-full mb-6" style={{ background: C.white }}>
              <MIcon name="arrow_back" size={18} style={{ color: C.onSurface }} />
            </button>
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

      {/* Global CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
