import React, { useRef, useState, useEffect } from 'react';
import { WorkflowCard } from '../types';
import { ArrowLeft, ArrowRight, Zap, Settings, ShieldCheck, Database, Sliders, PlayCircle } from 'lucide-react';

export default function SmarterWorkflowSlider() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const steps: WorkflowCard[] = [
    {
      id: 1,
      tagline: "Start with an Infinite Canvas",
      title: "Design without boundaries",
      description: "Create a visual node workspace to sketch, model, and organize your system. Plan simple paths or complex multi-agent loops with fluid zoom and pan support.",
      glowColor: "from-blue-600/20 to-cyan-500/10"
    },
    {
      id: 2,
      tagline: "Drag & Drop Smart Nodes",
      title: "Add AI models & integrations",
      description: "Instantly insert LLMs (Gemini, Claude), databases, internal webhooks, email triggers, and JSON formatters. Pre-packaged utilities do the heavy lifting.",
      glowColor: "from-purple-600/20 to-pink-500/10"
    },
    {
      id: 3,
      tagline: "Inspect & Calibrate parameters",
      title: "Refine prompts and variables",
      description: "Click any node to customize prompts, adjust temperature outputs, manage headers, or secure private API keys. Changes save automatically.",
      glowColor: "from-amber-600/20 to-orange-500/10"
    },
    {
      id: 4,
      tagline: "Deploy instantly at scale",
      title: "Production-ready pipelines",
      description: "Generate highly scalable endpoints, scheduled cron jobs, or webhooks with a single click. No Kubernetes, servers, or serverless cold starts.",
      glowColor: "from-emerald-600/20 to-teal-500/10"
    },
    {
      id: 5,
      tagline: "Observe real-time telemetry",
      title: "Zero-config absolute metrics",
      description: "Monitor end-to-end execution path times, success-rate graphs, token usage costs, and full parameter payloads with built-in audit logs.",
      glowColor: "from-rose-600/20 to-red-500/10"
    }
  ];

  const checkScrollPoints = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      // scrollWidth - clientWidth is the max scroll position. Allow a buffer.
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollPoints);
      // Run once
      checkScrollPoints();
      
      // Also listen to window resize
      window.addEventListener('resize', checkScrollPoints);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScrollPoints);
      window.removeEventListener('resize', checkScrollPoints);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = 360; // Approximate card width
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      {/* Scroll controller buttons and heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Build smarter workflows
          </h3>
          <p className="text-zinc-400 mt-2 text-sm max-w-xl">
            Whether you're connecting REST services, triggering stateful AI models, or parsing complicated schemas — our visual constructor keeps layouts clean, fast, and structured.
          </p>
        </div>

        {/* Scroll action controllers */}
        <div className="flex items-center gap-2">
          <button
            id="slider-scroll-left"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              canScrollLeft 
                ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            id="slider-scroll-right"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              canScrollRight 
                ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling slider track */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-[calc(50%-140px)] sm:px-[calc(50%-160px)] md:px-[calc(50%-175px)] select-none"
      >
        {steps.map((step, index) => {
          // Select step icons dynamically
          let StepIcon = Zap;
          if (step.id === 1) StepIcon = PlayCircle;
          else if (step.id === 2) StepIcon = Sliders;
          else if (step.id === 3) StepIcon = Settings;
          else if (step.id === 4) StepIcon = ShieldCheck;
          else if (step.id === 5) StepIcon = Database;

          return (
            <div
              key={step.id}
              id={`workflow-card-${step.id}`}
              className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 snap-center rounded-2xl border border-gray-800 bg-[#0c0c0e]/90 p-6 relative group flow-root transition-all duration-300 hover:border-indigo-500/50 hover:translate-y-[-4px]"
            >
              {/* Blur gradient background glows in card on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.glowColor} opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-2xl pointer-events-none`} />

              {/* Step number indicators */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold">
                  {step.id}
                </div>
                <div className="text-zinc-600 text-3xs font-mono font-medium uppercase tracking-widest bg-zinc-950/40 px-2.5 py-1 rounded-full border border-zinc-900">
                  STEP {step.id}
                </div>
              </div>

              {/* Title & info */}
              <div className="relative z-10 space-y-3">
                <span className="text-2xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
                  {step.tagline}
                </span>
                <h4 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-indigo-200 transition-colors">
                  {step.title}
                </h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              {/* Icon at bottom */}
              <div className="mt-8 flex justify-end relative z-10">
                <div className="w-8 h-8 rounded-lg bg-zinc-900/60 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-zinc-850/80 transition-all duration-300">
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual slide dots for modern layout */}
      <div className="flex items-center gap-1.5 justify-center mt-6">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => {
              const el = scrollContainerRef.current;
              if (el) {
                el.scrollTo({
                  left: idx * 360,
                  behavior: 'smooth'
                });
              }
            }}
            className="w-8 py-2 relative group focus:outline-none cursor-pointer"
          >
            <div className={`h-1 rounded-full transition-all duration-300 ${
              // Simple check: active dot calculation approx
              (scrollContainerRef.current?.scrollLeft || 0) >= (idx * 300) - 100 &&
              (scrollContainerRef.current?.scrollLeft || 0) < ((idx + 1) * 300) - 110
              ? 'bg-indigo-500 w-8' 
              : 'bg-zinc-800 w-4 group-hover:bg-zinc-600'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
