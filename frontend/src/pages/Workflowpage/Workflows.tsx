"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Clock,
  CheckCircle,
  Trash,
  ArrowUpRight,
  Pen,
  MagnifyingGlass,
  Path,
  X,
  WarningCircle,
} from "@phosphor-icons/react";
import CreateWorkflowModal from "./components/CreateWorkflowModal";
import { saveWorkflow } from "@/api/workflow.api";
import { useWorkflowStore, WorkflowItem } from "@/zusstore/workflow.store";
import { WorkflowListSkeleton } from "@/shared/Skeleton";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Workflows() {
  const { workflows, loading, hasLoaded, fetchWorkflows, deleteWorkflow } =
    useWorkflowStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // Sliding tab indicator refs and state
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    return w.status === activeTab;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await deleteWorkflow(id);
    } catch (err) {
      console.error("Failed to delete workflow", err);
    }
  };

  const handleCreate = async (name: string, description: string) => {
    try {
      await saveWorkflow({
        workflowName: name,
        workflowDescription: description,
      });
      setIsModalOpen(false);
      await fetchWorkflows(true);
      // Notice: Do NOT open editor directly; stays on workflows list so user clicks Open Editor
    } catch (err) {
      console.error("Failed to create workflow", err);
    }
  };

  // Status icons
  const getWorkflowIcon = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Clock weight="duotone" className="w-5 h-5" />
          </div>
        );
      case "completed":
        return (
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
            <CheckCircle weight="fill" className="w-5 h-5" />
          </div>
        );
      case "failed":
        return (
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
            <WarningCircle weight="duotone" className="w-5 h-5" />
          </div>
        );
      case "draft":
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Pen weight="duotone" className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Build, run, and monitor end-to-end automation pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer flex-shrink-0 self-start sm:self-auto"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        {/* Controls Bar: Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 pb-2 gap-4 flex-shrink-0 border-b border-gray-100">
          {/* Sliding Tabs */}
          <div className="relative inline-flex items-center p-1 bg-gray-100 rounded-xl select-none self-start">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-xs transition-all duration-200 ease-out pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />

            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  ref={(el) => {
                    tabRefs.current[tab.key] = el;
                  }}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input: text color strictly black */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs text-black placeholder:text-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
          {loading && !hasLoaded ? (
            <WorkflowListSkeleton />
          ) : filteredWorkflows.length === 0 ? (
            /* Context-Specific Empty States */
            workflows.length === 0 ? (
              /* Case 1: No workflows created at all -> Show empty state WITH Add New Workflow button */
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
                  <Path weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  No workflows yet
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  Create your first automation workflow to start executing tasks.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus weight="bold" className="w-4 h-4" />
                  <span>Create Workflow</span>
                </button>
              </div>
            ) : searchQuery ? (
              /* Case 2: Search with no results -> NO Add New Workflow button */
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-2xs">
                  <MagnifyingGlass weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  No workflows found
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  No workflows match &ldquo;{searchQuery}&rdquo;. Try another search term.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              /* Case 3: Tab has no items -> Empty state for that tab WITHOUT Add New Workflow button */
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-2xs">
                  <Path weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 capitalize">
                  No {activeTab} workflows
                </h3>
                <p className="text-xs text-gray-500">
                  There are currently no workflows in the {activeTab} status.
                </p>
              </div>
            )
          ) : (
            /* Workflow List */
            <div
              key={`list-${activeTab}`}
              className="flex flex-col gap-3 animate-in fade-in duration-200"
            >
              {filteredWorkflows.map((w) => {
                const isCompleted = w.status === "completed";
                const isOngoing = w.status === "ongoing";

                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-4 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Icon */}
                      {getWorkflowIcon(w.status)}

                      <div className="flex flex-col min-w-0">
                        {isCompleted ? (
                          <span className="font-semibold text-gray-900 truncate cursor-default">
                            {w.name}
                          </span>
                        ) : (
                          <Link
                            href={`/editor/${w.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                          >
                            {w.name}
                          </Link>
                        )}

                        <span className="text-xs text-gray-500">
                          {isOngoing
                            ? `Running since: ${w.updatedAt}`
                            : isCompleted
                            ? `Completed: ${w.updatedAt}`
                            : `Last edited: ${w.updatedAt}`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isCompleted && (
                        <Link
                          href={`/editor/${w.id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Open Editor</span>
                          <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {!isOngoing && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(w.id, e)}
                          title="Delete workflow"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash weight="bold" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
