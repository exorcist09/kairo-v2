"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";
import CreateWorkflowModal from "../Workflowpage/components/CreateWorkflowModal";

const ANALYTICS_DATA: Record<
  string,
  { points: string; labels: string[]; total: string; successRate: string }
> = {
  Today: {
    points: "0,75 15,70 30,55 45,60 60,35 75,40 90,20 100,15",
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
    total: "348",
    successRate: "99.1%",
  },
  "7 Days": {
    points: "0,80 15,65 30,58 45,35 60,42 75,25 90,30 100,18",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    total: "1,284",
    successRate: "99.4%",
  },
  "30 Days": {
    points: "0,85 15,75 30,60 45,50 60,45 75,30 90,25 100,12",
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    total: "5,412",
    successRate: "98.9%",
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

export default function Home() {
  const [timeFilter, setTimeFilter] = useState<"Today" | "7 Days" | "30 Days">("7 Days");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; description: string } | null>(null);

  const currentAnalytics = ANALYTICS_DATA[timeFilter] || ANALYTICS_DATA["7 Days"];

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
              <Lightning className="w-4 h-4" />
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

            {/* Top 4 Stats Cards (Exact Git Commit Structure) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Workflows */}
              <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm flex-shrink-0 min-h-[140px]">
                <div className="z-10 relative">
                  <h2 className="text-sm font-bold text-gray-700 mb-1">
                    Total Workflows
                  </h2>
                  <div className="text-4xl font-bold text-gray-900 my-1 font-sans tracking-tight">
                    24
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    +3 this month
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
                    1,284
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    +12% vs yesterday
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
                    98.4%
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    ↑ 1.2% this week
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
                    7
                  </div>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    Needs attention
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

            {/* Execution Analytics Graph with Top-Left Clipped Watermark Icon */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-32 h-32 opacity-10 pointer-events-none text-blue-600">
                <ChartLineUp weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Execution Analytics
                </h3>

                {/* Period Filter Tabs */}
                <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/60 self-start sm:self-auto">
                  {(["Today", "7 Days", "30 Days"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        timeFilter === filter
                          ? "bg-white text-blue-600 shadow-xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Chart Container */}
              <div className="z-10 relative h-60 w-full flex items-end pt-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-medium text-gray-400 w-8 select-none">
                  <span>1.5k</span>
                  <span>1.0k</span>
                  <span>500</span>
                  <span>0</span>
                </div>

                {/* Horizontal Grid lines */}
                <div className="absolute left-10 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                  {[1, 2, 3, 4].map((i) => (
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
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <Coins weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Plan</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
                      Starter Plan
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2 mb-3">
                    <div>
                      <span className="text-3xl font-bold text-gray-900 font-sans tracking-tight">649</span>
                      <span className="text-xs text-gray-500 ml-1.5 font-medium">/ 1,000 available credits</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: "34%" }} />
                  </div>

                  <p className="text-xs text-gray-500">
                    When your balance reaches zero, workflows pause automatically.
                  </p>
                </div>

                <div className="z-10 relative pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Renews Oct 31, 2026</span>
                  <Link
                    href="/billing"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Add Credits</span>
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Connections Card */}
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

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { name: "OpenAI", status: "Active" },
                      { name: "Stripe", status: "Active" },
                      { name: "GitHub", status: "Active" },
                      { name: "Slack", status: "Active" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-200/60 hover:border-blue-200 transition-colors"
                      >
                        <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
        onCreate={(_name, _description) => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
          window.location.href = "/workflows";
        }}
      />
    </div>
  );
}
