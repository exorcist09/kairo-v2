"use client";

import { useState, useRef } from "react";
import EditorSidebar, { NodePaletteItem } from "./EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import EditorCanvas from "./EditorCanvas";
import EditorWorker from "./EditorWorker";

interface EditorProps {
  workflowId: string;
}

const WORKFLOW_NAMES: Record<string, string> = {
  "1": "Data Ingestion Pipeline",
  "2": "Nightly Database Backup",
  "3": "Customer Onboarding",
};

export default function Editor({ workflowId }: EditorProps) {
  const [view, setView] = useState<"editor" | "worker">("editor");
  const [isExecuting, setIsExecuting] = useState(false);

  const workflowName = WORKFLOW_NAMES[workflowId] || `Workflow #${workflowId}`;

  // Ref to pass addNode function from Canvas to Sidebar
  const addNodeRef = useRef<((item: NodePaletteItem) => void) | null>(null);

  const handleExecute = () => {
    setIsExecuting(true);
  };

  const handleStop = () => {
    setIsExecuting(false);
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
      {/* Top Bar (Full Width) */}
      <EditorTopbar
        workflowName={workflowName}
        view={view}
        onViewChange={setView}
        isExecuting={isExecuting}
        onExecute={handleExecute}
        onStop={handleStop}
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
                isExecuting={isExecuting}
                onExecutionComplete={handleExecutionComplete}
                externalAddNodeRef={addNodeRef}
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