"use client";

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { nodeComponents } from "./node-components";
import "@xyflow/react/dist/style.css";
import { WorkflowNodeData } from "./CustomNode";
import { NodePaletteItem } from "./sidebar/EditorSidebar";
import { NodeType } from "@/utils/constants";
import { getCredentials } from "@/api/credentials.api";
import { getSocket } from "@/lib/socket";
import {
  X,
  Trash,
  FloppyDiskBackIcon,
  CaretDown,
  Key,
} from "@phosphor-icons/react";

interface EditorCanvasProps {
  workflowId: string;
  workflowStatus?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  isExecuting: boolean;
  onExecutionComplete?: () => void;
  externalAddNodeRef?: React.MutableRefObject<
    ((item: NodePaletteItem) => void) | null
  >;
  externalSaveRef?: React.MutableRefObject<
    (() => { nodes: any[]; connections: any[] }) | null
  >;
}

const CLAUDE_MODELS = [
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Recommended)" },
  { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (Fastest)" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Omni Recommended)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cheap)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

const GEMINI_MODELS = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast)" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Reasoning)" },
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)" },
];

function InnerEditorCanvas({
  workflowId,
  workflowStatus = "DRAFT",
  initialNodes = [],
  initialEdges = [],
  isExecuting,
  onExecutionComplete,
  externalAddNodeRef,
  externalSaveRef,
}: EditorCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const isCompleted = workflowStatus.toUpperCase() === "COMPLETED";

  const mapNodeData = useCallback(
    (n: Node): Node => {
      const d = (n.data || {}) as unknown as WorkflowNodeData;
      return {
        ...n,
        data: {
          ...d,
          title: d.title || (n as any).name || n.type || "Node",
          type: d.type || (n.type as NodeType),
          status: isCompleted ? "success" : (d.status || "idle"),
          isCompletedWorkflow: isCompleted,
          prompt: d.prompt ?? d.textValue ?? "",
          textValue: d.textValue ?? d.prompt ?? "",
          urlForm: d.urlForm || d.browserUrl || "",
        },
      };
    },
    [isCompleted],
  );

  const [nodes, setNodes] = useState<Node[]>(() => initialNodes.map(mapNodeData));
  const [edges, setEdges] = useState<Edge[]>(() =>
    initialEdges.map((e) => ({
      ...e,
      sourceHandle: e.sourceHandle || "main",
      targetHandle: e.targetHandle || "main",
      animated: isExecuting,
      style: { stroke: isExecuting ? "#2563EB" : "#94A3B8", strokeWidth: 2 },
    })),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [credentials, setCredentials] = useState<Array<{ id: string; type: string; name: string }>>([]);

  // Fetch available credentials
  useEffect(() => {
    let mounted = true;
    getCredentials()
      .then((res) => {
        if (mounted && res?.credentials) {
          setCredentials(res.credentials);
        }
      })
      .catch((err) => {
        console.warn("Failed to load user credentials for editor:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync initial nodes/edges when loaded
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes((current) => {
        if (current.length === 0) {
          return initialNodes.map(mapNodeData);
        }
        return current;
      });
    }
  }, [initialNodes, mapNodeData]);

  useEffect(() => {
    if (initialEdges.length > 0) {
      setEdges((current) => {
        if (current.length === 0) {
          return initialEdges.map((e) => ({
            ...e,
            sourceHandle: e.sourceHandle || "main",
            targetHandle: e.targetHandle || "main",
            animated: isExecuting,
            style: { stroke: isExecuting ? "#2563EB" : "#94A3B8", strokeWidth: 2 },
          }));
        }
        return current;
      });
    }
  }, [initialEdges, isExecuting]);

  // Edges style: solid when connected, dotted running ONLY while isExecuting
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: isExecuting,
        style: { stroke: isExecuting ? "#2563EB" : "#94A3B8", strokeWidth: 2 },
      })),
    );
  }, [isExecuting]);

  // Real-time Socket.io Execution Feedback
  useEffect(() => {
    if (!workflowId) return;
    const socket = getSocket();

    // Join room for this workflow
    socket.emit("join:workflow", workflowId);

    const handleNodeStart = (data: { nodeId: string }) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === data.nodeId
            ? { ...n, data: { ...n.data, status: "running" } }
            : n,
        ),
      );
    };

    const handleNodeSuccess = (data: { nodeId: string; result: any }) => {
      setNodes((nds) => {
        return nds.map((n) => {
          if (n.id === data.nodeId) {
            const isOutputNode =
              n.type === NodeType.OUTPUT ||
              (n.data as any)?.iconName === "output" ||
              (n.data as any)?.iconName === "diamond";

            return {
              ...n,
              data: {
                ...n.data,
                status: "success",
                ...(isOutputNode && { outputData: data.result }),
              },
            };
          }

          // If a connected downstream output node exists, feed it with previous node result
          const isDownstreamOutput =
            n.type === NodeType.OUTPUT ||
            (n.data as any)?.iconName === "output" ||
            (n.data as any)?.iconName === "diamond";

          return n;
        });
      });
    };

    const handleNodeError = (data: { nodeId: string; error: string }) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === data.nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: "error",
                  error: data.error,
                },
              }
            : n,
        ),
      );
    };

    const handleExecutionComplete = (data: { results: Record<string, any> }) => {
      setNodes((nds) =>
        nds.map((n) => {
          const isOutputNode =
            n.type === NodeType.OUTPUT ||
            (n.data as any)?.iconName === "output" ||
            (n.data as any)?.iconName === "diamond";

          // If this is an output node, get result from incoming node or output node id
          let finalOutput = n.data?.outputData;
          if (isOutputNode && data?.results) {
            if (data.results[n.id] !== undefined) {
              finalOutput = data.results[n.id];
            } else {
              // Find edge connecting to this output node
              const incoming = edges.find((e) => e.target === n.id);
              if (incoming && data.results[incoming.source] !== undefined) {
                finalOutput = data.results[incoming.source];
              } else {
                const resultKeys = Object.keys(data.results);
                if (resultKeys.length > 0) {
                  finalOutput = data.results[resultKeys[resultKeys.length - 1]];
                }
              }
            }
          }

          return {
            ...n,
            data: {
              ...n.data,
              status: n.data.status === "error" ? "error" : "success",
              ...(isOutputNode && finalOutput !== undefined && { outputData: finalOutput }),
            },
          };
        }),
      );
      onExecutionComplete?.();
    };

    const handleExecutionFailed = () => {
      onExecutionComplete?.();
    };

    socket.on("workflow:node:start", handleNodeStart);
    socket.on("workflow:node:success", handleNodeSuccess);
    socket.on("workflow:node:error", handleNodeError);
    socket.on("workflow:execution:complete", handleExecutionComplete);
    socket.on("workflow:execution:failed", handleExecutionFailed);

    return () => {
      socket.off("workflow:node:start", handleNodeStart);
      socket.off("workflow:node:success", handleNodeSuccess);
      socket.off("workflow:node:error", handleNodeError);
      socket.off("workflow:execution:complete", handleExecutionComplete);
      socket.off("workflow:execution:failed", handleExecutionFailed);
      socket.emit("leave:workflow", workflowId);
    };
  }, [workflowId, edges, onExecutionComplete]);

  // Derive selectedNode
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const selectedNodeData = selectedNode
    ? (selectedNode.data as unknown as WorkflowNodeData)
    : null;

  // Node deletions
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
        setIsDirty(false);
      }
    },
    [selectedNodeId],
  );

  // Open settings drawer
  const handleOpenSettings = useCallback((id: string) => {
    setSelectedNodeId(id);
    setIsDirty(false);
  }, []);

  // Text change callback from node
  const handleTextChange = useCallback(
    (id: string, text: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  prompt: text,
                  textValue: text,
                },
              }
            : n,
        ),
      );
      if (selectedNodeId === id) {
        setIsDirty(true);
      }
    },
    [selectedNodeId],
  );

  // Method change callback from node
  const handleMethodChange = useCallback(
    (id: string, method: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  method,
                  httpMethod: method,
                },
              }
            : n,
        ),
      );
      if (selectedNodeId === id) {
        setIsDirty(true);
      }
    },
    [selectedNodeId],
  );

  // Save feedback in drawer
  const handleSaveDialog = useCallback(() => {
    setIsSaved(true);
    setIsDirty(false);
    setTimeout(() => setIsSaved(false), 1500);
  }, []);

  // Update selected node data
  const updateSelectedNodeData = useCallback(
    (updates: Partial<WorkflowNodeData>) => {
      if (!selectedNodeId) return;
      setIsDirty(true);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId
            ? { ...n, data: { ...n.data, ...updates } }
            : n,
        ),
      );
    },
    [selectedNodeId],
  );

  // Serialization for saving workflow
  useEffect(() => {
    if (externalSaveRef) {
      externalSaveRef.current = () => {
        const backendNodes = nodes.map((node) => {
          const data = (node.data || {}) as unknown as WorkflowNodeData;
          return {
            id: node.id,
            name: data.title || node.type || "Node",
            type: (node.type || NodeType.OUTPUT) as NodeType,
            position: node.position,
            data: {
              title: data.title || node.type || "Node",
              outputData: data.outputData,
              status: data.status || "idle",
              prompt: data.prompt ?? data.textValue ?? "",
              urlForm: data.urlForm || data.browserUrl || "",
              url: data.url || data.endpointUrl || "",
              method: data.method || data.httpMethod || "GET",
              headers: data.headers || {},
              body: data.body || (data.requestBody ? safeParseJson(data.requestBody) : {}),
              credentialId: data.credentialId || "",
              model: data.model || "",
              temperature: typeof data.temperature === "number" ? data.temperature : 0.7,
              query: data.query || "",
              from: data.from || "notifications@kairo.dev",
              to: data.to || "",
              subject: data.subject || "",
              formUrl: data.formUrl || "",
              formId: data.formId || "",
              values: data.values || {},
              channel: data.channel || "",
              message: data.message || "",
            },
          };
        });

        const backendConnections = edges.map((edge) => ({
          fromNodeId: edge.source,
          toNodeId: edge.target,
          fromOutput: edge.sourceHandle || "main",
          toInput: edge.targetHandle || "main",
        }));

        return { nodes: backendNodes, connections: backendConnections };
      };
    }
  }, [nodes, edges, externalSaveRef]);

  // Inject callbacks into node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      })),
    );
  }, [
    handleDeleteNode,
    handleOpenSettings,
    handleTextChange,
    handleMethodChange,
  ]);

  // Default data factory based on NodeType
  const getDefaultNodeData = useCallback(
    (item: NodePaletteItem): Partial<WorkflowNodeData> => {
      const base: Partial<WorkflowNodeData> = {
        title: item.title,
        subtitle: item.description || item.subtitle || "",
        category: item.category,
        iconName: item.iconName || "generic",
        type: item.type,
        status: "idle",
      };

      switch (item.type) {
        case NodeType.INPUT_TRIGGER:
          // User requirement: Enter text node should be empty by default
          return {
            ...base,
            prompt: "",
            textValue: "",
          };
        case NodeType.BROWSER_TRIGGER:
          return {
            ...base,
            urlForm: "https://www.google.com",
            browserUrl: "https://www.google.com",
          };
        case NodeType.HTTP_TRIGGER:
          return {
            ...base,
            url: "https://jsonplaceholder.typicode.com/posts/1",
            endpointUrl: "https://jsonplaceholder.typicode.com/posts/1",
            method: "GET",
            httpMethod: "GET",
            headers: {},
            body: {},
          };
        case NodeType.WEBHOOK_TRIGGER:
          return {
            ...base,
          };
        case NodeType.CLAUDE_EXECUTER:
          return {
            ...base,
            model: "claude-3-5-sonnet-20241022",
            prompt: "Summarize the incoming information clearly.",
          };
        case NodeType.OPENAI_EXECUTER:
          return {
            ...base,
            model: "gpt-4o",
            prompt: "Analyze the incoming data and produce a structured response.",
            temperature: 0.7,
          };
        case NodeType.GEMINI_EXECUTER:
          return {
            ...base,
            model: "gemini-1.5-flash",
            prompt: "Generate an analysis of the provided content.",
          };
        case NodeType.POSTGRES_EXECUTER:
          return {
            ...base,
            query: "SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;",
          };
        case NodeType.EMAIL_EXECUTER:
          return {
            ...base,
            from: "notifications@kairo.dev",
            to: "user@example.com",
            subject: "Kairo Workflow Execution Update",
            body: "Your workflow executed successfully.",
          };
        case NodeType.SLACK_EXECUTER:
          return {
            ...base,
            channel: "#general",
            message: "Automation step executed successfully!",
          };
        case NodeType.GOOGLE_FORM_EXECUTER:
          return {
            ...base,
            formUrl: "https://docs.google.com/forms/d/e/.../viewform",
            formId: "",
            fields: [],
            values: {},
          };
        case NodeType.OUTPUT:
          // User requirement: No hardcoded status/ready
          return {
            ...base,
            outputData: null,
          };
        default:
          return base;
      }
    },
    [],
  );

  // Add node dynamically from sidebar
  const addNodeFromPalette = useCallback(
    (item: NodePaletteItem) => {
      const newNodeId = `node-${Date.now()}`;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x + 220, y: lastNode.position.y }
        : { x: 180, y: 180 };

      const defaults = getDefaultNodeData(item);

      const newNode: Node = {
        id: newNodeId,
        type: item.type,
        position,
        data: {
          ...defaults,
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, getDefaultNodeData, handleDeleteNode, handleOpenSettings, handleTextChange, handleMethodChange],
  );

  // Connect ref to sidebar click
  useEffect(() => {
    if (externalAddNodeRef) {
      externalAddNodeRef.current = addNodeFromPalette;
    }
  }, [addNodeFromPalette, externalAddNodeRef]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  // While connected, edge is solid. Only animated/running during execution
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: isExecuting,
            style: { stroke: isExecuting ? "#2563EB" : "#94A3B8", strokeWidth: 2 },
          },
          eds,
        ),
      ),
    [isExecuting],
  );

  // Drag and Drop from Sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      const item: NodePaletteItem = JSON.parse(raw);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaults = getDefaultNodeData(item);

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: item.type,
        position,
        data: {
          ...defaults,
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [
      screenToFlowPosition,
      getDefaultNodeData,
      handleDeleteNode,
      handleOpenSettings,
      handleTextChange,
      handleMethodChange,
    ],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setIsDirty(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setIsDirty(false);
  }, []);

  // Filter credentials matching node requirement
  const matchingCredentials = useMemo(() => {
    if (!selectedNode) return [];
    const type = selectedNode.type;
    return credentials.filter((c) => {
      const cType = c.type.toLowerCase();
      if (type === NodeType.CLAUDE_EXECUTER) return cType.includes("claude") || cType.includes("anthropic");
      if (type === NodeType.OPENAI_EXECUTER) return cType.includes("openai") || cType.includes("gpt");
      if (type === NodeType.GEMINI_EXECUTER) return cType.includes("gemini") || cType.includes("google");
      if (type === NodeType.POSTGRES_EXECUTER) return cType.includes("postgres") || cType.includes("sql") || cType.includes("database");
      if (type === NodeType.EMAIL_EXECUTER) return cType.includes("email") || cType.includes("smtp");
      if (type === NodeType.SLACK_EXECUTER) return cType.includes("slack");
      return true;
    });
  }, [selectedNode, credentials]);

  const requiresCredential =
    selectedNode &&
    [
      NodeType.CLAUDE_EXECUTER,
      NodeType.OPENAI_EXECUTER,
      NodeType.GEMINI_EXECUTER,
      NodeType.POSTGRES_EXECUTER,
      NodeType.EMAIL_EXECUTER,
    ].includes(selectedNode.type as NodeType);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeComponents}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Cross}
          color="rgba(0, 0, 0, 0.7)"
          gap={20}
          size={1.2}
        />
        <Controls
          showFitView={false}
          showInteractive={false}
          className="!bg-white text-[#2563EB] !border !border-gray-200 !rounded-xl !shadow-sm overflow-hidden"
        />
        <MiniMap
          nodeColor="#2563EB"
          className="!bg-gray-300/90 !border !border-gray-200 !rounded-xl !shadow-sm overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Selected Node Configuration Drawer / Dialog */}
      {selectedNode && selectedNodeData && (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl border border-gray-200 shadow-xl p-5 z-40 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {selectedNodeData.title}
              </h3>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 shrink-0">
                {selectedNodeData.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedNodeId(null);
                setIsDirty(false);
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {selectedNodeData.subtitle ||
                selectedNodeData.description ||
                "Configure node settings for execution."}
            </p>

            {/* Credential Selection */}
            {requiresCredential && (
              <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Credential</span>
                  </label>
                  <Link
                    href="/credentials"
                    target="_blank"
                    className="text-[10px] text-blue-600 hover:underline font-medium"
                  >
                    Manage Keys &rarr;
                  </Link>
                </div>

                <div className="relative mt-1">
                  <select
                    value={selectedNodeData.credentialId || ""}
                    onChange={(e) =>
                      updateSelectedNodeData({ credentialId: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">-- Choose Credential --</option>
                    {matchingCredentials.length > 0 ? (
                      matchingCredentials.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))
                    ) : (
                      credentials.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))
                    )}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                {!selectedNodeData.credentialId && (
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    Required: This executor will fail unless a valid credential is selected.
                  </p>
                )}
              </div>
            )}

            {/* Claude Executor Settings */}
            {selectedNode.type === NodeType.CLAUDE_EXECUTER && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Claude Model</label>
                  <div className="relative">
                    <select
                      value={selectedNodeData.model || "claude-3-5-sonnet-20241022"}
                      onChange={(e) => updateSelectedNodeData({ model: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      {CLAUDE_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Prompt</label>
                  <textarea
                    rows={4}
                    value={selectedNodeData.prompt || ""}
                    onChange={(e) => updateSelectedNodeData({ prompt: e.target.value })}
                    placeholder="Enter prompt for Claude (e.g. Summarize previous result)..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans leading-relaxed"
                  />
                  <p className="text-[11px] text-gray-400">
                    Will receive context from connected nodes automatically.
                  </p>
                </div>
              </div>
            )}

            {/* OpenAI Executor Settings */}
            {selectedNode.type === NodeType.OPENAI_EXECUTER && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">OpenAI Model</label>
                  <div className="relative">
                    <select
                      value={selectedNodeData.model || "gpt-4o"}
                      onChange={(e) => updateSelectedNodeData({ model: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <span>Temperature</span>
                    <span className="font-mono text-blue-600">{selectedNodeData.temperature ?? 0.7}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedNodeData.temperature ?? 0.7}
                    onChange={(e) => updateSelectedNodeData({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Prompt</label>
                  <textarea
                    rows={4}
                    value={selectedNodeData.prompt || ""}
                    onChange={(e) => updateSelectedNodeData({ prompt: e.target.value })}
                    placeholder="Enter prompt for OpenAI..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Google Gemini Executor Settings */}
            {selectedNode.type === NodeType.GEMINI_EXECUTER && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Gemini Model</label>
                  <div className="relative">
                    <select
                      value={selectedNodeData.model || "gemini-1.5-flash"}
                      onChange={(e) => updateSelectedNodeData({ model: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      {GEMINI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Prompt</label>
                  <textarea
                    rows={4}
                    value={selectedNodeData.prompt || ""}
                    onChange={(e) => updateSelectedNodeData({ prompt: e.target.value })}
                    placeholder="Enter prompt for Gemini..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* PostgreSQL Database Executor */}
            {selectedNode.type === NodeType.POSTGRES_EXECUTER && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                    <span>SQL Query</span>
                    <span className="text-[10px] text-gray-400">PostgreSQL syntax</span>
                  </label>
                  <textarea
                    rows={5}
                    value={selectedNodeData.query || ""}
                    onChange={(e) => updateSelectedNodeData({ query: e.target.value })}
                    placeholder="SELECT * FROM users LIMIT 10;"
                    className="px-3 py-2 bg-gray-900 text-emerald-400 border border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono leading-relaxed"
                  />
                  <p className="text-[11px] text-gray-400 leading-tight">
                    If left blank or chained after an AI node, the previous node&apos;s output SQL will be executed.
                  </p>
                </div>
              </div>
            )}

            {/* Email Executor */}
            {selectedNode.type === NodeType.EMAIL_EXECUTER && (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">From Address</label>
                  <input
                    type="email"
                    value={selectedNodeData.from || ""}
                    onChange={(e) => updateSelectedNodeData({ from: e.target.value })}
                    placeholder="notifications@kairo.dev"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Recipient Email (To)</label>
                  <input
                    type="email"
                    value={selectedNodeData.to || ""}
                    onChange={(e) => updateSelectedNodeData({ to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={selectedNodeData.subject || ""}
                    onChange={(e) => updateSelectedNodeData({ subject: e.target.value })}
                    placeholder="Subject line..."
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Email Body</label>
                  <textarea
                    rows={3}
                    value={typeof selectedNodeData.body === "string" ? selectedNodeData.body : ""}
                    onChange={(e) => updateSelectedNodeData({ body: e.target.value })}
                    placeholder="Optional: will use previous step result if left empty..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            )}

            {/* Input Trigger (Empty by default) */}
            {selectedNode.type === NodeType.INPUT_TRIGGER && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Input Prompt / Text</label>
                <textarea
                  rows={5}
                  value={selectedNodeData.prompt ?? selectedNodeData.textValue ?? ""}
                  onChange={(e) =>
                    updateSelectedNodeData({
                      prompt: e.target.value,
                      textValue: e.target.value,
                    })
                  }
                  placeholder="Enter text here..."
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans leading-relaxed"
                />
                <p className="text-[11px] text-gray-400">
                  Initial input injected into the workflow execution graph.
                </p>
              </div>
            )}

            {/* Browser Trigger */}
            {selectedNode.type === NodeType.BROWSER_TRIGGER && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Target URL to Scrape</label>
                <input
                  type="url"
                  value={selectedNodeData.urlForm || selectedNodeData.browserUrl || ""}
                  onChange={(e) =>
                    updateSelectedNodeData({
                      urlForm: e.target.value,
                      browserUrl: e.target.value,
                    })
                  }
                  placeholder="https://www.google.com"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <p className="text-[11px] text-gray-400 leading-tight">
                  Playwright headless Chromium will visit this URL and extract page title &amp; text body.
                </p>
              </div>
            )}

            {/* HTTP Trigger / Outbound Request */}
            {selectedNode.type === NodeType.HTTP_TRIGGER && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">HTTP Method</label>
                  <div className="relative">
                    <select
                      value={selectedNodeData.method || selectedNodeData.httpMethod || "GET"}
                      onChange={(e) =>
                        updateSelectedNodeData({
                          method: e.target.value,
                          httpMethod: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Request URL</label>
                  <input
                    type="url"
                    value={selectedNodeData.url || selectedNodeData.endpointUrl || ""}
                    onChange={(e) =>
                      updateSelectedNodeData({
                        url: e.target.value,
                        endpointUrl: e.target.value,
                      })
                    }
                    placeholder="https://api.example.com/data"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                {["POST", "PUT", "PATCH"].includes(
                  (selectedNodeData.method || selectedNodeData.httpMethod || "GET").toUpperCase(),
                ) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">JSON Body</label>
                    <textarea
                      rows={4}
                      value={
                        typeof selectedNodeData.body === "string"
                          ? selectedNodeData.body
                          : selectedNodeData.requestBody ||
                            (selectedNodeData.body ? JSON.stringify(selectedNodeData.body, null, 2) : "{}")
                      }
                      onChange={(e) =>
                        updateSelectedNodeData({
                          requestBody: e.target.value,
                          body: safeParseJson(e.target.value),
                        })
                      }
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Slack Notification */}
            {selectedNode.type === NodeType.SLACK_EXECUTER && (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Channel / Webhook</label>
                  <input
                    type="text"
                    value={selectedNodeData.channel || ""}
                    onChange={(e) => updateSelectedNodeData({ channel: e.target.value })}
                    placeholder="#general or webhook URL"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Message</label>
                  <textarea
                    rows={3}
                    value={selectedNodeData.message || ""}
                    onChange={(e) => updateSelectedNodeData({ message: e.target.value })}
                    placeholder="Enter message to post to Slack..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            )}

            {/* Google Form */}
            {selectedNode.type === NodeType.GOOGLE_FORM_EXECUTER && (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">Google Form URL</label>
                  <input
                    type="url"
                    value={selectedNodeData.formUrl || ""}
                    onChange={(e) => updateSelectedNodeData({ formUrl: e.target.value })}
                    placeholder="https://docs.google.com/forms/d/e/.../viewform"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Output Node: Raw JSON Inspector in Drawer as requested */}
            {selectedNode.type === NodeType.OUTPUT && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Raw Execution Payload (JSON)</span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase">
                    Full Inspector
                  </span>
                </label>
                <textarea
                  rows={8}
                  readOnly
                  value={
                    selectedNodeData.outputData !== null && selectedNodeData.outputData !== undefined
                      ? typeof selectedNodeData.outputData === "string"
                        ? selectedNodeData.outputData
                        : JSON.stringify(selectedNodeData.outputData, null, 2)
                      : "No output payload received yet. Run workflow to inspect data."
                  }
                  className="px-3 py-2 bg-gray-900 text-emerald-400 font-mono text-xs border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {/* Actions: Save Dialog & Delete Node */}
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={handleSaveDialog}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isDirty
                    ? "text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                    : "text-gray-400 bg-gray-100 border border-gray-200 cursor-default"
                }`}
              >
                <FloppyDiskBackIcon weight="fill" className="w-3.5 h-3.5" />
                <span>{isSaved ? "Saved!" : "Save Node Settings"}</span>
              </button>

              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete Node</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function safeParseJson(val: any) {
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
}

export default function EditorCanvas(props: EditorCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerEditorCanvas {...props} />
    </ReactFlowProvider>
  );
}
