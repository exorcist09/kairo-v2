import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Terminal, 
  Cpu, 
  PlayCircle, 
  Compass, 
  Sliders, 
  BookOpen, 
  Code, 
  Zap, 
  ChevronRight, 
  Check, 
  CornerDownRight,
  Database,
  RefreshCw
} from 'lucide-react';

interface DocsPageProps {
  onClose: () => void;
}

export default function DocsPage({ onClose }: DocsPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'ai' | 'formatter' | 'custom-js'>('overview');

  const nodesInfo = [
    {
      id: 'api',
      name: 'REST API Node',
      icon: Sliders,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
      desc: 'Handles downstream and upstream HTTP REST calls with fully dynamic variable token interpolation.',
      triggerPhrase: 'axios.request(payload)',
    },
    {
      id: 'ai',
      name: 'AI Branching Node',
      icon: Cpu,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      desc: 'Hooks server-side into Gemini API to evaluate branches, route outputs, or format inputs using natural language prompts.',
      triggerPhrase: 'gemini.generateContentNode()',
    },
    {
      id: 'formatter',
      name: 'Concat Formatter Node',
      icon: Code,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      desc: 'Performs rapid text sanitization, stringification of payloads, or XML-to-JSON format parsing.',
      triggerPhrase: 'JSON.stringify(input, null, 2)',
    }
  ];

  return (
    <div id="docs-page-viewport" className="fixed inset-0 z-50 bg-[#09090b] text-zinc-100 overflow-y-auto selection:bg-indigo-500/30">
      {/* Absolute grid and glowing accents */}
      <div className="absolute top-0 inset-x-0 h-[350px] bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 left-10 w-[250px] h-[250px] bg-indigo-600/10 rounded-full glow-blur pointer-events-none z-0" />
      <div className="absolute top-0 right-10 w-[200px] h-[200px] bg-cyan-600/5 rounded-full glow-blur pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black font-display text-sm shadow-md">
              K
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">Kairo UI Engine Docs</span>
              <span className="text-4xs text-zinc-500 uppercase tracking-widest font-mono">NODE-BASED EXECUTION RUNNER • SECURE SANDBOX</span>
            </div>
          </div>
          
          <button
            id="btn-close-docs"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
            Exit Docs
          </button>
        </div>

        {/* Hero introduction section */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/40 border border-indigo-900/30 rounded-full text-3xs font-mono font-bold text-indigo-400">
            <BookOpen className="w-3.5 h-3.5" />
            ENGINE EXECUTION SPECS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            How Node Execution Works
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
            Kairo runs an event-driven, atomic execution process. Every node triggers asynchronously, receives static or dynamic upstream payloads, executes its internal script securely server-side, and emits descriptive output sockets immediately.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation bar: 4 cols */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block px-3 mb-2 font-mono">
              Chapters & Nodes
            </span>
            {[
              { id: 'overview', name: 'Engine Overview', icon: Compass },
              { id: 'api', name: 'REST API Node', icon: Sliders },
              { id: 'ai', name: 'AI Branching Node', icon: Cpu },
              { id: 'formatter', name: 'Concat Formatter', icon: Code },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 border border-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TabIcon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    <span>{tab.name}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 text-zinc-650 transition-transform ${activeTab === tab.id ? 'rotate-95' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Right Explanation space: 9 cols */}
          <div className="lg:col-span-9 rounded-2xl border border-zinc-850 bg-zinc-950/40 p-6 md:p-8 space-y-8 min-h-[500px]">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">The Kairo Core Engine</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans max-w-3xl">
                    Every node connections line is mapped using mathematical routing curves. In execution mode, state propagates from left to right. When a node’s prerequisites are fully met, the node switches state from <code className="bg-zinc-900 px-1 py-0.5 rounded text-indigo-400 text-3xs font-mono">idle</code> to <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-400 text-3xs font-mono">running</code>, and finally to <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 text-3xs font-mono">success</code>.
                  </p>
                </div>

                {/* Flow Step Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-2">
                    <span className="text-indigo-400 font-mono font-bold text-3xs block uppercase">Phase I : Event Trigger</span>
                    <h4 className="text-xs font-bold text-white font-display">Prerequisites Verification</h4>
                    <p className="text-zinc-500 text-3xs leading-relaxed font-sans">
                      The execution engine parses preceding outputs. Once all targeted keys map successfully, Phase II triggers immediately.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-2">
                    <span className="text-indigo-400 font-mono font-bold text-3xs block uppercase">Phase II : Worker Process</span>
                    <h4 className="text-xs font-bold text-white font-display">Server-Side Sandbox Sandbox</h4>
                    <p className="text-zinc-500 text-3xs leading-relaxed font-sans">
                      Node properties run inside a secure server-side proxy keeping credentials tucked away as environment configurations.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-[#0c0c0e]/90 space-y-2">
                    <span className="text-indigo-400 font-mono font-bold text-3xs block uppercase">Phase III : Broadcast</span>
                    <h4 className="text-xs font-bold text-white font-display">Variable Emission</h4>
                    <p className="text-zinc-500 text-3xs leading-relaxed font-sans">
                      Output registers broadcast state to following nodes instantly, initiating the cascading execution trail.
                    </p>
                  </div>
                </div>

                {/* General Pipeline Telemetry Mock */}
                <div className="border border-zinc-900 rounded-xl bg-[#09090b] p-4 text-xs font-mono space-y-2">
                  <span className="text-zinc-500 text-3xs uppercase tracking-widest font-bold block mb-2">Live Engine Sequence Mock</span>
                  <div className="flex gap-2 text-zinc-500"><span className="text-indigo-500">[0.00s]</span> <span>Initialized engine workspace runner.</span></div>
                  <div className="flex gap-2 text-zinc-400"><span className="text-indigo-400">[0.02s]</span> <span>Executing node <strong className="text-zinc-200">REST API Call</strong> (Path: /auto-indexing).</span></div>
                  <div className="flex gap-2 text-zinc-400"><span className="text-indigo-400">[0.45s]</span> <span>REST API response received with 200 OK. Outputs: [response].</span></div>
                  <div className="flex gap-2 text-zinc-300"><span className="text-purple-400">[0.47s]</span> <span>Cascading state: Passing payload [Keys: response] directly to AI Branching Node.</span></div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded text-3xs font-mono font-semibold">REST API NODE</span>
                    <span className="text-zinc-500 text-xs">• NETWORK OPERATION</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">REST API Execution Flow</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans mt-2">
                    Designed for visual integration with microservices, search consoles, sitemap feeds, or custom server endpoints.
                  </p>
                </div>

                {/* Sub features list */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold font-display text-zinc-300 tracking-wide">Standard Run Execution</h4>
                  <div className="space-y-2.5">
                    <div className="flex gap-3 text-xs leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400 font-mono text-[10px]">1</div>
                      <div>
                        <span className="text-zinc-200 font-semibold block text-xs">Request Parameters Interpolation</span>
                        <p className="text-zinc-500 text-[11px] leading-tight mt-0.5">Static credentials from variable locker are fetched and merged into headers dynamically ($Authorization etc.)</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400 font-mono text-[10px]">2</div>
                      <div>
                        <span className="text-zinc-200 font-semibold block text-xs">Network Dispatch</span>
                        <p className="text-zinc-500 text-[11px] leading-tight mt-0.5">The engine secures cross-origin connections server-side and performs asynchronous HTTP calls without client browser blockages.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400 font-mono text-[10px]">3</div>
                      <div>
                        <span className="text-zinc-200 font-semibold block text-xs">Variables Locking & Payload Store</span>
                        <p className="text-zinc-500 text-[11px] leading-tight mt-0.5">JSON structures and response arrays register automatically into context variables, launching the next branch instantly.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code segment */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-910 p-4 font-mono text-3xs space-y-1.5 leading-relaxed">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                    <span className="text-zinc-500 font-bold uppercase">EXECUTION SNIPPET</span>
                    <span className="text-zinc-630">EXPRESS COMPATIBLE</span>
                  </div>
                  <div className="text-indigo-400">{'// 1. Fetch encrypted parameters'}</div>
                  <div className="text-zinc-200">const auth_token = kairoVault.decryptToken("api-1-auth");</div>
                  <div className="text-indigo-400">{'// 2. Perform outbound proxy call'}</div>
                  <div className="text-zinc-200">const response = await fetch("https://api.kairoui.internal/auto-indexing", {'{'}</div>
                  <div className="pl-4 text-zinc-300">method: "POST",</div>
                  <div className="pl-4 text-zinc-300">headers: {'{'} "Authorization": `Bearer ${'${auth_token}'}`, "Content-Type": "application/json" {'}'}</div>
                  <div className="text-zinc-200">{'}'});</div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-3xs font-mono font-semibold">AI BRANCHING</span>
                    <span className="text-zinc-500 text-xs">• INTELLIGENT ROUTING</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">AI Branching & Prompt Execution</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans mt-2">
                    The AI branching node leverages the state-of-the-art server-side Gemini API (such as `gemini-2.5-flash`) to parse content and dynamically branch state lines based on instructions.
                  </p>
                </div>

                {/* Features cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold">Server-Side API Call</span>
                    </div>
                    <p className="text-zinc-500 text-3xs leading-relaxed">
                      API requests bypass client exposure entirely, validating secrets values in encrypted environment stores.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold">Token-Efficient Routing</span>
                    </div>
                    <p className="text-zinc-500 text-3xs leading-relaxed">
                      Small and efficient prompts ensure execution stays in the ultra-fast sub-second interval.
                    </p>
                  </div>
                </div>

                {/* Prompt schema blueprint */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-910 p-4 font-mono text-3xs space-y-2">
                  <span className="text-zinc-500 text-3xs uppercase font-bold tracking-wider">Node System Prompt</span>
                  <div className="p-3 bg-zinc-950 rounded border border-zinc-900 text-zinc-300 leading-relaxed font-sans">
                    "Determine if the incoming payload has url variables. If yes, return the JSON attribute <code>{"{ \"branch\": \"then\" }"}</code>. If not, return <code>{"{ \"branch\": \"else\" }"}</code>."
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'formatter' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-3xs font-mono font-semibold">CONCAT FORMATTER</span>
                    <span className="text-zinc-500 text-xs">• DATA SANITIZATION</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">Concat Formatter Nodes</h3>
                  <p className="text-zinc-400 text-[13px] leading-relaxed font-sans mt-2">
                    Processes raw text stream blocks, parses XML, strings arrays, or structures dynamic parameters from adjacent node variables on the fly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 relative">
                    <h5 className="text-xs font-bold text-white mb-2 font-display">Example: XML Sitemap parser to JSON Array</h5>
                    <p className="text-zinc-500 text-3xs leading-relaxed mb-3">
                      When parsing web sitemap feeds, the raw XML format registers output string maps. The Formatter node converts this into structured JSON indices.
                    </p>
                    
                    <div className="p-3 bg-[#09090b] rounded border border-zinc-900 font-mono text-3xs space-y-1.5 text-emerald-400">
                      <div>{'// Input XML:'}</div>
                      <div className="text-zinc-400">{'<url><loc>https://kairoui.internal/pricing</loc></url>'}</div>
                      <div className="pt-2">{'// Formatter Node Parse Output:'}</div>
                      <div className="text-zinc-200">{'{\n  "url": "https://kairoui.internal/pricing"\n}'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
