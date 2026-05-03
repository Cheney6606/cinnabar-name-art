/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { isNameSafe } from '../lib/naming-rules/rule-checker.js';
import html2canvas from 'html2canvas';
import { 
  BookOpen, 
  Stars, 
  FolderHeart,
  ArrowRight,
  UserCheck,
  ScrollText,
  Shield,
  Palette,
  Download,
  CheckCircle2,
  Lock,
  Pen,
  Store,
  TreePine,
  Heart as HeartIcon,
  Wind,
} from 'lucide-react';
import { 
  AppStage, 
  NamingGoal, 
  UserContext, 
  NameIdentity,
  NameVibe,
  StylePreference,
  RegionalFocus,
} from './types';
import { generateNames } from './services/model-dispatcher';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// --- Components ---

const SidebarIcon = ({ icon: Icon, active, label, onClick }: { icon: any, active?: boolean, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 w-full transition-all duration-300 font-serif text-lg tracking-wide ${
      active 
        ? 'text-red-800 dark:text-red-500 bg-red-50/50 dark:bg-red-950/20 border-r-2 border-red-800' 
        : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
    }`}
  >
    <Icon size={20} className={active ? 'fill-current' : ''} />
    <span>{label}</span>
  </button>
);

const Navbar = ({ onLogoClick, onGetStarted, showHomeLink = false }: { onLogoClick?: () => void; onGetStarted?: () => void; showHomeLink?: boolean }) => (
  <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-900">
    <div className="flex items-center gap-4">
      <div 
        className="text-lg md:text-xl font-bold tracking-widest uppercase font-serif cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color: '#9B2226' }}
        onClick={onLogoClick}
      >
        CINNABAR
      </div>
      
      <div className="hidden md:flex items-center gap-1 font-serif" style={{ color: 'rgba(155, 34, 38, 0.7)' }}>
        <span style={{ marginLeft: '4px' }}>・</span>
        <span>Tradition</span>
        <span>・</span>
        <span>Expertise</span>
        <span>・</span>
        <span>Process</span>
      </div>
    </div>

    {showHomeLink && (
      <button 
        onClick={onLogoClick}
        className="font-serif text-stone-600 hover:text-[#8f000d] transition-colors"
      >
        Home
      </button>
    )}

    <div className="flex items-center">
      <button 
        onClick={onGetStarted}
        className="bg-[#8f000d] text-white px-6 py-2 rounded-full font-semibold text-xs tracking-widest uppercase hover:bg-[#b52424] transition-colors"
      >
        Get Started
      </button>
    </div>
  </header>
);

const LoadingPage = () => {
  const [phase, setPhase] = useState(0);

  const phases = [
    { title: "Scanning 1,800+ expert-verified safe characters..." },
    { title: "Eliminating hidden homophonic and cultural risks..." },
    { title: "Matching phonetic resonance with your English name..." },
    { title: "Curating 3 culturally authentic options. Finalizing..." }
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setPhase(1), 1250));
    timers.push(setTimeout(() => setPhase(2), 2500));
    timers.push(setTimeout(() => setPhase(3), 3750));
    
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Rotating Icon */}
        <div className="mb-16">
          <div className="relative w-64 h-64 mx-auto">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#8f000d]/20" />
            {/* Inner Circle */}
            <div className="absolute inset-8 rounded-full bg-[#fdf2f2] flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Wind size={64} className="text-[#8f000d]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-stone-900 mb-3">The Ritual of Naming</h1>
          <p className="font-serif text-lg text-stone-600">Crafting your unique Chinese name with care and precision.</p>
        </div>

        {/* Dynamic Status */}
        <div className="mb-16">
          {phases.map((item, i) => (
            phase >= i && (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mb-6 ${i < phase ? 'opacity-60' : ''}`}
              >
                <p className="text-lg text-stone-600">{item.title}</p>
              </motion.div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ stage, onNavigate, hasSubmitted, hasSelectedName }: { stage: AppStage, onNavigate?: (stage: AppStage) => void, hasSubmitted?: boolean, hasSelectedName?: boolean }) => (
  <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-5rem)] flex-col pt-8 bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-sm w-64 border-r border-stone-200/50 dark:border-stone-800/50">
    <div className="px-6 mb-8">
      <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-100 mb-1">Naming Journey</h3>
      <p className="text-stone-500 text-sm italic">Path to Resonance</p>
    </div>
    <nav className="flex-1">
      <SidebarIcon icon={BookOpen} label="Context" active={stage === 'context'} onClick={() => onNavigate?.('context')} />
      {hasSubmitted && (
        <>
          <SidebarIcon icon={Stars} label="Selection" active={stage === 'selection'} onClick={() => onNavigate?.('selection')} />
          {hasSelectedName && (
            <SidebarIcon icon={FolderHeart} label="Dossier" active={stage === 'dossier'} onClick={() => onNavigate?.('dossier')} />
          )}
        </>
      )}
    </nav>
  </aside>
);

// --- Home Page ---

