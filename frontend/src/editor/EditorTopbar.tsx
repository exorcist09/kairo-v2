"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Stop, ArrowLeft } from "@phosphor-icons/react";

export default function EditorTopbar() {
  const [view, setView] = useState<"editor" | "worker">("editor");

  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
      <div className="flex-1 flex items-center ">
        <Link
          href="/workflows"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500  transition-colors mr-2"
          title="Back to Workflows"
        >
          <span className="flex items-center justify-center gap-3 ml-6 rounded-lg p-2 hover:text-gray-900 hover:bg-gray-100">
          <ArrowLeft weight="bold" className="w-5 h-5" />
          <span className="font-semibold text-gray-900">Back</span>
          </span>
        </Link>
      </div>

      {/* Center: Switcher */}
      <div className="flex items-center bg-gray-100 p-1 rounded-lg relative">
        {/* Sliding background */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-300 ease-out z-0 ${
            view === "editor" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />

        <button
          onClick={() => setView("editor")}
          className={`relative z-10 px-6 py-1.5 rounded-md text-sm font-semibold transition-colors w-24 text-center ${
            view === "editor"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setView("worker")}
          className={`relative z-10 px-6 py-1.5 rounded-md text-sm font-semibold transition-colors w-24 text-center ${
            view === "worker"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Worker
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex justify-end items-center gap-3">
        <button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Play weight="fill" className="w-4 h-4" />
          Execute
        </button>
        <button className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-100">
          <Stop weight="fill" className="w-4 h-4" />
          Stop
        </button>
      </div>
    </div>
  );
}
