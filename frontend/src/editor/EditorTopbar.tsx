"use client";

import Link from "next/link";
import { Play, Stop, ArrowLeft, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";

interface EditorTopbarProps {
  workflowName?: string;
  view: "editor" | "worker";
  onViewChange: (v: "editor" | "worker") => void;
  isExecuting: boolean;
  onExecute: () => void;
  onStop: () => void;
}

export default function EditorTopbar({
  workflowName,
  view,
  onViewChange,
  isExecuting,
  onExecute,
  onStop,
}: EditorTopbarProps) {
  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-30 select-none shadow-xs">
      {/* Left: Back Button Only */}
      <div className="flex-1 flex items-center min-w-0">
        <Link
          href="/workflows"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          title="Back to Workflows"
        >
          <ArrowLeft weight="bold" className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      {/* Center: View Switcher (Editor / Worker) + Disabled Kai AI Button Outside Selector */}
      <div className="flex items-center gap-3">
        {/* Editor / Worker Selector */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl relative flex-shrink-0">
          {/* Sliding background */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-xs transition-all duration-300 ease-out z-0 ${
              view === "editor" ? "left-1" : "left-[calc(50%+2px)]"
            }`}
          />

          <button
            type="button"
            onClick={() => onViewChange("editor")}
            className={`relative z-10 px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors w-24 text-center cursor-pointer ${
              view === "editor" ? "text-blue-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => onViewChange("worker")}
            className={`relative z-10 px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors w-24 text-center cursor-pointer ${
              view === "worker" ? "text-blue-600 font-bold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Worker
          </button>
        </div>

        {/* Disabled Kai AI button outside selector */}
        <button
          type="button"
          disabled
          title="Kai AI workflow builder — Coming soon"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-400 text-xs font-medium cursor-not-allowed opacity-75 shadow-2xs select-none"
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M 44.5 11.2 Q 50 8 55.5 11.2 L 82.5 26.8 Q 88 30 88 36 L 88 64 Q 88 70 82.5 73.2 L 55.5 88.8 Q 50 92 44.5 88.8 L 17.5 73.2 Q 12 70 12 64 L 12 36 Q 12 30 17.5 26.8 Z M 51.8 32.3 Q 56 30 60.2 32.4 L 82.5 45.0 Q 86 47 81.5 49.5 L 48.2 67.7 Q 44 70 39.8 67.6 L 17.5 55.0 Q 14 53 18.5 50.5 Z"
                fill="#000000"
              />
            </svg>
          </div>
          <span className="text-gray-700 font-bold text-xs">Kai</span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
            Coming Soon
          </span>
        </button>
      </div>

      {/* Right: Single Execute / Stop Button */}
      <div className="flex-1 flex justify-end items-center">
        <button
          type="button"
          onClick={isExecuting ? onStop : onExecute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex-shrink-0 ${
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
