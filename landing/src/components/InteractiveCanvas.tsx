import React, { useState, useRef, useEffect } from 'react';
import { NodeItem, NodeConnection } from '../types';
import { 
  Play, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Database, 
  Cpu, 
  GitFork, 
  Terminal, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

export default function InteractiveCanvas() {
  const [nodes, setNodes] = useState<NodeItem[]>([
    {
      id: 'api-1',
      title: 'Rest API Call',
      type: 'api-call',
      method: 'POST',
      path: '/auto-indexing',
      status: 'idle',
      x: 40,
      y: 80,
      inputs: [],
      outputs: ['response'],
      properties: {
        'ContentType': 'application/json',
        'Authorization': 'Bearer k_live_...'
      }
    },
    {
      id: 'branch-1',
      title: 'AI Branching',
      type: 'branch',
      status: 'idle',
      x: 320,
      y: 110,
      inputs: ['payload'],
      outputs: ['then', 'else'],
      properties: {
        'Condition': 'contains_urls == true',
        'Model': 'gemini-2.5-flash'
      }
    },
    {
      id: 'output-then',
      title: 'Concat Then Flow',
      type: 'formatter',
      status: 'idle',
      x: 580,
      y: 20,
      inputs: ['input'],
      outputs: ['output'],
      properties: {
        'Key': 'url',
        'Format': 'JSON Stringify',
        'Sanitize': 'Enabled'
      }
    },
    {
      id: 'output-else',
      title: 'Concat Else Flow',
      type: 'formatter',
      status: 'idle',
      x: 580,
      y: 220,
      inputs: ['input'],
      outputs: ['output'],
      properties: {
        'Key': 'sitemap',
        'Format': 'XML Parse',
        'Fallback': 'cache_url'
      }
    }
  ]);

  const [connections] = useState<NodeConnection[]>([
    { id: 'c1', fromId: 'api-1', toId: 'branch-1', fromOutput: 'response', toInput: 'payload' },
    { id: 'c2', fromId: 'branch-1', toId: 'output-then', fromOutput: 'then', toInput: 'input' },
    { id: 'c3', fromId: 'branch-1', toId: 'output-else', fromOutput: 'else', toInput: 'input' }
  ]);

  const [simulating, setSimulating] = useState(false);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Trigger the flow simulation
  const startSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    
    // Reset all nodes
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setActiveConnectionId(null);

    // Step 1: Rest API Node Runs
    setNodes(prev => prev.map(n => n.id === 'api-1' ? { ...n, status: 'running' } : n));
    await new Promise(resolve => setTimeout(resolve, 1200));
    setNodes(prev => prev.map(n => n.id === 'api-1' ? { ...n, status: 'success' } : n));
    setActiveConnectionId('c1');

    // Step 2: Branch Node Runs
    await new Promise(resolve => setTimeout(resolve, 800));
    setNodes(prev => prev.map(n => n.id === 'branch-1' ? { ...n, status: 'running' } : n));
    await new Promise(resolve => setTimeout(resolve, 1400));
    setNodes(prev => prev.map(n => n.id === 'branch-1' ? { ...n, status: 'success' } : n));
    
    // Choose which path to light up
    // In this simulation, let's pulse both dynamically, or alternate!
    const decision = Math.random() > 0.5 ? 'then' : 'else';
    
    if (decision === 'then') {
      setActiveConnectionId('c2');
      await new Promise(resolve => setTimeout(resolve, 800));
      setNodes(prev => prev.map(n => n.id === 'output-then' ? { ...n, status: 'running' } : n));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNodes(prev => prev.map(n => n.id === 'output-then' ? { ...n, status: 'success' } : n));
    } else {
      setActiveConnectionId('c3');
      await new Promise(resolve => setTimeout(resolve, 800));
      setNodes(prev => prev.map(n => n.id === 'output-else' ? { ...n, status: 'running' } : n));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNodes(prev => prev.map(n => n.id === 'output-else' ? { ...n, status: 'success' } : n));
    }

    await new Promise(resolve => setTimeout(resolve, 1200));
    setSimulating(false);
  };

  const resetCanvas = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setActiveConnectionId(null);
    setSimulating(false);
  };

  // Node Drag and Drop handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      setDragOffset({
        x: clientX - node.x,
        y: clientY - node.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    e.preventDefault();

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (canvasBounds) {
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Keep inside bounds roughly
      newX = Math.max(10, Math.min(newX, canvasBounds.width - 240));
      newY = Math.max(10, Math.min(newY, canvasBounds.height - 180));

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Add a new node to make the canvas truly amazing and interactive!
  const addNode = () => {
    const types: Array<'ai-prompt' | 'webhook'> = ['ai-prompt', 'webhook'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const id = `node-${Date.now().toString().slice(-4)}`;
    
    const newNode: NodeItem = chosenType === 'ai-prompt' ? {
      id,
      title: 'Gemini Agent Node',
      type: 'ai-prompt',
      status: 'idle',
      x: 100 + Math.random() * 200,
      y: 150 + Math.random() * 80,
      inputs: ['prompt'],
      outputs: ['result'],
      properties: {
        'System Instruction': 'Summarize user text with brevity',
        'Temperature': '0.3'
      }
    } : {
      id,
      title: 'Webhook Trigger',
      type: 'webhook',
      status: 'idle',
      x: 100 + Math.random() * 200,
      y: 150 + Math.random() * 80,
      inputs: [],
      outputs: ['body'],
      properties: {
        'Endpoint': `/v1/hooks/${id}`,
        'Format': 'Octet-Stream'
      }
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const deleteNode = (id: string) => {
    if (['api-1', 'branch-1', 'output-then', 'output-else'].includes(id)) {
      // Don't delete fixed structural nodes for smooth showcase, but allow deleting user created ones!
      alert("This core demo node is required for initial simulation paths, but you can delete custom ones!");
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  useEffect(() => {
    if (draggingNodeId) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingNodeId]);

  // Helper to calculate SVG path coordinates
  const calculatePath = (fromNode: NodeItem, toNode: NodeItem, fromPort: string | undefined, toPort: string | undefined) => {
    // Approx ports offset
    // Node size is roughly w=180px, h=140px on average
    const nodeWidth = 220;
    const nodeHeight = 130;

    let startX = fromNode.x + nodeWidth;
    let startY = fromNode.y + 60; // middle-ish

    if (fromPort === 'then') {
      startY = fromNode.y + 40;
    } else if (fromPort === 'else') {
      startY = fromNode.y + 80;
    }

    let endX = toNode.x;
    let endY = toNode.y + 60;

    // Cubic Bezier curve points for smooth node lines
    const controlPoint1 = startX + 60;
    const controlPoint2 = endX - 60;

    return `M ${startX} ${startY} C ${controlPoint1} ${startY}, ${controlPoint2} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="w-full relative bg-dark-bg/40 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Canvas top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-950/80 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${simulating ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${simulating ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-xs font-mono text-zinc-400">STATUS: {simulating ? 'SIMULATION RUNNING' : 'WORKSPACE READY'}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            id="btn-run-simulation"
            onClick={startSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-50 duration-200"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            Run Simulation
          </button>
          
          <button 
            id="btn-reset-canvas"
            onClick={resetCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset State
          </button>

          <button 
            id="btn-add-node"
            onClick={addNode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-950 text-indigo-300 border border-indigo-800/40 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Node
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row-reverse h-[460px] relative">
        {/* Workspace Canvas (Draggable Area) */}
        <div 
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          className="flex-1 relative overflow-hidden bg-zinc-950 bg-dot-pattern h-full select-none"
        >
          {/* Dynamic SVG links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {connections.map((conn) => {
              const fromN = nodes.find(n => n.id === conn.fromId);
              const toN = nodes.find(n => n.id === conn.toId);
              if (!fromN || !toN) return null;

              const isFlowing = activeConnectionId === conn.id;

              return (
                <g key={conn.id}>
                  {/* Backdrop shadow line */}
                  <path
                    d={calculatePath(fromN, toN, conn.fromOutput, conn.toInput)}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="5"
                  />
                  {/* Static link line */}
                  <path
                    d={calculatePath(fromN, toN, conn.fromOutput, conn.toInput)}
                    fill="none"
                    stroke={isFlowing ? '#6366f1' : '#27272a'}
                    strokeWidth="2.5"
                    transition="stroke 0.3s"
                    className={isFlowing ? 'animate-flow-dash' : ''}
                  />
                  {/* Glowing active animation */}
                  {isFlowing && (
                    <path
                      d={calculatePath(fromN, toN, conn.fromOutput, conn.toInput)}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.3"
                      className="blur-sm"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Draggable Cards */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            
            // Icon representing node
            let NodeIcon = Cpu;
            if (node.type === 'api-call') NodeIcon = Terminal;
            else if (node.type === 'branch') NodeIcon = GitFork;
            else if (node.type === 'formatter') NodeIcon = Database;

            return (
              <div
                key={node.id}
                id={`node-card-${node.id}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  touchAction: 'none'
                }}
                className={`absolute w-[210px] bg-zinc-900 border ${
                  isSelected ? 'border-indigo-500 shadow-indigo-500/20' : 'border-zinc-800'
                } rounded-xl shadow-xl z-20 overflow-hidden cursor-grab active:cursor-grabbing transition-shadow`}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                {/* Node header */}
                <div className={`px-3 py-2 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/60 ${
                  node.status === 'running' ? 'bg-indigo-950/30' : ''
                }`}>
                  <div className="flex items-center gap-1.5">
                    <NodeIcon className={`w-3.5 h-3.5 ${
                      node.status === 'running' ? 'text-cyan-400 animate-spin' : 
                      node.status === 'success' ? 'text-emerald-400' : 'text-zinc-400'
                    }`} />
                    <span className="text-2xs font-bold text-zinc-200 tracking-wider font-display uppercase">{node.title}</span>
                  </div>
                  
                  {/* Status indicator badge */}
                  <div className="flex items-center">
                    {node.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                    ) : node.status === 'running' ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    )}
                  </div>
                </div>

                {/* Node parameters */}
                <div className="p-3 space-y-1.5">
                  {node.method && (
                    <div className="flex items-center justify-between text-3xs font-mono">
                      <span className="text-zinc-500">METHOD</span>
                      <span className="px-1.5 py-0.5 bg-sky-950/70 text-sky-400 border border-sky-800/30 rounded font-semibold">{node.method}</span>
                    </div>
                  )}
                  {node.path && (
                    <div className="flex items-center justify-between text-3xs font-mono">
                      <span className="text-zinc-500">PATH</span>
                      <span className="text-zinc-300 font-medium truncate max-w-[120px]">{node.path}</span>
                    </div>
                  )}

                  {node.properties && Object.entries(node.properties).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-[10px] font-mono leading-tight">
                      <span className="text-zinc-500">{key}</span>
                      <span className="text-zinc-300 truncate max-w-[120px]" title={value}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Node outputs & inputs indicator lines for layout style */}
                <div className="px-3 py-1 bg-zinc-950/20 border-t border-zinc-800/30 flex items-center justify-between">
                  <div className="flex gap-1">
                    {node.inputs?.map(input => (
                      <span key={input} className="text-4xs font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-1 rounded">
                        ▸ {input}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {node.outputs?.map(output => (
                      <span key={output} className="text-4xs font-mono text-indigo-400/80 bg-indigo-950/30 border border-indigo-900/30 px-1 rounded">
                        {output} ▸
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Parameter Detail sidebar inside the simulator */}
        <div className="w-full lg:w-[260px] border-t lg:border-t-0 lg:border-r border-zinc-800 bg-zinc-900/40 p-4 space-y-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 tracking-wider uppercase font-display border-b border-zinc-800/80 pb-2">
              Inspector Config
            </h4>
            
            {selectedNodeId ? (
              (() => {
                const node = nodes.find(n => n.id === selectedNodeId);
                if (!node) return null;
                const canDelete = !['api-1', 'branch-1', 'output-then', 'output-else'].includes(node.id);
                
                return (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1">Node Title</label>
                      <input 
                        type="text" 
                        value={node.title} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, title: val } : n));
                        }}
                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {node.method && (
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1">HTTP Method</label>
                        <select 
                          value={node.method} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, method: val } : n));
                          }}
                          className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                    )}

                    {node.path && (
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1">Route Path</label>
                        <input 
                          type="text" 
                          value={node.path} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, path: val } : n));
                          }}
                          className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {node.properties && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">Parameters</label>
                        {Object.entries(node.properties).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-[9px] font-mono text-zinc-600 block mb-0.5">{key}</span>
                            <input 
                              type="text" 
                              value={value} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setNodes(prev => prev.map(n => n.id === selectedNodeId ? { 
                                  ...n, 
                                  properties: {
                                    ...n.properties,
                                    [key]: val
                                  } 
                                } : n));
                              }}
                              className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 mt-2 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-950 rounded text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Node
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-zinc-500 text-xs mt-6 leading-relaxed text-center py-8 border border-dashed border-zinc-800/40 rounded-xl">
                Click any node on the workspace to inspect and edit its dynamic properties in real-time.
              </div>
            )}
          </div>

          <div className="bg-zinc-950/40 border border-zinc-800/60 p-3 rounded-lg">
            <h5 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-1">Canvas Instructions</h5>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Nodes are draggable. Drag them to arrange. Click "Run Simulation" to execute the active AI workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
