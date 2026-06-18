import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ChevronDown, 
  Menu, 
  X, 
  Check, 
  Mail, 
  FileText, 
  Github, 
  Box, 
  GitBranch, 
  Zap, 
  Cpu, 
  BookOpen, 
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  Code,
  Linkedin,
  Cloud,
  CreditCard,
  Server,
  Triangle,
  Blocks,
  Hexagon
} from 'lucide-react';
import InteractiveCanvas from './components/InteractiveCanvas';
import SmarterWorkflowSlider from './components/SmarterWorkflowSlider';
import Pricing from './components/Pricing';
import DocsPage from './components/DocsPage';

// Type definitions for our mock templates list
interface WorkflowTemplate {
  title: string;
  category: string;
  description: string;
  nodesCount: number;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  tags: string[];
}

export default function App() {
  // Navigation & Interactive states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Authentication inputs (for interactive demo)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // Templates mock data for the side-drawer
  const templates: WorkflowTemplate[] = [
    {
      title: 'Auto-Indexing & SEO Sitemap Parser',
      category: 'Inbound Sync',
      description: 'Automatically poll raw XML sitemaps, sanitize routes, and stream indexing requests directly into search consoles.',
      nodesCount: 4,
      complexity: 'Medium',
      tags: ['Sitemaps', 'APIs', 'Sync']
    },
    {
      title: 'Self-Improving Customer Answer Engine',
      category: 'AI Pipeline',
      description: 'Route webhook payloads to the Gemini API, evaluate confidence scores, and conditionally generate Slack summaries or draft email replies.',
      nodesCount: 5,
      complexity: 'Advanced',
      tags: ['Gemini', 'Slack', 'Loops']
    },
    {
      title: 'Database Backup & Schema Telemetry',
      category: 'Infrastructure',
      description: 'Query database columns on an automated cron scheduler, compare sizes, and push anomalies directly over webhooks.',
      nodesCount: 3,
      complexity: 'Easy',
      tags: ['Cron', 'DB', 'Webhook']
    },
    {
      title: 'Dynamic Asset Processing Pipeline',
      category: 'Media Sync',
      description: 'Listen to storage buckets, auto-convert media payloads, generate summary annotations, and backup meta references.',
      nodesCount: 6,
      complexity: 'Advanced',
      tags: ['Storage', 'Media', 'Flow']
    }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSuccess(false);
    }, 4000);
  };

  const handleAuthSubmit = (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    if (!authEmail) {
      setAuthStatus('Please enter an email address.');
      return;
    }
    setAuthStatus('Authenticating securely...');
    setTimeout(() => {
      setAuthStatus(`Successfully signed up as ${authEmail}! Welcome to Kairo.`);
      setTimeout(() => {
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthStatus(null);
      }, 1500);
    }, 1200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white antialiased overflow-x-hidden relative">
      
      {/* Decorative top grid banner lines & dynamic glow */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-grid-pattern opacity-65 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full glow-blur pointer-events-none z-0 animate-pulse-ring" />
      <div className="absolute top-40 left-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full glow-blur pointer-events-none z-0" />

      {/* --- HEADER NAVBAR --- */}
      <nav className="sticky top-0 z-40 bg-[#09090b]/80 border-b border-zinc-900/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Kairo  */}
            <div className="flex items-center gap-8">
              <a 
                id="header-logo"
                href="#" 
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-1 group focus:outline-none"
              >
                <img src="/Kairo.png" alt="Kairo" className="h-6 object-contain" />
              </a>

              {/* Desktop links navigation */}
              <div className="hidden md:flex items-center gap-6">
                
                <a 
                  id="nav-link-engine"
                  href="#" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('section-demo-canvas'); }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Engine
                </a>

                <a 
                  id="nav-link-developers"
                  href="#" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('section-features'); }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Developers
                </a>

                <a 
                  id="nav-link-pricing"
                  href="#" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('section-pricing'); }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>

                <a 
                  id="nav-link-docs"
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsDocsOpen(true); }}
                  className="text-xs text-[#818cf8] hover:text-indigo-300 font-semibold transition-colors"
                >
                  Docs
                </a>

              </div>
            </div>

            {/* Right side Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                id="btn-signin-header"
                onClick={() => setIsSignInOpen(true)}
                className="text-xs text-zinc-300 hover:text-white font-medium hover:bg-zinc-900 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Sign in
              </button>
              <button 
                id="btn-signup-header"
                onClick={() => setIsSignUpOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer hover:scale-102 hover:shadow-zinc-700/10 active:scale-98"
              >
                Sign up
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile menu action */}
            <div className="md:hidden flex items-center">
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu expanded */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-[#09090b] px-4 py-4 space-y-3 shadow-2xl animate-fade-in">
            <div className="space-y-1">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); scrollToSection('section-demo-canvas'); }}
                className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Engine
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); scrollToSection('section-features'); }}
                className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Developers
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); scrollToSection('section-pricing'); }}
                className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Pricing
              </a>
              <button 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setIsDocsOpen(true); }}
                className="w-full text-left block px-3 py-2 text-sm text-indigo-400 font-semibold hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Docs
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-900 space-y-2 flex flex-col">
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsSignInOpen(true); }}
                className="w-full text-center py-2 text-sm text-zinc-300 hover:text-white font-medium hover:bg-zinc-900 rounded-lg"
              >
                Sign in
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsSignUpOpen(true); }}
                className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg"
              >
                Sign up for free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10 text-center">
        
        {/* Top green status pilot/pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded-full mb-6 max-w-max hover:bg-emerald-900/20 transition-colors animate-pulse-ring">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block block" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">JOIN THE LIST</span>
          <span className="text-zinc-500 text-[10px]">•</span>
          <span className="text-zinc-300 text-[10px] font-medium">Be the first to build the future</span>
        </div>

        {/* Dynamic Display Typography Headings */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.1]">
            Build Smarter Workflows <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg font-sans max-w-2xl mx-auto leading-relaxed mt-4">
            Visually connect your data, tools, and AI models in a seamless, node-based interface. Customize components, execute pipelines, and trace parameters under one hood.
          </p>
        </div>

        {/* CTA primary targets */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
          <button 
            id="hero-cta-main"
            onClick={() => setIsSignUpOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            Start free account
            <ArrowUpRight className="w-4 h-4" />
          </button>
          
          <button 
            id="hero-cta-demo"
            onClick={() => scrollToSection('section-demo-canvas')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-semibold text-sm rounded-lg shadow-md transition-all cursor-pointer"
          >
            Try Demo Now!
          </button>
        </div>

        {/* Embedded Interactive Canvas Widget */}
        <div id="section-demo-canvas" className="w-full max-w-5xl mt-16 relative">
          {/* Subtle frame glow underneath */}
          <div className="absolute inset-10 bg-indigo-500/5 glow-blur rounded-full pointer-events-none -y-5" />
          
          <InteractiveCanvas />
        </div>

      </section>

      {/* --- MORE THAN AUTOMATION ACCENT STATEMENT ---- */}
      <section className="py-20 md:py-28 px-4 bg-zinc-950/20  border-zinc-900/60 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-2xs font-extrabold text-indigo-400 uppercase tracking-widest font-mono">
            More Than Automation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display leading-tight max-w-3xl mx-auto">
            Our node-based system lets you build exactly what you need, when you need it, with every connection as intuitive as your own thought process.
          </h2>
          {/* <p className="text-zinc-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            By avoiding complicated syntax blocks, Kairo models tasks into distinct atomic parameters. Drag and drop coordinates, bind schema elements, and query securely without code layers.
          </p> */}
        </div>
      </section>

      {/* --- TRUSTED BY OUTLINES --- */}
      <section className="py-10 border-y border-zinc-900/60 bg-[#0b0b0d]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest tracking-[0.2em] mb-7">
            Build with
          </p>
          
          {/* Typographic representations of trusted tech brands to avoid breaking image assets */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-zinc-300 hover:text-cyan-400 transition-colors">
              <Hexagon className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">React</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
              <Triangle className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">Next.js</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-green-500 transition-colors">
              <Server className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">Node.js</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-blue-400 transition-colors">
              <Database className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-red-500 transition-colors">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">Redis</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 transition-colors">
              <Blocks className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">BullMQ</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-orange-400 transition-colors">
              <Cloud className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">AWS</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-blue-500 transition-colors">
              <Box className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">Docker</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 hover:text-indigo-400 transition-colors">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm font-bold font-display tracking-wider">Payment Gateways</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HORIZONTAL WORKFLOW CARDS SLIDER --- */}
      <section id="section-features" className="py-20 md:py-28 px-4 max-w-7xl mx-auto relative z-10">
        <SmarterWorkflowSlider />
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="section-pricing" className="py-20 md:py-28 px-4 bg-[#0a0a0c]/80 border-t border-zinc-900/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Pricing />
        </div>
      </section>

      {/* --- STELLAR DYNAMIC CTA HERO FOOTER PANEL --- */}
      <section className="py-24 px-4 max-w-5xl mx-auto relative z-10 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none rounded-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/10 rounded-full glow-blur pointer-events-none" />

        <div className="relative z-10 p-8 md:p-14 space-y-6 select-none">
          {/* Subtle horizontal gradient separator line like in the hero section */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            ZERO LOCK-IN OR HEAVY SERVERS
          </div>
          
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.15] max-w-3xl mx-auto">
            Stay ahead with the latest <br /> in AI automation.
          </h3>
          
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Launch your first workflow today—no setup, no code, no limits. Map serverless pipelines using Gemini models and REST parameters with complete client autonomy.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <button 
              id="cta-footer-start"
              onClick={() => setIsSignUpOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all hover:scale-102 active:scale-98 shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              Get Started for Free
            </button>
            
          </div>
        </div>
      </section>

      {/* --- FOOTER MAIN --- */}
      <footer className="border-t border-zinc-900/80 bg-[#09090b] relative z-10 pt-16 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 pb-12 border-b border-zinc-900">
            
            {/* Brand Logo & Statement column */}
            <div className="md:col-span-2 space-y-4">
              <a 
                id="footer-logo"
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-1 group focus:outline-none"
              >
                <img src="/Kairo.png" alt="Kairo" className="h-10 object-contain" />
              </a>
              
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                Kairo empowers teams to design, automate, and orchestrate powerful AI-driven processes—all in one intuitive platform. Map variables visually and deploy instantly.
              </p>
            </div>

            <div className="space-y-3.5 col-span-1">
              <h5 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Kairo is a secure sandbox visualization layer."); }} className="text-zinc-500 hover:text-white transition-colors text-xs leading-none">About</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Read our engineering blog about high-frequency runners."); }} className="text-zinc-500 hover:text-white transition-colors text-xs leading-none">Blog</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Join the Kairo team!"); }} className="text-zinc-500 hover:text-white transition-colors text-xs leading-none">Careers</a></li>
              </ul>
            </div>

            <div className="space-y-3.5 col-span-1">
              <h5 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Support</h5>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Our FAQ contains answers about self-host setups."); }} className="text-zinc-500 hover:text-white transition-colors text-xs">FAQ Docs</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Contact support via email at support@kairo.internal"); }} className="text-zinc-500 hover:text-white transition-colors text-xs">Contact Us</a></li>
                <li className="pt-2 flex items-center gap-2.5">
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8 h-8 rounded-lg bg-zinc-900  text-zinc-450 hover:text-white flex items-center justify-center transition-colors hover:bg-zinc-850 shadow-sm"
                    title="Linkedin"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8 h-8 rounded-lg bg-zinc-900  text-zinc-450 hover:text-white flex items-center justify-center transition-colors hover:bg-zinc-850 shadow-sm"
                    title="Github"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom copyright line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-8 gap-4">
            <span className="text-zinc-650 text-xs font-mono select-none">
              © COPYRIGHT 2026 KAIRO  • ALL RIGHTS RESERVED
            </span>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-650">
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Local states persist locally on your sandbox."); }} className="hover:text-zinc-300">Privacy Policy</a>
              <span>•</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Sandboxed visual nodes remain subject to workspace rules."); }} className="hover:text-zinc-300">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Huge aesthetic branding outline watermark at the absolute bottom margin */}
        <div className="absolute bottom-4 inset-x-0 overflow-hidden select-none pointer-events-none text-center">
          <span className="font-display font-extrabold text-[12vw] tracking-tighter text-zinc-950 block leading-none opacity-40 select-none">
            Kairo
          </span>
        </div>
      </footer>


      {/* =========================================================================
                                INTERACTIVE DIALOG MODALS 
         ========================================================================= */}

      {/* 1. SIGN IN MODAL */}
      {isSignInOpen && (
        <div id="modal-signin" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0d0f] border border-zinc-850 p-6 rounded-2xl shadow-2xl space-y-4">
            <button 
              onClick={() => { setIsSignInOpen(false); setAuthStatus(null); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-zinc-900 p-1.5 rounded-lg transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-3xs font-bold text-blue-500 uppercase tracking-widest font-mono">
                SECURE CONSOLE ENTRY
              </span>
              <h4 className="text-lg font-bold text-white font-display">Sign In to Kairo </h4>
              <p className="text-zinc-500 text-xs">Enter your sandbox keys to orchestrate current nodes.</p>
            </div>

            {authStatus && (
              <div className="p-3 bg-blue-950/40 border border-blue-900/30 text-blue-300 text-2xs rounded-lg mt-2">
                {authStatus}
              </div>
            )}

            <form onSubmit={(e) => handleAuthSubmit(e, 'signin')} className="space-y-3.5 pt-2">
              <div>
                <label className="text-3xs font-bold text-zinc-400 uppercase block mb-1">Keys Holder Email</label>
                <input 
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-zinc-400 uppercase block mb-1">Private Auth Key</label>
                <input 
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Access Secure Instance
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] text-zinc-500">
              New to Kairo?{' '}
              <button onClick={() => { setIsSignInOpen(false); setIsSignUpOpen(true); }} className="text-indigo-400 underline hover:text-indigo-300 focus:outline-none">
                Spawn key account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SIGN UP MODAL */}
      {isSignUpOpen && (
        <div id="modal-signup" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0d0f] border border-zinc-850 p-6 rounded-2xl shadow-2xl space-y-4">
            <button 
              onClick={() => { setIsSignUpOpen(false); setAuthStatus(null); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-zinc-900 p-1.5 rounded-lg transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-3xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                CONSTRUCT NEW SECURE CREDENTIAL
              </span>
              <h4 className="text-lg font-bold text-white font-display">Spawn a Kairo Sandbox</h4>
              <p className="text-zinc-500 text-xs">Instantly configure up to 3 high-performance pipelines for free.</p>
            </div>

            {authStatus && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-2xs rounded-lg mt-2 font-medium">
                {authStatus}
              </div>
            )}

            <form onSubmit={(e) => handleAuthSubmit(e, 'signup')} className="space-y-3.5 pt-2">
              <div>
                <label className="text-3xs font-bold text-zinc-400 uppercase block mb-1 font-mono">Developers Email</label>
                <input 
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-zinc-400 uppercase block mb-1 font-mono">Pipeline Master Key</label>
                <input 
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-start gap-2 text-3xs text-zinc-500 leading-relaxed">
                <input type="checkbox" required className="mt-0.5" />
                <span>I agree to retain all private key configurations locally and abide by node safety policies.</span>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Assemble Workspace free
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] text-zinc-500">
              Already possess credentials?{' '}
              <button onClick={() => { setIsSignUpOpen(false); setIsSignInOpen(true); }} className="text-indigo-400 underline hover:text-indigo-300 focus:outline-none">
                Decrypt entry path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEMPLATE BROWSER SLIDE-OVER DRAWER */}
      {isTemplatesOpen && (
        <div id="drawer-templates" className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-[#0b0c0d] border-l border-zinc-850 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in relative">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div className="space-y-1">
                  <span className="text-4xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
                    KAIRO BLUEPRINT DIRECTORY
                  </span>
                  <h4 className="text-md font-bold text-white font-display">Workflow Blueprints</h4>
                </div>
                <button 
                  onClick={() => setIsTemplatesOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Template list */}
              <div className="mt-6 space-y-4">
                <p className="text-zinc-500 text-xs leading-relaxed mb-4">
                  Deploy pre-configured schemas in seconds. Choose any Blueprint structure below to load a preset path instantly:
                </p>

                {templates.map((tpl, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      alert(`Successfully imported the blueprint: "${tpl.title}". Pre-configured API nodes and variables loaded on sandbox.`);
                      setIsTemplatesOpen(false);
                    }}
                    className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-2 py-0.5 bg-indigo-950/40 text-[9px] font-mono text-indigo-400 border border-indigo-900/30 rounded-md">
                        {tpl.category}
                      </span>
                      <span className="text-4xs font-mono text-zinc-500">
                        {tpl.nodesCount} Nodes • {tpl.complexity}
                      </span>
                    </div>

                    <h5 className="font-bold text-zinc-200 text-xs pl-0.5 group-hover:text-indigo-100 transition-colors">
                      {tpl.title}
                    </h5>
                    
                    <p className="text-zinc-500 text-3xs leading-relaxed mt-1.5 pl-0.5">
                      {tpl.description}
                    </p>

                    <div className="flex gap-1.5 mt-3 pl-0.5">
                      {tpl.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-4xs font-sans text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl mt-6">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">Custom Blueprints</span>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Want to publish a blueprint structure? Build and test your model pathways inside the editor and submit credentials with an open tag.
              </p>
            </div>

          </div>
        </div>
      )}

      {isDocsOpen && (
        <DocsPage onClose={() => setIsDocsOpen(false)} />
      )}

    </div>
  );
}
