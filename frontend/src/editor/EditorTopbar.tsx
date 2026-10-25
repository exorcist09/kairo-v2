"use client";

import Link from "next/link";
import {
  Play,
  Stop,
  ArrowLeft,
  FloppyDiskBackIcon,
  CircleNotch,
  Coins,
} from "@phosphor-icons/react";
import { useBillingStore } from "@/zusstore/billing.store";

interface EditorTopbarProps {
  workflowName?: string;
  workflowStatus?: string;
  view: "editor" | "worker";
  onViewChange: (v: "editor" | "worker") => void;
  isExecuting: boolean;
  isSaving?: boolean;
  onExecute: () => void;
  onStop: () => void;
  onSave?: () => void;
}

export default function EditorTopbar({
  workflowName,
  workflowStatus = "DRAFT",
  view,
  onViewChange,
  isExecuting,
  isSaving = false,
  onExecute,
  onStop,
  onSave,
}: EditorTopbarProps) {
  const { balance: creditBalance } = useBillingStore();

  const getStatusBadge = () => {
    switch (workflowStatus.toUpperCase()) {
      case "ONGOING":
        return "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-30 select-none shadow-xs">
      {/* Left: Back Button & Workflow Name */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Link
          href="/workflows"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          title="Back to Workflows"
        >
          <ArrowLeft weight="bold" className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-gray-900 truncate">
            {workflowName || "Untitled Workflow"}
          </h2>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge()}`}
          >
            {workflowStatus}
          </span>
        </div>
      </div>

      {/* Center: View Switcher (Editor / Worker) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl relative flex-shrink-0">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-xs transition-all duration-300 ease-out z-0 ${
              view === "editor" ? "left-1" : "left-[calc(50%+2px)]"
            }`}
          />

          <button
            type="button"
            onClick={() => onViewChange("editor")}
            className={`relative z-10 px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors w-24 text-center cursor-pointer ${
              view === "editor"
                ? "text-blue-600 font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => onViewChange("worker")}
            className={`flex items-center justify-center gap-2 relative z-10 px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors w-24 text-center cursor-pointer ${
              view === "worker"
                ? "text-blue-600 font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Worker</span>
          </button>
        </div>
      </div>

      {/* Right: Save & Execute Action Buttons */}
      <div className="flex-1 flex justify-end items-center gap-2">
        {/* Credit Balance Badge */}
        <Link
          href="/billing"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80 transition-colors shadow-2xs mr-1"
          title="Available credits (Click to manage billing)"
        >
          <Coins weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
          <span>{creditBalance.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 font-normal">credits</span>
        </Link>

        {/* Save Canvas Button */}
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex-shrink-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 active:scale-95 disabled:opacity-50"
          title="Save workflow nodes and connections"
        >
          {isSaving ? (
            <>
              <CircleNotch className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FloppyDiskBackIcon weight="fill" className="w-3.5 h-3.5 text-gray-600" />
              <span>Save</span>
            </>
          )}
        </button>

        {/* Execute Workflow Button */}
        <button
          type="button"
          onClick={isExecuting ? onStop : onExecute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex-shrink-0 active:scale-95 ${
            isExecuting
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isExecuting ? (
            <>
              <Stop weight="fill" className="w-3.5 h-3.5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play weight="fill" className="w-3.5 h-3.5" />
              <span>Execute</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

