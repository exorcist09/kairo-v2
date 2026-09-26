"use client";

import { useCallback, useState, useRef, useMemo, useEffect } from "react";
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
import CustomNode, { WorkflowNodeData } from "./CustomNode";
import { NodePaletteItem } from "./EditorSidebar";
import { X, Trash, Play, Lightning, Sparkle, Database } from "@phosphor-icons/react";

interface EditorCanvasProps {
  workflowId: string;
  isExecuting: boolean;
  onExecutionComplete?: () => void;
  externalAddNodeRef?: React.MutableRefObject<((item: NodePaletteItem) => void) | null>;
}


function InnerEditorCanvas({
  workflowId,
  isExecuting,
  onExecutionComplete,
  externalAddNodeRef,
}: EditorCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const initialData = {
    nodes: [
      {
        id: "node-1",
        type: "workflowNode",
        position: { x: 140, y: 180 },
        data: {
          title: "Webhook Trigger",
          subtitle: "Listen for incoming JSON payloads",
          category: "trigger",
          iconName: "webhook",
          config: { endpoint: "https://api.kairo.dev/v1/webhook" },
          status: "idle",
        },
      },
      {
        id: "node-2",
        type: "workflowNode",
        position: { x: 540, y: 180 },
        data: {
          title: "PostgreSQL Database",
          subtitle: "Insert or query records",
          category: "action",
          iconName: "database",
          config: { table: "events" },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "node-1",
        target: "node-2",
        animated: true,
        style: { stroke: "#2563EB", strokeWidth: 2 },
      },
    ],
  };

  const [nodes, setNodes] = useState<Node[]>(initialData.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialData.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const selectedNodeData = selectedNode ? (selectedNode.data as unknown as WorkflowNodeData) : null;





  // Node deletions
  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode((cur) => (cur?.id === id ? null : cur));
  }, []);


  // Inject onDelete callback into node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDelete: handleDeleteNode,
        },
      }))
    );
  }, [handleDeleteNode]);

  // Handle execution simulation
  useEffect(() => {
    if (!isExecuting) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, status: "idle" },
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: false,
        }))
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
        })
      );

      step++;
      if (step > nodes.length) {
        clearInterval(interval);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, status: "success" },
          }))
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
        ? { x: lastNode.position.x + 320, y: lastNode.position.y }
        : { x: 200, y: 200 };

      const newNode: Node = {
        id: newNodeId,
        type: "workflowNode",
        position,
        data: {
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          iconName: item.iconName,
          status: "idle",
          onDelete: handleDeleteNode,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, handleDeleteNode]
  );

  // Expose addNode method to parent via ref
  useEffect(() => {
    if (externalAddNodeRef) {
      externalAddNodeRef.current = addNodeFromPalette;
    }
  }, [addNodeFromPalette, externalAddNodeRef]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
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
          eds
        )
      ),
    []
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

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "workflowNode",
        position,
        data: {
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          iconName: item.iconName,
          status: "idle",
          onDelete: handleDeleteNode,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, handleDeleteNode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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
        proOptions={{hideAttribution:true}}
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
          className="!bg-white/90 !border !border-gray-200 !rounded-xl !shadow-sm overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Selected Node Configuration Drawer */}
      {selectedNode && selectedNodeData && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl p-5 z-40 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                {selectedNodeData.category}
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-1">
                {selectedNodeData.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Node Label</label>
              <input
                type="text"
                value={selectedNodeData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, title: newTitle } }
                        : n
                    )
                  );
                  setSelectedNode((prev) =>
                    prev ? { ...prev, data: { ...prev.data, title: newTitle } } : null
                  );
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Description</label>
              <input
                type="text"
                value={selectedNodeData.subtitle}
                onChange={(e) => {
                  const newSubtitle = e.target.value;
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, subtitle: newSubtitle } }
                        : n
                    )
                  );
                  setSelectedNode((prev) =>
                    prev
                      ? { ...prev, data: { ...prev.data, subtitle: newSubtitle } }
                      : null
                  );
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
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
