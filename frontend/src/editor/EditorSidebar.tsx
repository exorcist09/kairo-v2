"use client";

import Image from "next/image";
import { Rectangle, Circle, Triangle } from "@phosphor-icons/react";

export default function EditorSidebar() {
  return (
    <div className="w-64 h-full bg-gray-50 flex flex-col border-r border-gray-200 flex-shrink-0 z-20">
      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Available Nodes</div>
        
        {/* Placeholder Nodes */}
        <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center gap-3 cursor-grab hover:border-blue-400 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
          <Rectangle weight="fill" className="w-5 h-5 text-blue-500" />
          Trigger
        </div>
        <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center gap-3 cursor-grab hover:border-blue-400 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
          <Circle weight="fill" className="w-5 h-5 text-purple-500" />
          Action
        </div>
      </div>

      {/* Bottom: Logo */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-center">
        <Image src="/Kairo.png" alt="Logo" width={100} height={32} className="h-6 w-auto brightness-0 opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
