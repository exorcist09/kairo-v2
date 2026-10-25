"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import EditorSidebar, { NodePaletteItem } from "./sidebar/EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import EditorCanvas from "./EditorCanvas";
import EditorWorker from "./EditorWorker";
import { getByIdWorkflow, saveWorkflowCanvas, executeWorkflow } from "@/api/workflow.api";
import { useWorkflowStore } from "@/zusstore/workflow.store";
import { useAnalyticsStore } from "@/zusstore/analytics.store";
import { useBillingStore } from "@/zusstore/billing.store";
import { Node, Edge } from "@xyflow/react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

interface EditorProps {
  workflowId: string;
}

export default function Editor({ workflowId }: EditorProps) {
  const { updateWorkflowStatus } = useWorkflowStore();
  const [view, setView] = useState<"editor" | "worker">("editor");
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState<string>("Loading workflow...");
  const [workflowStatus, setWorkflowStatus] = useState<string>("DRAFT");
  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleNodesUpdate = useCallback((nodes: Node[], edges: Edge[]) => {
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
  }, []);

  // Ref to pass addNode function from Canvas to Sidebar
  const addNodeRef = useRef<((item: NodePaletteItem) => void) | null>(null);

  // Ref to retrieve serialized nodes and connections from Canvas
  const saveCanvasRef = useRef<(() => { nodes: any[]; connections: any[] }) | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Fetch workflow details on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getByIdWorkflow(workflowId)
      .then((res) => {
        if (!mounted) return;
        const wf = res?.workflow;
        if (wf) {
          setWorkflowName(wf.workflowName || `Workflow #${workflowId}`);
          setWorkflowStatus(wf.workflowStatus || "DRAFT");
          if (Array.isArray(wf.nodes)) {
            setInitialNodes(wf.nodes);
          }
          if (Array.isArray(wf.edges)) {
            setInitialEdges(wf.edges);
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn("Could not load workflow details:", err);
        setWorkflowName(`Workflow #${workflowId}`);
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [workflowId]);

  // Save workflow nodes & connections to backend API
  const handleSave = async () => {
    if (!saveCanvasRef.current) return;
    try {
      setIsSaving(true);
      const payload = saveCanvasRef.current();
      await saveWorkflowCanvas(workflowId, payload);
      showToast("Workflow canvas saved successfully!", "success");
    } catch (err: any) {
      console.error("Save workflow error:", err);
      showToast(err?.response?.data?.message || err?.message || "Failed to save workflow", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger backend execution instantly
  const handleExecute = () => {
    // 1. Instant UI response (0ms perceived latency)
    setIsExecuting(true);
    setWorkflowStatus("ONGOING");
    updateWorkflowStatus(workflowId, "ongoing");

    // 2. Perform save and execution
    (async () => {
      try {
        if (saveCanvasRef.current) {
          const payload = saveCanvasRef.current();
          await saveWorkflowCanvas(workflowId, payload);
        }

        const res = await executeWorkflow(workflowId);
        const jobId = res?.jobId;
        if (jobId) {
          setLastJobId(jobId);
        }
        useAnalyticsStore.getState().fetchAnalytics(true);
        useBillingStore.getState().fetchBillingData(true);
      } catch (err: any) {
        console.error("Execute workflow error:", err);
        showToast(
          err?.response?.data?.message || err?.message || "Execution failed",
          "error"
        );
        setIsExecuting(false);
        setWorkflowStatus("FAILED");
        updateWorkflowStatus(workflowId, "failed");
        useAnalyticsStore.getState().fetchAnalytics(true);
        useBillingStore.getState().fetchBillingData(true);
      }
    })();
  };

  const handleStop = () => {
    setIsExecuting(false);
    showToast("Execution stopped", "success");
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
    setWorkflowStatus("COMPLETED");
    updateWorkflowStatus(workflowId, "completed");
    useAnalyticsStore.getState().fetchAnalytics(true);
    useBillingStore.getState().fetchBillingData(true);
    showToast("Workflow execution completed successfully!", "success");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`absolute bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-gray-900 text-white border-gray-800"
              : "bg-red-900 text-white border-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-400" />
          ) : (
            <WarningCircle weight="fill" className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-0.5 hover:opacity-70 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar (Full Width) */}
      <EditorTopbar
        workflowName={workflowName}
        workflowStatus={workflowStatus}
        view={view}
        onViewChange={setView}
        isExecuting={isExecuting}
        isSaving={isSaving}
        onExecute={handleExecute}
        onStop={handleStop}
        onSave={handleSave}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin" />
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center absolute">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Loading workflow canvas...
          </h3>
          <p className="text-xs text-gray-400">
            Fetching nodes, edges, and execution history
          </p>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* React Flow Canvas & Sidebar */}
          <div className={`flex-1 flex min-h-0 w-full h-full ${view !== "editor" ? "hidden" : ""}`}>
            {/* Left Node Library Sidebar */}
            <EditorSidebar onAddNode={(item) => addNodeRef.current?.(item)} />

            {/* React Flow Canvas */}
            <div className="flex-1 relative h-full bg-gray-50/50">
              <EditorCanvas
                workflowId={workflowId}
                workflowStatus={workflowStatus}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                isExecuting={isExecuting}
                onExecutionComplete={handleExecutionComplete}
                externalAddNodeRef={addNodeRef}
                externalSaveRef={saveCanvasRef}
                onNodesUpdate={handleNodesUpdate}
              />
            </div>
          </div>

          {/* Worker Telemetry / Background Worker View */}
          <div className={`flex-1 w-full h-full ${view !== "worker" ? "hidden" : ""}`}>
            <EditorWorker
              workflowId={workflowId}
              workflowName={workflowName}
              workflowStatus={workflowStatus}
              isExecuting={isExecuting}
              nodes={currentNodes.length > 0 ? currentNodes : initialNodes}
              edges={currentEdges.length > 0 ? currentEdges : initialEdges}
            />
          </div>
        </div>
      )}
    </div>
  );
}
