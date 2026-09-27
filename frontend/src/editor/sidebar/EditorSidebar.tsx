"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Coins, MagnifyingGlass, X } from "@phosphor-icons/react";
import { SidebarNodeItem, TriggerNodes, ExecutionNodes } from "./SidebarNodes";

export type { SidebarNodeItem, SidebarNodeItem as NodePaletteItem };

interface EditorSidebarProps {
  onAddNode: (item: SidebarNodeItem) => void;
}

export default function EditorSidebar({ onAddNode }: EditorSidebarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      searchInputRef.current?.focus();
    }
  }, [isSearching]);

  const handleDragStart = (e: React.DragEvent, item: SidebarNodeItem) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const query = searchQuery.toLowerCase().trim();
  const filterNode = (item: SidebarNodeItem) =>
    !query ||
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.type.toLowerCase().includes(query);

  const filteredTriggers = TriggerNodes.filter(filterNode);
  const filteredExecutions = ExecutionNodes.filter(filterNode);
  const hasResults = filteredTriggers.length > 0 || filteredExecutions.length > 0;

  const renderNodeCard = (item: SidebarNodeItem) => {
    const IconComponent = item.icon;
    const isTrigger = item.category === "trigger";
    const iconColor = isTrigger ? "text-blue-600" : "text-purple-600";

    return (
      <div
        key={item.type}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onClick={() => onAddNode(item)}
        className="group bg-white border border-gray-200/80 hover:border-gray-400 hover:shadow-xs p-3 rounded-xl flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing transition-all select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Grey background with blue (trigger) or purple (execution) icon */}
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200/60">
            <IconComponent weight="bold" className={`w-4 h-4 ${iconColor}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-black transition-colors">
                {item.title}
              </h5>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold flex-shrink-0">
                <Coins weight="duotone" className="w-3 h-3 text-emerald-600" />
                <span>{item.cost}</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {item.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddNode(item);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all flex-shrink-0 cursor-pointer"
          title="Add to canvas"
          aria-label={`Add ${item.title} to canvas`}
        >
          <Plus weight="bold" className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-72 h-full bg-white flex flex-col border-r border-gray-200 flex-shrink-0 z-20 select-none">
      {/* Header with Expandable Search */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between min-h-[50px] relative">
        {isSearching ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
            <MagnifyingGlass weight="bold" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleClearSearch();
                }
              }}
              placeholder="Search nodes..."
              className="flex-1 text-xs bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Close search"
              aria-label="Close search"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Node Library
              </span>
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {TriggerNodes.length + ExecutionNodes.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Search nodes"
              aria-label="Search nodes"
            >
              <MagnifyingGlass weight="bold" className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3">
        <p className="text-[11px] text-gray-400 font-medium px-1">
          Drag to canvas or click to add
        </p>

        {!hasResults ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 gap-2">
            <MagnifyingGlass weight="light" className="w-8 h-8 text-gray-300" />
            <p className="text-xs font-medium text-gray-600">No nodes found</p>
            <p className="text-[11px] text-gray-400">
              No nodes match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-2 text-xs text-gray-700 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {/* Trigger Nodes Section */}
            {filteredTriggers.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center px-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    {/* <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> */}
                    Trigger Nodes
                  </span>
                </div>
                {filteredTriggers.map(renderNodeCard)}
              </div>
            )}

            {/* Execution Nodes Section */}
            {filteredExecutions.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center px-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    {/* <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" /> */}
                    Execution Nodes
                  </span>
                </div>
                {filteredExecutions.map(renderNodeCard)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom: Logo */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-center bg-gray-50/50">
        <Image
          src="/Kairo.png"
          alt="Kairo Logo"
          width={90}
          height={28}
          className="h-5 w-auto brightness-0 opacity-40 hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  );
}
