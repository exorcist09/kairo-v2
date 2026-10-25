"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Lightning,
  Eye,
  CheckCircle,
  ChartLineUp,
  Coins,
  ArrowRight,
  Key,
  Sparkle,
  XCircle,
  Play,
  KeyIcon,
} from "@phosphor-icons/react";
import CreateWorkflowModal from "../Workflowpage/components/CreateWorkflowModal";
import { saveWorkflow } from "@/api/workflow.api";
import { useBillingStore } from "@/zusstore/billing.store";
import { useCredentialStore } from "@/zusstore/credential.store";
import { useWorkflowStore } from "@/zusstore/workflow.store";
import { useAnalyticsStore } from "@/zusstore/analytics.store";
import {
  HomeStatsCardSkeleton,
  HomePlanCardSkeleton,
  HomeConnectionsCardSkeleton,
} from "@/shared/Skeleton";

const DEFAULT_ANALYTICS_DATA: Record<
  string,
  { points: string; labels: string[]; yAxis: string[]; total: string; successRate: string }
> = {
  Today: {
    points: "0,90 16,90 33,90 50,90 66,90 83,90 100,90",
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
    yAxis: ["10", "8", "5", "2", "0"],
    total: "0",
    successRate: "100%",
  },
  "7 Days": {
    points: "0,90 16,90 33,90 50,90 66,90 83,90 100,90",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    yAxis: ["10", "8", "5", "2", "0"],
    total: "0",
    successRate: "100%",
  },
  "30 Days": {
    points: "0,90 25,90 50,90 75,90 100,90",
    labels: ["Day 1", "Day 8", "Day 15", "Day 22", "Day 30"],
    yAxis: ["10", "8", "5", "2", "0"],
    total: "0",
    successRate: "100%",
  },
};

const TEMPLATES = [
  {
    name: "Webhook Ingestion",
    description: "Listen for external webhooks and pipe validated payloads directly into database.",
  },
  {
    name: "Scheduled Cron Sync",
    description: "Automated recurring pipeline for snapshots, indexing, and cold storage backups.",
  },
  {
    name: "AI Reasoning Pipeline",
    description: "Analyze incoming support logs with Kai AI and dispatch structured Slack alerts.",
  },
];

const formatPlanName = (p?: string) => {
  switch (p) {
    case "SMALL":
      return "Small Tier";
    case "MEDIUM":
      return "Medium Tier";
    case "LARGE":
      return "Large Tier";
    case "CUSTOM":
      return "Custom Plan";
    case "FREE_TIER":
    default:
      return "Free Tier";
  }
};

