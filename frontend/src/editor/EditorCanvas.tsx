"use client";

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
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
import {
  X,
  Trash,
  FloppyDiskBackIcon,
  CaretDown,
} from "@phosphor-icons/react";

interface EditorCanvasProps {
  workflowId: string;
  isExecuting: boolean;
  onExecutionComplete?: () => void;
  externalAddNodeRef?: React.MutableRefObject<
    ((item: NodePaletteItem) => void) | null
  >;
}

function InnerEditorCanvas({
  workflowId,
  isExecuting,
  onExecutionComplete,
  externalAddNodeRef,
}: EditorCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Directly derive selectedNode from live nodes state to always reflect changes
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

  // Handle open settings modal for a node
  const handleOpenSettings = useCallback((id: string) => {
    setSelectedNodeId(id);
    setIsDirty(false);
  }, []);

  // Single step execution simulation
  const handleSingleExecute = useCallback((id: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, status: "running" } } : n,
      ),
    );
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "success" } } : n,
        ),
      );
    }, 900);
  }, []);

  // Handle text change inside a node or dialog
  const handleTextChange = useCallback(
    (id: string, text: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, textValue: text } } : n,
        ),
      );
      if (selectedNodeId === id) {
        setIsDirty(true);
      }
    },
    [selectedNodeId],
  );

  // Handle HTTP method change from node or dialog
  const handleMethodChange = useCallback(
    (id: string, method: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, httpMethod: method } } : n,
        ),
      );
      if (selectedNodeId === id) {
        setIsDirty(true);
      }
    },
    [selectedNodeId],
  );

  // Save feedback in dialog
  const handleSaveDialog = useCallback(() => {
    setIsSaved(true);
    setIsDirty(false);
    setTimeout(() => setIsSaved(false), 1500);
  }, []);

  // Update selected node data and mark form dirty
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

  // Inject callbacks into node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onExecute: handleSingleExecute,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      })),
    );
  }, [
    handleDeleteNode,
    handleOpenSettings,
    handleSingleExecute,
    handleTextChange,
    handleMethodChange,
  ]);

  // Handle execution simulation
  useEffect(() => {
    if (!isExecuting) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, status: "idle" },
        })),
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: false,
        })),
      );
      return;
    }

    // Step-by-step node execution animation
    setEdges((eds) => eds.map((e) => ({ ...e, animated: true })));

    let step = 0;
    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((n, idx) => {
          if (idx < step) {
            return { ...n, data: { ...n.data, status: "success" } };
          }
          if (idx === step) {
            return { ...n, data: { ...n.data, status: "running" } };
          }
          return { ...n, data: { ...n.data, status: "idle" } };
        }),
      );

      step++;
      if (step > nodes.length) {
        clearInterval(interval);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, status: "success" },
          })),
        );
        onExecutionComplete?.();
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isExecuting, nodes.length, onExecutionComplete]);

  // Function to add node dynamically (called from sidebar click)
  const addNodeFromPalette = useCallback(
    (item: NodePaletteItem) => {
      const newNodeId = `node-${Date.now()}`;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x + 240, y: lastNode.position.y }
        : { x: 200, y: 200 };

      const isBrowser =
        item.iconName === "browser" || item.title === "Browser Trigger";
      const isHttp =
        item.type === NodeType.HTTP_REQUEST ||
        item.iconName === "http" ||
        item.title === "HTTP Request";
      const isOutput =
        item.type === NodeType.OUTPUT || item.iconName === "diamond" || item.iconName === "square";
      const isText =
        item.type === NodeType.TEXT || item.iconName === "text";
      const isGoogleForm =
        item.type === NodeType.GOOGLE_FORM ||
        item.iconName === "google_form";

      const newNode: Node = {
        id: newNodeId,
        type: item.type,
        position,
        data: {
          title: item.title,
          subtitle: item.description || item.subtitle || "",
          category: item.category,
          iconName: item.iconName || (isBrowser ? "browser" : "webhook"),
          type: item.type,
          browserUrl: isBrowser ? "" : undefined,
          httpMethod: isHttp ? "GET" : undefined,
          endpointUrl: isHttp ? "" : undefined,
          requestBody: isHttp ? "" : undefined,
          outputData: isOutput ? { status: 200, result: "ready" } : undefined,
          textValue: isText ? "" : undefined,
          formUrl: isGoogleForm ? "" : undefined,
          status: "idle",
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onExecute: handleSingleExecute,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [
      nodes,
      handleDeleteNode,
      handleOpenSettings,
      handleSingleExecute,
      handleTextChange,
      handleMethodChange,
    ],
  );

  // Expose addNode method to parent via ref
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

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#2563EB", strokeWidth: 2 },
          },
          eds,
        ),
      ),
    [],
  );

  // HTML5 Drag and Drop from Sidebar
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

      const isBrowser =
        item.iconName === "browser" || item.title === "Browser Trigger";
      const isHttp =
        item.type === NodeType.HTTP_REQUEST ||
        item.iconName === "http" ||
        item.title === "HTTP Request";
      const isOutput =
        item.type === NodeType.OUTPUT || item.iconName === "diamond" || item.iconName === "square";
      const isText =
        item.type === NodeType.TEXT || item.iconName === "text";
      const isGoogleForm =
        item.type === NodeType.GOOGLE_FORM ||
        item.iconName === "google_form";

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: item.type,
        position,
        data: {
          title: item.title,
          subtitle: item.description || item.subtitle || "",
          category: item.category,
          iconName: item.iconName || (isBrowser ? "browser" : "webhook"),
          type: item.type,
          browserUrl: isBrowser ? "" : undefined,
          httpMethod: isHttp ? "GET" : undefined,
          endpointUrl: isHttp ? "" : undefined,
          requestBody: isHttp ? "" : undefined,
          outputData: isOutput ? { status: 200, result: "ready" } : undefined,
          textValue: isText ? "" : undefined,
          formUrl: isGoogleForm ? "" : undefined,
          status: "idle",
          onDelete: handleDeleteNode,
          onOpenSettings: handleOpenSettings,
          onExecute: handleSingleExecute,
          onChangeText: handleTextChange,
          onChangeMethod: handleMethodChange,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [
      screenToFlowPosition,
      handleDeleteNode,
      handleOpenSettings,
      handleSingleExecute,
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

  // Determine node type in dialog
  const isHttpNode = Boolean(
    selectedNode &&
      selectedNodeData &&
      (selectedNodeData.iconName === "http" ||
        selectedNode.type === NodeType.HTTP_REQUEST ||
        selectedNodeData.title === "HTTP Request" ||
        (selectedNode.type === NodeType.HTTP_TRIGGER &&
          selectedNodeData.title !== "Browser Trigger" &&
          selectedNodeData.iconName !== "browser")),
  );

  const isBrowserNode = Boolean(
    selectedNode &&
      selectedNodeData &&
      !isHttpNode &&
      (selectedNodeData.iconName === "browser" ||
        selectedNodeData.title === "Browser Trigger" ||
        selectedNode.type === NodeType.HTTP_TRIGGER),
  );

  const isOutputNode = Boolean(
    selectedNode &&
      selectedNodeData &&
      (selectedNodeData.iconName === "diamond" ||
        selectedNodeData.iconName === "square" ||
        selectedNode.type === NodeType.OUTPUT),
  );

  const isTextNode = Boolean(
    selectedNode &&
      selectedNodeData &&
      (selectedNodeData.iconName === "text" ||
        selectedNode.type === NodeType.TEXT),
  );

  const isGoogleFormNode = Boolean(
    selectedNode &&
      selectedNodeData &&
      (selectedNodeData.iconName === "google_form" ||
        selectedNode.type === NodeType.GOOGLE_FORM),
  );

  const isPostOrPatchOrPut =
    isHttpNode &&
    ["POST", "PUT", "PATCH"].includes(
      (selectedNodeData?.httpMethod || "GET").toUpperCase(),
    );

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
        <Controls className="!bg-white text-[#2563EB] !border !border-gray-200 !rounded-xl !shadow-sm overflow-hidden" />
        <MiniMap
          nodeColor="#2563EB"
          className="!bg-gray-300/90 !border !border-gray-200 !rounded-xl !shadow-sm overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Selected Node Configuration Drawer / Dialog */}
      {selectedNode && selectedNodeData && (
        <div className="absolute top-4 right-4 w-84 bg-white rounded-2xl border border-gray-200 shadow-xl p-5 z-40 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          {/* Header: Title and Category pill side-by-side */}
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

          <div className="flex flex-col gap-3">
            {/* Description (Normal text paragraph) */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {selectedNodeData.subtitle ||
                selectedNodeData.description ||
                "Configure node settings."}
            </p>

            {/* HTTP Request Dialog: Method dropdown + Endpoint URL + Request Body (for POST, PUT, PATCH) */}
            {isHttpNode ? (
              <div className="flex flex-col gap-3">
                {/* Method */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Method
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNodeData.httpMethod || "GET"}
                      onChange={(e) =>
                        updateSelectedNodeData({ httpMethod: e.target.value })
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
                  <p className="text-[11px] text-gray-400">
                    The HTTP method to use for this request
                  </p>
                </div>

                {/* Endpoint URL */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={selectedNodeData.endpointUrl ?? ""}
                    onChange={(e) =>
                      updateSelectedNodeData({ endpointUrl: e.target.value })
                    }
                    placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 leading-tight">
                    Static URL or use &#123;&#123;variables&#125;&#125; for simple
                    values or &#123;&#123;json variable&#125;&#125; to stringify
                    objects
                  </p>
                </div>

                {/* Request Body (only for POST, PUT, PATCH) */}
                {isPostOrPatchOrPut && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Request Body
                    </label>
                    <textarea
                      rows={5}
                      value={selectedNodeData.requestBody ?? ""}
                      onChange={(e) =>
                        updateSelectedNodeData({ requestBody: e.target.value })
                      }
                      placeholder='{\n  "userId": "{{httpResponse.data.id}}",\n  "name": "{{httpResponse.data.name}}",\n  "items": "{{httpResponse.data.items}}"\n}'
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-gray-400 leading-tight">
                      Static URL or use &#123;&#123;variables&#125;&#125; for simple
                      values or &#123;&#123;json variable&#125;&#125; to stringify
                      objects
                    </p>
                  </div>
                )}
              </div>
            ) : isBrowserNode ? (
              /* Browser Trigger: Just Browser URL, no API */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Browser URL
                </label>
                <input
                  type="url"
                  value={selectedNodeData.browserUrl ?? ""}
                  onChange={(e) =>
                    updateSelectedNodeData({ browserUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            ) : isOutputNode ? (
              /* Output Node: Output result box, NO API */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Output Result</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                    Live Output
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={
                    typeof selectedNodeData.outputData === "string"
                      ? selectedNodeData.outputData
                      : JSON.stringify(
                          selectedNodeData.outputData || {
                            status: 200,
                            result: "ok",
                          },
                          null,
                          2,
                        )
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateSelectedNodeData({ outputData: parsed });
                    } catch {
                      updateSelectedNodeData({ outputData: e.target.value });
                    }
                  }}
                  className="px-3 py-2 bg-gray-900 text-emerald-400 font-mono text-xs border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ) : isTextNode ? (
              /* Text Node: Text Content editor, NO API */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Text Content
                </label>
                <textarea
                  rows={4}
                  value={selectedNodeData.textValue ?? ""}
                  onChange={(e) => {
                    updateSelectedNodeData({ textValue: e.target.value });
                  }}
                  placeholder="Enter text content..."
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
                />
              </div>
            ) : isGoogleFormNode ? (
              /* Google Form Node: Form URL, NO API */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Google Form URL
                </label>
                <input
                  type="url"
                  value={selectedNodeData.formUrl ?? ""}
                  onChange={(e) =>
                    updateSelectedNodeData({ formUrl: e.target.value })
                  }
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  URL to submit responses or link to Google Form
                </p>
              </div>
            ) : selectedNode.type === NodeType.EMAIL ||
              selectedNodeData.iconName === "email" ||
              selectedNodeData.title?.toLowerCase().includes("email") ? (
              /* Send Email Node: Uneditable Email field instead of API endpoint */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Email</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    Uneditable
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={selectedNodeData.emailAddress || "notifications@kairo.dev"}
                  className="px-3 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs text-gray-500 font-mono cursor-not-allowed select-none"
                />
              </div>
            ) : (
              /* Standard Action / AI / Integration Node: Disabled API Input */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>API Endpoint</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    Disabled
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  value={`https://api.kairo.dev/v1/endpoints/${(selectedNodeData.iconName || "node").toLowerCase()}`}
                  className="px-3 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs text-gray-400 font-mono cursor-not-allowed select-none"
                />
              </div>
            )}

            {/* Action buttons: Save button only in input / HTTP trigger nodes */}
            <div className="pt-2 flex flex-col gap-2">
              {(isHttpNode || isBrowserNode) && (
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={handleSaveDialog}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isDirty
                      ? "text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                      : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                  }`}
                >
                  <FloppyDiskBackIcon weight="fill" className="w-3.5 h-3.5" />
                  <span>{isSaved ? "Saved!" : "Save Changes"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorCanvas(props: EditorCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerEditorCanvas {...props} />
    </ReactFlowProvider>
  );
}
