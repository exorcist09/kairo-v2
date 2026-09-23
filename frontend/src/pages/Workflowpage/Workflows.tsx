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
} from "@phosphor-icons/react";
import CreateWorkflowModal from "./components/CreateWorkflowModal";

type Workflow = {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "ongoing" | "completed";
  updatedAt: string;
};

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "1",
    name: "Data Ingestion Pipeline",
    description: "Syncs customer events from Stripe webhook directly into analytics database.",
    status: "draft",
    updatedAt: "2 mins ago",
  },
  {
    id: "2",
    name: "Nightly Database Backup",
    description: "Generates compressed PostgreSQL snapshots and uploads to encrypted S3 bucket.",
    status: "ongoing",
    updatedAt: "1 hour ago",
  },
  {
    id: "3",
    name: "Customer Onboarding",
    description: "Sends welcome email via Resend, sets up Slack notification, and provisions workspace.",
    status: "completed",
    updatedAt: "Yesterday",
  },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCreate = (name: string, description: string) => {
    const newWf: Workflow = {
      id: Date.now().toString(),
      name: name,
      description: description,
      status: "draft",
      updatedAt: "Just now",
    };
    setWorkflows([newWf, ...workflows]);
    setIsModalOpen(false);
  };

  // Original status icons
  const getWorkflowIcon = (status: Workflow["status"]) => {
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
            Manage your automated pipelines and active executions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-64 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer flex-shrink-0"
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Main Container with Border */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        {/* Filter Navigation Tabs with Smooth Sliding Pill */}
        <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div className="relative flex items-center p-1 bg-gray-200/60 rounded-xl border border-gray-200/70">
            {/* Smooth Sliding Pill Indicator */}
            {indicatorStyle.width > 0 && (
              <div
                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-xs border border-gray-200/90 transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                }}
              />
            )}

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
                  className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer select-none ${
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Area: Smooth fade-in on tab change */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {filteredWorkflows.length === 0 ? (
            /* Empty State */
            <div
              key={`empty-${activeTab}`}
              className="flex-1 h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-auto animate-in fade-in duration-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
                <Path weight="duotone" className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {searchQuery ? "No matching workflows" : "No Workflows Yet"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search query or clear the filter."
                  : "Create your first workflow to automate tasks with visual logic."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus weight="bold" className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            </div>
          ) : (
            /* Direct List with smooth animation */
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
                        {/* Title: Only clickable if not completed */}
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
                      {/* Open Editor (Only for Draft and Ongoing, never completed) */}
                      {!isCompleted && (
                        <Link
                          href={`/editor/${w.id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Open Editor</span>
                          <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* Delete Button (Only for Draft and Completed, never ongoing) */}
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