function HomePage({ onStartNaming }: { onStartNaming: () => void }) {
  const [showFindReport, setShowFindReport] = useState(false);
  const [findReportEmail, setFindReportEmail] = useState('');
  const [findReportMessage, setFindReportMessage] = useState('');

  const handleFindReport = async () => {
    if (!findReportEmail) return;
    
    // 【新增功能代码】查找报告逻辑
    // 实际环境应调用 API 查询
    console.log('Finding report for:', findReportEmail);
    
    // 模拟查询
    setFindReportMessage('If a report exists for this email, it has been sent.');
    setTimeout(() => {
      setShowFindReport(false);
      setFindReportEmail('');
      setFindReportMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <Navbar onLogoClick={() => {}} onGetStarted={onStartNaming} />
      
      {/* 【新增功能代码】报告找回弹窗 */}
      {showFindReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h3 className="font-serif text-2xl text-stone-900 mb-4 text-center">Find My Report</h3>
            <p className="text-stone-500 text-sm mb-6 text-center">
              Enter your email to receive your report again.
            </p>
            <input
              type="email"
              value={findReportEmail}
              onChange={(e) => setFindReportEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-stone-300 rounded-xl px-4 py-3 mb-4 focus:border-[#8f000d] outline-none"
            />
            {findReportMessage && (
              <p className="text-green-600 text-sm mb-4 text-center">{findReportMessage}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowFindReport(false);
                  setFindReportEmail('');
                  setFindReportMessage('');
                }}
                className="flex-1 border border-stone-300 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFindReport}
                disabled={!findReportEmail}
                className="flex-1 bg-[#8f000d] text-white py-3 rounded-xl font-medium hover:bg-[#b52424] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Report
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 min-h-screen">
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-12"
        >
          <div className="flex-1 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-left flex flex-col gap-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight"
              >
                Your Authentic Chinese Name, <span className="text-[#8f000d]">Certified & Safe.</span>
              </motion.h1>
              <p className="text-[#b22222] font-semibold text-xl">3 Seconds · Known Risks Blocked</p>
              <p className="text-stone-600 text-lg max-w-xl">
                Avoid cultural mistakes with expert-backed naming for tattoos, business, and heritage. A modern approach rooted in deep tradition.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={onStartNaming}
                  className="bg-[#8f000d] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#b52424] transition-all shadow-xl shadow-red-900/10"
                >
                  Start Naming
                </button>
                <button className="border border-stone-300 px-8 py-4 rounded-xl text-lg font-medium hover:bg-stone-50 transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-red-100/30 rounded-full blur-3xl -z-10" />
              <img 
                src="/unnamed.png"
                alt="Integrity Calligraphy"
                className="w-full max-w-md mix-blend-multiply opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.section>

        {/* Transparent Expertise */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-stone-900 mb-2">Transparent Expertise</h2>
            <p className="text-stone-500 italic text-lg">The rigour behind every safe name</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8f000d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                title: "Expert-Verified Safe Words",
                desc: "We ensure your name means exactly what you intend, avoiding any slang, negative historical context, or phonetic traps."
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8f000d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4h22v16H1V4z"/><polyline points="23 4 12 14 1 4"/><path d="M12 14v7"/></svg>,
                title: "Closed-Loop Cultural Logic",
                desc: "Our names aren't just translated; they are constructed following traditional naming conventions, including stroke count and element balance."
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8f000d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: "Zero Risk Guarantee",
                desc: "Every name comes with a comprehensive audit report. If you encounter cultural issues, we will revise it completely free of charge."
              }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl p-8 text-center"
              >
                <div className="mx-auto mb-6">{card.icon}</div>
                <h3 className="font-serif text-2xl text-stone-900 mb-4">{card.title}</h3>
                <p className="text-stone-600 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "I almost got a tattoo that meant something embarrassing. Cinnabar caught it and gave me a beautiful alternative.",
                name: "Michael T.",
                role: "Tattoo Client"
              },
              {
                text: "The dossier explained the deep cultural significance behind every stroke. Highly recommended for professionals.",
                name: "Sarah J.",
                role: "Business Expansion"
              },
              {
                text: "Fast, affordable, and most importantly—safe. The calligraphy download was perfect for my artist to use.",
                name: "David L.",
                role: "Designer"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#8f000d" stroke="#8f000d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-stone-700 text-lg italic mb-8 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="text-center">
                  <img 
                    src={`https://images.unsplash.com/photo-${i === 0 ? '1507003211169-0a1dd7228f2d' : i === 1 ? '1438761681033-6461ffad8d80' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&q=80&w=100&h=100&crop=face`}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mx-auto mb-3 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <p className="font-semibold text-stone-900">— {testimonial.name}</p>
                  <p className="text-stone-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-16 max-w-4xl mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl p-10">
            <h2 className="font-serif text-4xl text-stone-900 mb-4">Generate Your Safe Name Now</h2>
            <p className="text-stone-500 text-sm mb-8">Immediate delivery. Complete cultural safety.</p>
            <button 
              onClick={onStartNaming}
              className="bg-[#8f000d] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#b52424] transition-all shadow-xl shadow-red-900/10"
            >
              Start Naming
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-12 py-12 bg-white border-t border-stone-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="text-xl font-bold text-[#8f000d] font-serif">CINNABAR</div>
            <div className="font-serif text-stone-400 italic text-sm">© 2026 CINNABAR. Wisdom in Every Stroke.</div>
            <nav className="flex gap-6 text-stone-400 text-xs font-bold uppercase tracking-widest">
              <button onClick={() => setShowFindReport(true)} className="hover:text-[#8f000d] transition-colors">Find My Report</button>
              <a href="#" className="hover:text-[#8f000d] transition-colors">Heritage</a>
              <a href="#" className="hover:text-[#8f000d] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#8f000d] transition-colors">Terms</a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}

// --- Context Page ---

function ContextPage({ 
  context, 
  setContext, 
  onGetPreview, 
  loading,
  hasSubmitted,
  hasSelectedName,
  errorMessage
}: { 
  context: UserContext;
  setContext: Dispatch<SetStateAction<UserContext>>;
  onGetPreview: () => void;
  loading: boolean;
  hasSubmitted: boolean;
  hasSelectedName: boolean;
  errorMessage: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <Navbar 
        onLogoClick={() => navigate('/')} 
        onGetStarted={() => navigate('/context')}
        showHomeLink={true}
      />
      <Sidebar stage="context" hasSubmitted={hasSubmitted} hasSelectedName={hasSelectedName} onNavigate={(stage) => {
        if (stage === 'context') navigate('/context');
        else if (stage === 'selection') navigate('/selection');
        else if (stage === 'dossier') navigate('/dossier');
      }} />

      <main className="md:ml-64 pt-24 min-h-screen">
        <motion.section 
          key="context"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full"
        >
          <div className="text-center mb-12">
            <span className="text-[#8f000d] text-xs font-bold tracking-[.3em] uppercase block mb-4">Stage I</span>
            <h2 className="font-serif text-5xl text-stone-900 mb-6">The Ritual</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
               To craft a name with profound resonance, we must first understand the vessel it will inhabit. Define "intent" behind this journey.
            </p>
          </div>

          <div className="w-full bg-white/60 backdrop-blur-xl border border-stone-200 rounded-2xl p-10 shadow-sm">
            <h3 className="font-serif text-2xl text-center mb-8">Primary Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {[
                { id: NamingGoal.TATTOO, label: 'Tattoo', icon: Pen },
                { id: NamingGoal.BUSINESS, label: 'Business', icon: Store },
                { id: NamingGoal.HERITAGE, label: 'Heritage', icon: TreePine },
                { id: NamingGoal.PASSION, label: 'Passion', icon: HeartIcon },
              ].map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setContext(prev => ({ ...prev, goal: goal.id }))}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${
                    context.goal === goal.id 
                      ? 'border-[#8f000d] bg-red-50 text-[#8f000d]' 
                      : 'border-stone-200 bg-white hover:border-[#8f000d] hover:bg-stone-50'
                  }`}
                >
                  <div className="mb-3 text-stone-400 group-hover:text-[#8f000d]">
                    <goal.icon size={40} />
                  </div>
                  <span className="font-medium text-lg">{goal.label}</span>
                </button>
              ))}
            </div>

            <h3 className="font-serif text-2xl text-center mb-8">Name Vibe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { id: NameVibe.MASCULINE, label: 'Masculine (Bold & Strong)' },
                { id: NameVibe.FEMININE, label: 'Feminine (Soft & Elegant)' },
                { id: NameVibe.NEUTRAL, label: 'Neutral (Timeless & Unisex)' },
              ].map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => setContext(prev => ({ ...prev, nameVibe: vibe.id }))}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${
                    context.nameVibe === vibe.id 
                      ? 'border-[#8f000d] bg-red-50 text-[#8f000d]' 
                      : 'border-stone-200 bg-white hover:border-[#8f000d] hover:bg-stone-50'
                  }`}
                >
                  <span className="font-medium text-lg">{vibe.label}</span>
                </button>
              ))}
            </div>

            <h3 className="font-serif text-2xl text-center mb-8">Style Preference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {[
                { id: StylePreference.YOUNG_BOLD, label: 'Young & Bold (18-29)' },
                { id: StylePreference.CLASSIC_REFINED, label: 'Classic & Refined (30+)' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setContext(prev => ({ ...prev, stylePreference: style.id }))}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${
                    context.stylePreference === style.id 
                      ? 'border-[#8f000d] bg-red-50 text-[#8f000d]' 
                      : 'border-stone-200 bg-white hover:border-[#8f000d] hover:bg-stone-50'
                  }`}
                >
                  <span className="font-medium text-lg">{style.label}</span>
                </button>
              ))}
            </div>

            <h3 className="font-serif text-2xl text-center mb-8">Regional Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { id: RegionalFocus.GENERAL, label: 'General (Universal)' },
                { id: RegionalFocus.WESTERN_FRIENDLY, label: 'Western-Friendly' },
                { id: RegionalFocus.EAST_ASIAN, label: 'East Asian (Traditional)' },
              ].map((region) => (
                <button
                  key={region.id}
                  onClick={() => setContext(prev => ({ ...prev, regionalFocus: region.id }))}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${
                    context.regionalFocus === region.id 
                      ? 'border-[#8f000d] bg-red-50 text-[#8f000d]' 
                      : 'border-stone-200 bg-white hover:border-[#8f000d] hover:bg-stone-50'
                  }`}
                >
                  <span className="font-medium text-lg">{region.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-12">
              <label className="block text-xs font-bold text-stone-400 tracking-widest uppercase mb-3">
                Cultural Focus or English Name
              </label>
              
              {/* 引导文字 */}
              <p className="text-[12px] text-gray-400 mb-3" style={{ color: '#A3A3A3' }}>
                Enter your English name as it appears on your ID or passport.
              </p>
              
              {/* 输入框 */}
              <div className="relative">
                <input 
                  type="text" 
                  value={context.intent}
                  onChange={(e) => {
                    const value = e.target.value;
                    const isValid = /^[a-zA-Z\s\-'.àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇñÑ]*$/.test(value);
                    if (isValid) {
                      setContext(prev => ({ ...prev, intent: value }));
                    }
                  }}
                  placeholder="e.g. Sean, Mary-Ann, O'Connor, Chloé"
                  className={`w-full bg-transparent border-b py-3 text-xl outline-none transition-colors ${
                    (() => {
                      const hasChinese = /[\u4e00-\u9fff]/.test(context.intent);
                      const hasNumbers = /[0-9]/.test(context.intent);
                      const hasInvalid = /[<>"`(){}[\]{}|\\/*+^$#@!~;=]/.test(context.intent);
                      
                      return hasChinese || hasNumbers || hasInvalid ? 'border-red-500' : 'border-stone-200 focus:border-[#8f000d]';
                    })()
                  }`}
                  style={{ 
                    '::placeholder': { color: '#A3A3A3' } 
                  } as any}
                />
                {/* 红色感叹号图标 */}
                {(() => {
                  const hasChinese = /[\u4e00-\u9fff]/.test(context.intent);
                  const hasNumbers = /[0-9]/.test(context.intent);
                  const hasInvalid = /[<>"`(){}[\]{}|\\/*+^$#@!~;=]/.test(context.intent);
                  
                  if (hasChinese || hasNumbers || hasInvalid) {
                    return (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#EF4444' }}>
                          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* 错误提示 */}
              {(() => {
                const hasChinese = /[\u4e00-\u9fff]/.test(context.intent);
                const hasNumbers = /[0-9]/.test(context.intent);
                const hasInvalid = /[<>"`(){}[\]{}|\\/*+^$#@!~;=]/.test(context.intent);
                
                if (hasChinese) {
                  return (
                    <p className="mt-2 text-sm" style={{ fontSize: '14px', color: '#EF4444' }}>
                      Please enter your English name only. Chinese characters are not supported at this step.
                    </p>
                  );
                }
                
                if (hasNumbers || hasInvalid) {
                  return (
                    <p className="mt-2 text-sm" style={{ fontSize: '14px', color: '#EF4444' }}>
                      Only letters, spaces, hyphens, apostrophes, and accented characters allowed. No numbers or special characters.
                    </p>
                  );
                }
                
                return null;
              })()}
            </div>

            {/* 【新增功能代码】错误提示 */}
            {errorMessage && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-[#8f000d] font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="flex justify-center">
              <button 
                onClick={onGetPreview}
                disabled={!context.intent || loading}
                className="bg-[#8f000d] text-white px-12 py-4 rounded-full font-semibold flex items-center gap-3 hover:bg-[#b52424] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking for risks...' : (
                  <>
                    Get Free Preview
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

// --- Selection Page ---

function SelectionPage({ 
  results, 
  context, 
  onSelect,
  hasSubmitted,
  hasSelectedName
}: { 
  results: NameIdentity[];
  context: UserContext;
  onSelect: (name: NameIdentity) => void;
  hasSubmitted: boolean;
  hasSelectedName: boolean;
}) {
  const navigate = useNavigate();

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf9f8]">
        <Navbar onLogoClick={() => navigate('/')} showHomeLink={true} />
        <main className="pt-24 flex items-center justify-center">
          <p className="text-stone-500">No results found. Please go back and try again.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <Navbar onLogoClick={() => navigate('/')} showHomeLink={true} />
      <Sidebar stage="selection" hasSubmitted={hasSubmitted} hasSelectedName={hasSelectedName} onNavigate={(stage) => {
        if (stage === 'context') navigate('/context');
        else if (stage === 'selection') navigate('/selection');
        else if (stage === 'dossier') navigate('/dossier');
      }} />

      <main className="md:ml-64 pt-24 min-h-screen">
        <motion.section 
          key="selection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-8 md:p-12"
        >
          <header className="mb-12">
            <h1 className="font-serif text-5xl text-stone-900 mb-2">The Selection</h1>
            <p className="font-serif text-2xl text-stone-500 italic">Handpicked for you.</p>
            <div className="h-px w-24 bg-red-200 mt-6" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {results.map((name, i) => (
              <motion.article 
                key={name.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
              >
                <div className="p-8 flex-1 flex flex-col items-center">
                  <div className="self-start mb-6">
                    <span className="bg-stone-100 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-stone-500 rounded">
                       {context.goal}
                    </span>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-8">
                    <UserCheck size={14} className="text-[#8f000d]" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-stone-600">Verified Safe</span>
                  </div>
                  
                  <h2 className="font-serif text-3xl text-stone-900 mb-2">{name.pinyin}</h2>
                  <p className="text-stone-500 italic text-lg mb-8">{name.englishMeaning}</p>
                  
                  <div className="w-full mt-auto">
                    <button 
                      onClick={() => onSelect(name)}
                      className="w-full py-4 border border-stone-300 rounded-xl font-bold text-xs tracking-widest uppercase hover:bg-[#8f000d] hover:text-white hover:border-[#8f000d] transition-all"
                    >
                      Select Identity
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

// --- Dossier Page ---

function DossierPage({
  selectedName,
  isPaid,
  onPayment,
  onMockPayment,
  onRealPayment,
  isDevelopment,
  hasSubmitted,
  hasSelectedName,
  context
}: {
  selectedName: NameIdentity | null;
  isPaid: boolean;
  onPayment: () => void;
  onMockPayment?: () => void;
  onRealPayment?: () => void;
  isDevelopment?: boolean;
  hasSubmitted: boolean;
  hasSelectedName: boolean;
  context: UserContext;
}) {
  const navigate = useNavigate();

  if (!selectedName) {
    return (
      <div className="min-h-screen bg-[#fcf9f8]">
        <Navbar onLogoClick={() => navigate('/')} showHomeLink={true} />
        <main className="pt-24 flex items-center justify-center">
          <p className="text-stone-500">No name selected. Please go back and select a name.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <Navbar onLogoClick={() => navigate('/')} showHomeLink={true} />
      <Sidebar stage="dossier" hasSubmitted={hasSubmitted} hasSelectedName={hasSelectedName} onNavigate={(stage) => {
        if (stage === 'context') navigate('/context');
        else if (stage === 'selection') navigate('/selection');
        else if (stage === 'dossier') navigate('/dossier');
      }} />

      <main className="md:ml-64 pt-24 min-h-screen">
        <motion.section 
          key="dossier"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-8 md:p-12 mb-12"
        >
          <div id="report-content" className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 mb-8">
                <UserCheck size={16} className="text-[#8f000d]" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-stone-600">Verified Safe</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 items-center">
                {selectedName.characters.split('').map((char: string, i: number) => (
                  <div key={i} className="relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] border border-[#9B2226] bg-white shadow-sm">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(155,34,38,0.2)" strokeWidth="0.5" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(155,34,38,0.2)" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(155,34,38,0.2)" strokeWidth="0.5" />
                      <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(155,34,38,0.2)" strokeWidth="0.5" />
                    </svg>
                    <span className={`text-[60px] md:text-[72px] text-[#9B2226] ${!isPaid ? 'blur-md select-none' : ''}`} style={{ fontFamily: 'Noto Serif SC, SimSun, serif', fontWeight: '500', lineHeight: '1', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: 0, padding: 0 }}>{char}</span>
                  </div>
                ))}
              </div>
              <h1 className="font-serif text-5xl text-stone-900 mb-2">{selectedName.pinyin}</h1>
              <p className="text-stone-500 italic text-2xl">{selectedName.englishMeaning}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                <section className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                   <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                     <BookOpen size={120} />
                   </div>
                   <h2 className="font-serif text-3xl text-stone-900 mb-8 flex items-center gap-3 border-b border-stone-100 pb-6">
                     <ScrollText className="text-[#8f000d]" />
                     Etymology & Resonance
                   </h2>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                     {selectedName.details.map((detail, i) => (
                       <div key={i} className="p-6 bg-[#fcf9f8] border border-stone-100 rounded-xl flex items-start gap-4">
                         <div className="text-5xl text-[#8f000d] font-serif flex items-center justify-center flex-shrink-0">{detail.char}</div>
                         <div className="flex-1">
                           <h4 className="text-[10px] font-bold text-stone-400 tracking-[.2em] uppercase mb-4">{detail.pinyin} ({detail.meaning})</h4>
                           <div className={!isPaid ? 'blur-md select-none' : ''}>
                             <p className="text-stone-600 text-sm leading-relaxed">
                               {detail.etymology}
                             </p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   <div className="mt-12">
                     <h4 className="text-[10px] font-bold text-stone-400 tracking-[.2em] uppercase mb-4">Cultural Resonance</h4>
                     <div className={!isPaid ? 'blur-md select-none pointer-events-none' : ''}>
                       <p className="text-stone-600 text-lg leading-relaxed font-serif">
                         {selectedName.culturalResonance}
                       </p>
                     </div>
                   </div>

                   {!isPaid && (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 250, 250, 0.85)', backdropFilter: 'blur(8px)' }}>
                        <div className="bg-white px-10 py-12 rounded-2xl shadow-2xl border border-stone-100 text-center max-w-sm mx-6">
                           <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                             <Lock className="text-[#8f000d]" size={32} />
                           </div>
                           <h3 className="font-serif text-2xl mb-3">Unlock Full Dossier</h3>
                           <div className="mb-4">
                             <p className="text-stone-500 text-sm leading-relaxed">Unlock 3 custom name reports with your selected goal & style.</p>
                           </div>
                           <p className="text-stone-500 text-xs mb-8 leading-relaxed">Access complete etymology, cultural history, safety audits, and download certified dossiers.</p>

                           {isDevelopment ? (
              <button
                onClick={onMockPayment}
                className="w-full bg-green-600 text-white py-4 px-8 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-[0.98]"
              >
                Simulate Payment (Dev)
              </button>
            ) : (
              <button
                onClick={onRealPayment}
                className="w-full bg-[#8f000d] text-white py-4 px-8 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#b52424] transition-all active:scale-[0.98]"
              >
                Buy Now · $3.99
              </button>
            )}
                        </div>
                     </div>
                   )}
                </section>

                <section className="space-y-8">
                   <h2 className="font-serif text-3xl text-stone-900 flex items-center gap-3">
                     <Palette className="text-[#8f000d]" />
                     Aesthetic Applications
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                       { label: 'Traditional Calligraphy', img: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80' },
                       { label: 'Artisan Seal Stamp', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80' },
                       { label: 'Modern Identity', img: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&q=80' },
                     ].map((mock, i) => (
                       <div key={i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200">
                         <img 
                           src={mock.img} 
                           alt={mock.label} 
                           className={`w-full h-full object-cover transition-all duration-700 ${!isPaid ? 'blur-xl grayscale' : 'group-hover:scale-110'}`} 
                           referrerPolicy="no-referrer"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                           <span className="text-white font-medium">{mock.label}</span>
                         </div>
                         {!isPaid && (
                           <div className="absolute inset-0 flex items-center justify-center text-white/50">
                             <Lock size={24} />
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <section className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-2xl p-8 shadow-sm flex flex-col h-full relative overflow-hidden">
                   <h2 className="font-serif text-2xl text-stone-900 mb-8 flex items-center gap-3 border-b border-stone-100 pb-6">
                     <Shield className="text-[#8f000d]" size={20} />
                     Safety Audit
                   </h2>

                   <div className={`flex-grow flex flex-col gap-10 justify-center ${!isPaid ? 'blur-md select-none pointer-events-none' : ''}`}>
                      {[
                        { label: 'Tattoo Application', value: selectedName.safetyAudit.tattoo, icon: CheckCircle2, status: 'Cleared' },
                        { label: 'Business Usage', value: selectedName.safetyAudit.business, icon: CheckCircle2, status: 'Excellent' },
                        { label: 'Digital Presence', value: selectedName.safetyAudit.digital, icon: CheckCircle2, status: 'Verified' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#8f000d]">
                            <item.icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-800">{item.label}</h4>
                            <p className="text-xs font-bold text-[#8f000d] tracking-widest uppercase mt-1">{item.value}</p>
                          </div>
                        </div>
                      ))}
                   </div>

                   {isPaid && selectedName && (
                     <button
                       id="download-btn"
                       onClick={() => {
                         const reportData = {
                           name: selectedName,
                           goal: context.goal,
                           purchaseDate: new Date().toISOString().split('T')[0],
                           orderId: `ORD-${Date.now()}`
                         };
                         downloadNameImage(reportData);
                       }}
                       className="mt-12 w-full bg-[#8f000d] text-white px-8 py-5 rounded-xl font-bold flex items-center justify-center gap-4 shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                     >
                       <Download size={48} strokeWidth={2.5} />
                       <span className="text-sm">Download Certified Dossier</span>
                     </button>
                   )}
                 </section>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

// --- PDF HTML Generator (for html2pdf.js) ---

function generatePDFHTML(nameData: any): string {
  const { name, goal, purchaseDate, orderId } = nameData;

  const strokeGrids = name?.characters?.split('').map((char: string, idx: number) => `
    <div style="display: inline-block; text-align: center; margin: 20px; vertical-align: top;">
      <div style="width: 180px; height: 180px; border: 1px solid #9B2226; position: relative; background: #fff;">
        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" viewBox="0 0 100 100">
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
          <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
        </svg>
        <span style="font-size: 76px; color: #9B2226; font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: 500; line-height: 1; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0; padding: 0;">${char}</span>
      </div>
      <p style="margin-top: 10px; font-size: 14px; color: #666;">Character ${idx + 1}: ${char}</p>
    </div>
  `).join('') || '';

  const nameCharacters = name?.characters?.split('') || [];

  return `
    <div style="font-family: 'Georgia', serif; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff;">
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #9B2226; padding-bottom: 20px;">
        <h1 style="color: #9B2226; font-size: 36px; margin: 0; letter-spacing: 4px;">CINNABAR</h1>
        <p style="color: #888; font-size: 14px; margin: 10px 0 0;">Authentic Chinese Naming</p>
      </div>

      <div style="background: #fcf9f8; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Order ID</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Purchase Date</td>
            <td style="padding: 8px 0; text-align: right;">${purchaseDate || new Date().toISOString().split('T')[0]}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Primary Goal</td>
            <td style="padding: 8px 0; text-align: right; text-transform: capitalize;">${goal || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #fcf9f8 0%, #fff 100%); border-radius: 8px;">
        <h2 style="color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Your Chinese Name</h2>
        <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 20px; flex-wrap: wrap;">
          ${nameCharacters.map((char: string, idx: number) => `
            <div style="width: 180px; height: 180px; border: 1px solid #9B2226; background: #fff; position: relative;">
              <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" viewBox="0 0 100 100">
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
                <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(155,34,38,0.2)" stroke-width="0.5" />
              </svg>
              <span style="font-size: 76px; color: #9B2226; font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: 500; line-height: 1; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0; padding: 0;">${char}</span>
            </div>
          `).join('')}
        </div>
        <p style="font-size: 24px; color: #666; font-style: italic; margin-bottom: 5px;">${name?.pinyin || 'N/A'}</p>
        <p style="font-size: 18px; color: #888;">${name?.englishMeaning || 'N/A'}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Character Breakdown</h2>
        ${name?.details?.map((detail: any, i: number) => `
          <div style="background: #fcf9f8; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #9B2226;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 48px; color: #9B2226; font-family: 'SimSun', 'Noto Serif SC', serif; margin-right: 20px; line-height: 1; vertical-align: middle;">${detail.char}</span>
              <div>
                <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">${detail.pinyin}</p>
                <p style="margin: 5px 0 0; font-size: 16px; color: #333;">${detail.meaning}</p>
              </div>
            </div>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">${detail.etymology}</p>
          </div>
        `).join('') || 'N/A'}
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Cultural Resonance</h2>
        <p style="font-size: 16px; line-height: 1.8; color: #555; font-style: italic; padding: 20px; background: #fcf9f8; border-radius: 8px;">${name?.culturalResonance || 'N/A'}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Safety Audit</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px; background: #f0f9f0; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #90EE90;">
            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Tattoo</p>
            <p style="margin: 5px 0 0; font-size: 16px; color: #228B22; font-weight: bold;">${name?.safetyAudit?.tattoo || 'N/A'}</p>
          </div>
          <div style="flex: 1; min-width: 150px; background: #f0f9f0; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #90EE90;">
            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Business</p>
            <p style="margin: 5px 0 0; font-size: 16px; color: #228B22; font-weight: bold;">${name?.safetyAudit?.business || 'N/A'}</p>
          </div>
          <div style="flex: 1; min-width: 150px; background: #f0f9f0; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #90EE90;">
            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Digital</p>
            <p style="margin: 5px 0 0; font-size: 16px; color: #228B22; font-weight: bold;">${name?.safetyAudit?.digital || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Character Grid (米字格)</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">The proper stroke order for tattoo application.</p>
        ${strokeGrids}
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
        <p style="font-size: 12px; color: #888;">© 2026 CINNABAR. Wisdom in Every Stroke.</p>
        <p style="font-size: 11px; color: #aaa; margin-top: 10px;">This report is generated by CINNABAR - Authentic Chinese Naming Service.<br/>All names are verified for cultural safety and appropriateness.</p>
      </div>
    </div>
  `;
}

function downloadNameImage(nameData: any) {
  try {
    console.log('📸 Starting image generation...');
    console.log('📸 Name data:', nameData);

    if (!nameData || !nameData.name || !nameData.name.characters) {
      console.error('❌ Invalid name data:', nameData);
      alert('无效的名字数据');
      return;
    }

    const htmlContent = generatePDFHTML(nameData);
    console.log('✅ HTML content generated');

    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.zIndex = '-100';
    container.style.backgroundColor = '#F5F0E6';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.visibility = 'visible';
    container.style.display = 'block';
    document.body.appendChild(container);

    console.log('📸 Container added to DOM with offscreen rendering');

    setTimeout(() => {
      console.log('📸 Starting html2canvas capture...');
      html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F5F0E6',
        logging: true,
        allowTaint: true
      }).then((canvas: HTMLCanvasElement) => {
        console.log('✅ Canvas generated successfully');
        const dataURL = canvas.toDataURL('image/png');
        const filename = `Cinnabar_Name_${nameData.name.characters}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();

        console.log('✅ Image downloaded successfully:', filename);
        document.body.removeChild(container);
      }).catch((err: Error) => {
        console.error('❌ Image generation error:', err);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        alert('图片生成失败: ' + (err.message || 'Unknown error'));
      });
    }, 300);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    alert('下载失败: ' + (error as Error).message);
  }
}

// --- Development Mode Check ---
const isDevelopment = (import.meta as any).env?.MODE === 'development';
const DEV_TEST_EMAIL = '479361281@qq.com';

// --- Generate Browser Fingerprint for Cross-Device Recognition ---
const generateBrowserFingerprint = (): string => {
  const fingerprintData = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency || 'unknown'
  ];
  return btoa(fingerprintData.join('|'));
};

// --- Generate Unique Key for Unlock Status ---
const generateUnlockKey = (context: UserContext): string => {
  const { intent, nameVibe, stylePreference, regionalFocus, goal } = context;
  const key = `${intent.trim().toLowerCase()}-${nameVibe}-${stylePreference}-${regionalFocus}-${goal}`;
  return btoa(key);
};

// --- Check and Migrate Old Payment Data ---
const checkAndMigratePaymentData = (context: UserContext): boolean => {
  const newKey = generateUnlockKey(context);
  const fingerprint = generateBrowserFingerprint();
  
  // Check with browser fingerprint
  const newPaidTimestamp = localStorage.getItem(`cinnabar_paid_${newKey}`);
  const fingerprintPaidTimestamp = localStorage.getItem(`cinnabar_fp_paid_${fingerprint}_${newKey}`);
  
  const timestampToCheck = fingerprintPaidTimestamp || newPaidTimestamp;
  
  if (timestampToCheck) {
    if (Date.now() - parseInt(timestampToCheck) < 604800000) {
      // Sync to both formats for backward compatibility
      if (!newPaidTimestamp && fingerprintPaidTimestamp) {
        localStorage.setItem(`cinnabar_paid_${newKey}`, fingerprintPaidTimestamp);
      }
      return true;
    }
  }
  
  // Check for old format (pure name hash)
  const oldKey = btoa(context.intent.trim().toLowerCase());
  const oldPaidTimestamp = localStorage.getItem(`cinnabar_paid_${oldKey}`);
  
  if (oldPaidTimestamp && Date.now() - parseInt(oldPaidTimestamp) < 604800000) {
    // Migrate to new format
    localStorage.setItem(`cinnabar_paid_${newKey}`, oldPaidTimestamp);
    localStorage.setItem(`cinnabar_fp_paid_${fingerprint}_${newKey}`, oldPaidTimestamp);
    return true;
  }
  
  return false;
};

// --- Save Payment Data ---
const savePaymentData = (context: UserContext) => {
  const newKey = generateUnlockKey(context);
  const fingerprint = generateBrowserFingerprint();
  const timestamp = Date.now().toString();
  
  // Save in both formats for compatibility
  localStorage.setItem(`cinnabar_paid_${newKey}`, timestamp);
  localStorage.setItem(`cinnabar_fp_paid_${fingerprint}_${newKey}`, timestamp);
};

// --- Payment Success Page Component ---
function PaymentSuccessPage({ navigate, context, setSelectedName, setIsPaid, results }: any) {
  useEffect(() => {
    // Read payment data from URL params
    const searchParams = new URLSearchParams(window.location.search);
    
    let name = searchParams.get('name');
    let intent = searchParams.get('intent');
    
    // Check for PayPal custom parameter (JSON format)
    const customParam = searchParams.get('custom');
    if (customParam && !name && !intent) {
      try {
        const customData = JSON.parse(decodeURIComponent(customParam));
        name = customData.name;
        intent = customData.intent;
        console.log('✅ Parsed PayPal custom data:', customData);
      } catch (e) {
        console.error('❌ Failed to parse PayPal custom data:', e);
      }
    }

    if (name && intent) {
      // Save to localStorage with 7-day expiration (使用完整参数组合key和浏览器指纹)
      savePaymentData(context);
      
      // Set paid state
      setIsPaid(true);
      
      // Try to restore the selected name from localStorage
      const savedName = localStorage.getItem('selectedName');
      if (savedName) {
        try {
          setSelectedName(JSON.parse(savedName));
        } catch (e) {
          console.error('Failed to parse selectedName', e);
        }
      }
      
      // Redirect back to dossier page after a short delay
      setTimeout(() => {
        navigate('/dossier');
      }, 1000);
    } else {
      // If no data, redirect to home
      navigate('/');
    }
  }, [navigate, context, setSelectedName, setIsPaid]);

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <Navbar onLogoClick={() => navigate('/')} showHomeLink={true} />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <div className="text-green-600 text-4xl">✓</div>
            </div>
            <h1 className="text-3xl font-serif text-stone-900 mb-3">Payment Successful!</h1>
            <p className="text-stone-500 mb-8">Your 3 custom name reports are now unlocked!</p>
          </div>

          {results.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-2xl p-8 shadow-sm">
              <h2 className="font-serif text-2xl text-stone-900 mb-8 flex items-center gap-3 border-b border-stone-100 pb-6">
                Your 3 Names
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.map((name: NameIdentity, index: number) => (
                  <div key={index} className="border border-stone-200 rounded-xl p-6 hover:border-[#8f000d] transition-colors cursor-pointer" onClick={() => {
                    setSelectedName(name);
                    navigate('/dossier');
                  }}>
                    <div className="flex justify-center mb-4">
                      {name.characters.split('').map((char: string, i: number) => (
                        <span key={i} className="text-4xl text-[#8f000d]" style={{ fontFamily: 'Noto Serif SC, SimSun, serif', fontWeight: '500' }}>{char}</span>
                      ))}
                    </div>
                    <h3 className="text-center font-serif text-lg text-stone-900">{name.pinyin}</h3>
                    <p className="text-center text-xs text-stone-500 mt-2">{name.englishMeaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/selection')}
              className="text-[#8f000d] font-medium hover:underline"
            >
              ← Back to name selection
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [context, setContext] = useState<UserContext>({
    goal: NamingGoal.PASSION,
    intent: '',
    nameVibe: NameVibe.NEUTRAL,
    stylePreference: StylePreference.YOUNG_BOLD,
    regionalFocus: RegionalFocus.GENERAL,
  });
  const [results, setResults] = useState<NameIdentity[]>([]);
  const [selectedName, setSelectedName] = useState<NameIdentity | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 在组件初始化时从 URL state 或 localStorage 读取名字
  const location = useLocation();
  useEffect(() => {
    // 优先从 URL state 读取
    if (location.state?.name) {
      setSelectedName(location.state.name);
      return;
    }
    
    // 如果没有，从 localStorage 读取
    const savedName = localStorage.getItem('selectedName');
    if (savedName) {
      try {
        setSelectedName(JSON.parse(savedName));
      } catch (e) {
        console.error('Failed to parse selectedName from localStorage:', e);
      }
    }
  }, [location.state]);

  const handleStartNaming = () => {
    navigate('/context');
    setErrorMessage('');
  };

  const handleGetPreview = async () => {
    if (!context.intent) return;
    
    // 检查支付状态（包含旧数据迁移）
    if (checkAndMigratePaymentData(context)) {
      setIsPaid(true);
    } else {
      setIsPaid(false);
    }
    
    setLoading(true);
    setErrorMessage('');
    
    // 固定加载时长 5 秒
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let names;
    try {
      names = await generateNames(context);
    } catch (error) {
      setLoading(false);
      setErrorMessage((error as Error).message || 'Failed to generate names. Please try again.');
      return;
    }
    
    // 【新增功能代码】校验生成的名字
    let allSafe = true;
    let firstUnsafeReason = '';
    
    for (const name of names) {
      const result = isNameSafe(name, context);
      if (!result.safe) {
        allSafe = false;
        firstUnsafeReason = result.reason;
        break;
      }
    }
    
    if (!allSafe) {
      setLoading(false);
      setErrorMessage(firstUnsafeReason);
      return;
    }
    
    setResults(names);
    setLoading(false);
    setHasSubmitted(true);
    navigate('/selection');
  };

  const handleSelect = (name: NameIdentity) => {
    setSelectedName(name);
    
    // 存入 localStorage
    localStorage.setItem('selectedName', JSON.stringify(name));
    
    // 检查支付状态（包含旧数据迁移）
    if (checkAndMigratePaymentData(context)) {
      setIsPaid(true);
    } else {
      setIsPaid(false);
    }
    
    // 导航时添加 URL 参数
    navigate('/dossier', {
      state: { name: name }
    });
  };

  const handleMockPayment = () => {
    if (!selectedName) {
      console.error('❌ No name selected');
      return;
    }

    console.log('💰 Starting mock payment process...');
    
    // 写入支付状态到 localStorage（使用完整参数组合key和浏览器指纹）
    savePaymentData(context);
    
    setIsPaid(true);
  };

  const handlePayment = () => {
    if (!selectedName) {
      console.error('❌ No name selected');
      return;
    }

    console.log('💰 Starting payment process...');
    
    // 写入支付状态到 localStorage（使用完整参数组合key和浏览器指纹）
    savePaymentData(context);
    
    setIsPaid(true);
  };

  const handleRealPayment = () => {
    if (!selectedName) {
      console.error('❌ No name selected');
      return;
    }

    // PayPal Configuration from environment variables
    const paypalEmail = (import.meta as any).env?.VITE_PAYPAL_EMAIL || 'your-paypal-email@example.com';
    const paypalEnv = (import.meta as any).env?.VITE_PAYPAL_ENV || 'sandbox';
    const paypalCurrency = (import.meta as any).env?.VITE_PAYPAL_CURRENCY || 'USD';
    const paypalAmount = (import.meta as any).env?.VITE_PAYPAL_AMOUNT || '3.99';

    // Success and Cancel URLs
    const successUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/dossier`;

    // Determine PayPal base URL (sandbox or production)
    const paypalBaseUrl = paypalEnv === 'production' 
      ? 'https://www.paypal.com/cgi-bin/webscr' 
      : 'https://www.sandbox.paypal.com/cgi-bin/webscr';

    // Build PayPal checkout URL with custom data
    const checkoutUrl = new URL(paypalBaseUrl);
    
    // PayPal Standard Payment parameters
    checkoutUrl.searchParams.set('cmd', '_xclick');
    checkoutUrl.searchParams.set('business', paypalEmail);
    checkoutUrl.searchParams.set('item_name', 'CINNABAR Chinese Naming Service');
    checkoutUrl.searchParams.set('item_number', selectedName.characters);
    checkoutUrl.searchParams.set('amount', paypalAmount);
    checkoutUrl.searchParams.set('currency_code', paypalCurrency);
    checkoutUrl.searchParams.set('return', successUrl);
    checkoutUrl.searchParams.set('cancel_return', cancelUrl);
    checkoutUrl.searchParams.set('notify_url', ''); // Webhook URL can be added later if needed
    
    // Custom parameters (will be passed back in return URL)
    checkoutUrl.searchParams.set('custom', JSON.stringify({
      name: selectedName.characters,
      pinyin: selectedName.pinyin,
      intent: context.intent
    }));

    // Redirect to PayPal checkout
    window.location.href = checkoutUrl.toString();
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage onStartNaming={handleStartNaming} />} />
      <Route 
        path="/context" 
        element={
          <ContextPage 
            context={context} 
            setContext={setContext}
            onGetPreview={handleGetPreview}
            loading={loading}
            hasSubmitted={hasSubmitted}
            hasSelectedName={selectedName !== null}
            errorMessage={errorMessage}
          />
        } 
      />
      <Route 
        path="/selection" 
        element={
          <SelectionPage 
            results={results}
            context={context}
            onSelect={handleSelect}
            hasSubmitted={hasSubmitted}
            hasSelectedName={selectedName !== null}
          />
        } 
      />
      <Route
        path="/dossier"
        element={
          <DossierPage
            selectedName={selectedName}
            isPaid={isPaid}
            onPayment={handlePayment}
            onMockPayment={handleMockPayment}
            onRealPayment={handleRealPayment}
            isDevelopment={isDevelopment}
            hasSubmitted={hasSubmitted}
            hasSelectedName={selectedName !== null}
            context={context}
          />
        }
      />
      <Route
        path="/payment-success"
        element={
          <PaymentSuccessPage
            navigate={navigate}
            context={context}
            setSelectedName={setSelectedName}
            setIsPaid={setIsPaid}
            results={results}
          />
        }
      />
    </Routes>
  );
}