export default function Home() {
  const [timeFilter, setTimeFilter] = useState<"Today" | "7 Days" | "30 Days">("7 Days");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; description: string } | null>(null);

  const {
    balance: creditBalance,
    plan: userPlan,
    history: billingHistory,
    loading: billingLoading,
    hasLoaded: billingHasLoaded,
    fetchBillingData,
  } = useBillingStore();

  const {
    credentials: connections,
    loading: credLoading,
    hasLoaded: credHasLoaded,
    fetchCredentials,
  } = useCredentialStore();

  const {
    workflows,
    loading: wfLoading,
    hasLoaded: wfHasLoaded,
    fetchWorkflows,
  } = useWorkflowStore();

  const {
    data: analyticsData,
    loading: analyticsLoading,
    hasLoaded: analyticsHasLoaded,
    fetchAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchBillingData(true);
    fetchCredentials();
    fetchWorkflows();
    fetchAnalytics();
  }, [fetchBillingData, fetchCredentials, fetchWorkflows, fetchAnalytics]);

  const totalCreditsConsumed = (billingHistory || [])
    .filter((tx: any) => tx.type === "USAGE")
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount || 0), 0);

  const currentAnalytics =
    analyticsData?.graph?.[timeFilter] || DEFAULT_ANALYTICS_DATA[timeFilter] || DEFAULT_ANALYTICS_DATA["7 Days"];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header (No subheading, nav icons restored as requested) */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>

        <div className="flex items-center gap-3">
          {/* Quick Nav Icons */}
          <div className="flex items-center gap-2">
            <Link
              href="/credentials"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer"
              title="Credentials & API Keys"
            >
              <KeyIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/workflows"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer"
              title="View Workflows"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* New Workflow Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer flex-shrink-0"
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Container with border */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 pb-6">

            {/* Top 4 Stats Cards */}
            {(!wfHasLoaded && wfLoading) || (!analyticsHasLoaded && analyticsLoading) ? (
              <HomeStatsCardSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Workflows */}
                <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm flex-shrink-0 min-h-[140px]">
                  <div className="z-10 relative">
                    <h2 className="text-sm font-bold text-gray-700 mb-1">
                      Total Workflows
                    </h2>
                    <div className="text-4xl font-bold text-gray-900 my-1 font-sans tracking-tight">
                      {analyticsData?.cards.totalWorkflows ?? workflows.length}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Active pipelines
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-2">
                    <Lightning
                      weight="duotone"
                      className="w-24 h-24 text-blue-600 absolute -right-4"
                    />
                  </div>
                </div>

                {/* Executions Today */}
                <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm flex-shrink-0 min-h-[140px]">
                  <div className="z-10 relative">
                    <h2 className="text-sm font-bold text-gray-700 mb-1">
                      Executions Today
                    </h2>
                    <div className="text-4xl font-bold text-gray-900 my-1 font-sans tracking-tight">
                      {(analyticsData?.cards.executionsToday ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {analyticsData?.cards.percentChangeVsYesterday !== null &&
                      analyticsData?.cards.percentChangeVsYesterday !== undefined ? (
                        `${
                          analyticsData.cards.percentChangeVsYesterday >= 0
                            ? `+${analyticsData.cards.percentChangeVsYesterday}%`
                            : `${analyticsData.cards.percentChangeVsYesterday}%`
                        } vs yesterday`
                      ) : (analyticsData?.cards.executionsToday ?? 0) > 0 ? (
                        "Runs logged today"
                      ) : (
                        "No executions today"
                      )}
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-2">
                    <Play
                      weight="duotone"
                      className="w-24 h-24 text-indigo-600 absolute -right-4"
                    />
                  </div>
                </div>

                {/* Success Rate */}
                <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm flex-shrink-0 min-h-[140px]">
                  <div className="z-10 relative">
                    <h2 className="text-sm font-bold text-gray-700 mb-1">
                      Success Rate
                    </h2>
                    <div className="text-4xl font-bold text-gray-900 my-1 font-sans tracking-tight">
                      {analyticsData?.cards.totalExecutions &&
                      analyticsData.cards.totalExecutions > 0
                        ? `${analyticsData.cards.successRate.toFixed(1)}%`
                        : "100.0%"}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {analyticsData?.cards.totalExecutions &&
                      analyticsData.cards.totalExecutions > 0
                        ? `${analyticsData.cards.completedExecutions} of ${analyticsData.cards.totalExecutions} succeeded`
                        : "100% baseline rate"}
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-2">
                    <CheckCircle
                      weight="duotone"
                      className="w-24 h-24 text-emerald-600 absolute -right-4"
                    />
                  </div>
                </div>

                {/* Failed Executions */}
                <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm flex-shrink-0 min-h-[140px]">
                  <div className="z-10 relative">
                    <h2 className="text-sm font-bold text-gray-700 mb-1">
                      Failed Executions
                    </h2>
                    <div className="text-4xl font-bold text-gray-900 my-1 font-sans tracking-tight">
                      {analyticsData?.cards.failedExecutions ?? 0}
                    </div>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      {(analyticsData?.cards.failedExecutions ?? 0) > 0
                        ? "Needs attention"
                        : "All systems operational"}
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-2">
                    <XCircle
                      weight="duotone"
                      className="w-24 h-24 text-red-600 absolute -right-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Execution Analytics Graph with Top-Left Clipped Watermark Icon */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-32 h-32 opacity-10 pointer-events-none text-blue-600">
                <ChartLineUp weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Execution Analytics
                  </h3>
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-gray-500 font-medium">
                    <span>
                      Total runs:{" "}
                      <strong className="text-gray-900 font-semibold">
                        {currentAnalytics.total}
                      </strong>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>
                      Success rate:{" "}
                      <strong className="text-emerald-600 font-semibold">
                        {currentAnalytics.successRate}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Period Filter Tabs: Today | 7 Day | 30 Day */}
                <div className="flex items-center p-1 select-none">
                  {[
                    { id: "Today", label: "Today" },
                    { id: "7 Days", label: "7 Day" },
                    { id: "30 Days", label: "30 Day" },
                  ].map((tab, idx, arr) => {
                    const isActive = timeFilter === tab.id;
                    return (
                      <div key={tab.id} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setTimeFilter(tab.id as "Today" | "7 Days" | "30 Days")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg  cursor-pointer ${
                            isActive
                              ? "bg-blue-50 text-blue-600 shadow-2xs font-bold border border-blue-200/80"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {tab.label}
                        </button>
                        {idx < arr.length - 1 && (
                          <span className="text-gray-300 text-xs px-1 select-none pointer-events-none">|</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Area Chart Container */}
              <div className="z-10 relative h-60 w-full flex items-end pt-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-medium text-gray-400 w-8 select-none">
                  {currentAnalytics.yAxis.map((val, idx) => (
                    <span key={idx}>{val}</span>
                  ))}
                </div>

                {/* Horizontal Grid lines */}
                <div className="absolute left-10 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                  {currentAnalytics.yAxis.slice(0, -1).map((_, i) => (
                    <div key={i} className="w-full border-b border-gray-100 border-dashed" />
                  ))}
                </div>

                {/* SVG Area Chart with Gradient */}
                <div className="absolute left-10 right-0 top-2 bottom-6">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="homeChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`0,100 ${currentAnalytics.points} 100,100`}
                      fill="url(#homeChartGrad)"
                      className="transition-all duration-500 ease-out"
                    />
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      points={currentAnalytics.points}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs font-medium text-gray-400 px-2 select-none">
                  {currentAnalytics.labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Side-by-Side: Plan & Connections with Top-Left Clipped Watermark Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Plan Card */}
              {billingLoading && !billingHasLoaded ? (
                <HomePlanCardSkeleton />
              ) : (
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
                  {/* Top-left clipped watermark icon */}
                  <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                    <Coins weight="duotone" className="w-full h-full" />
                  </div>

                  <div className="z-10 relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">Plan</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
                        {formatPlanName(userPlan)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2 mb-3">
                      <div>
                        <span className="text-3xl font-bold text-gray-900 font-sans tracking-tight">
                          {creditBalance.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-1.5 font-medium">available credits</span>
                      </div>
                      {totalCreditsConsumed > 0 && (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200/60 px-2.5 py-0.5 rounded-full">
                          {totalCreditsConsumed.toLocaleString()} consumed
                        </span>
                      )}
                    </div>

                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              (creditBalance /
                                Math.max(100, creditBalance + totalCreditsConsumed)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      {creditBalance <= 0
                        ? "Balance exhausted. Workflows will pause until credits are added."
                        : "When your balance reaches zero, workflows pause automatically."}
                    </p>
                  </div>

                  <div className="z-10 relative pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400"></span>
                    <Link
                      href="/billing"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Add Credits</span>
                      <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Connections Card */}
              {credLoading && !credHasLoaded ? (
                <HomeConnectionsCardSkeleton />
              ) : (
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
                  {/* Top-left clipped watermark icon */}
                  <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                    <Key weight="duotone" className="w-full h-full" />
                  </div>

                  <div className="z-10 relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">Connections</h3>
                      <Link
                        href="/credentials"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {connections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <span className="text-xs text-gray-400 mb-2">No active connections yet</span>
                        <Link
                          href="/credentials"
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          + Add Credential
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {connections.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-200/60 hover:border-blue-200 transition-colors"
                          >
                            <span className="text-xs font-semibold text-gray-800 truncate mr-1">
                              {item.name || item.provider}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Quick Templates Section with Top-Left Clipped Watermark Icon and 3 Horizontal Cards Without Icons */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-5">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                <Sparkle weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Quick Templates</h2>
              </div>

              {/* 3 cards horizontally without icon */}
              <div className="z-10 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.name}
                    onClick={() => {
                      setSelectedTemplate({ name: tmpl.name, description: tmpl.description });
                      setIsModalOpen(true);
                    }}
                    className="group p-5 rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {tmpl.name}
                        </h4>
                        <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Use <ArrowRight weight="bold" className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        key={isModalOpen ? selectedTemplate?.name || "new" : "closed"}
        isOpen={isModalOpen}
        initialName={selectedTemplate?.name || ""}
        initialDescription={selectedTemplate?.description || ""}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        onCreate={async (name, description) => {
          try {
            await saveWorkflow({
              workflowName: name,
              workflowDescription: description,
            });
            setIsModalOpen(false);
            setSelectedTemplate(null);
            window.location.href = "/workflows";
          } catch (err) {
            console.error("Failed to create workflow from template", err);
          }
        }}
      />
    </div>
  );
}
