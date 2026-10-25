"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import EditorSidebar, { NodePaletteItem } from "./sidebar/EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import EditorCanvas from "./EditorCanvas";
import EditorWorker from "./EditorWorker";
import { getByIdWorkflow, saveWorkflowCanvas, executeWorkflow } from "@/api/workflow.api";
import { Node, Edge } from "@xyflow/react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

interface EditorProps {
  workflowId: string;
}

export default function Editor({ workflowId }: EditorProps) {
  const [view, setView] = useState<"editor" | "worker">("editor");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState<string>("Loading workflow...");
  const [workflowStatus, setWorkflowStatus] = useState<string>("DRAFT");
  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
    getByIdWorkflow(workflowId)
      .then((res) => {
        if (!mounted) return;
        const wf = res?.workflow;
        if (wf) {
          setWorkflowName(wf.workflowName || `Workflow #${workflowId}`);
          setWorkflowStatus(wf.workflowStatus || "DRAFT");
          if (Array.isArray(wf.nodes) && wf.nodes.length > 0) {
            setInitialNodes(wf.nodes);
          }
          if (Array.isArray(wf.edges) && wf.edges.length > 0) {
            setInitialEdges(wf.edges);
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn("Could not load workflow details:", err);
        setWorkflowName(`Workflow #${workflowId}`);
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

  // Trigger backend execution API (BullMQ job queue)
  const handleExecute = async () => {
    try {
      // First save current canvas so backend executes the latest state
      if (saveCanvasRef.current) {
        const payload = saveCanvasRef.current();
        await saveWorkflowCanvas(workflowId, payload);
      }

      setIsExecuting(true);
      setWorkflowStatus("ONGOING");
      const res = await executeWorkflow(workflowId);
      const jobId = res?.jobId;
      if (jobId) {
        setLastJobId(jobId);
        showToast(`Workflow execution queued in BullMQ (Job #${jobId})`, "success");
      } else {
        showToast("Workflow execution started", "success");
      }
    } catch (err: any) {
      console.error("Execute workflow error:", err);
      setIsExecuting(false);
      showToast(err?.response?.data?.message || err?.message || "Execution failed", "error");
    }
  };

  const handleStop = () => {
    setIsExecuting(false);
    showToast("Execution stopped", "success");
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
    setWorkflowStatus("COMPLETED");
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
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {view === "editor" ? (
          <>
            {/* Left Node Library Sidebar */}
            <EditorSidebar onAddNode={(item) => addNodeRef.current?.(item)} />

            {/* React Flow Canvas */}
            <div className="flex-1 relative h-full bg-gray-50/50">
              <EditorCanvas
                workflowId={workflowId}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                isExecuting={isExecuting}
                onExecutionComplete={handleExecutionComplete}
                externalAddNodeRef={addNodeRef}
                externalSaveRef={saveCanvasRef}
              />
            </div>
          </>
        ) : (
          /* Worker Telemetry / Execution Log View */
          <div className="flex-1 w-full h-full">
            <EditorWorker
              workflowName={workflowName}
              isExecuting={isExecuting}
              onExecute={handleExecute}
              onStop={handleStop}
            />
          </div>
        )}
      </div>
    </div>
  );
}
