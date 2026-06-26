"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Lightning,
  Play,
  CheckCircle,
  XCircle,
  ChartLineUp,
  DotsThree,
  Eye,
  Database,
  Warning,
} from "@phosphor-icons/react";
import CreateWorkflowModal from "../Workflowpage/components/CreateWorkflowModal";

export default function Home() {
  const [timeFilter, setTimeFilter] = useState("7 Days");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>

        <div className="flex items-center gap-4">
          {/* Quick Actions (Circular) */}
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
              title="Connect an App"
            >
              <Lightning className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
              title="View Executions"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
          >
            <Plus weight="bold" className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Main Scrollable Container with border (Billing Style) */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col">
          {/* Centered Content Wrapper */}
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-4">
            {/* Top 4 Stats Cards */}
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
                    <Warning weight="fill" className="w-3 h-3 text-red-500" /> Needs
                    attention
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

            {/* Execution Analytics Graph */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <ChartLineUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Execution Analytics
                  </h3>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 self-start sm:self-auto shadow-sm">
                  {["Today", "7 Days", "30 Days"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeFilter === filter ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full relative flex items-end">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-medium text-gray-400 pb-8 w-10">
                  <span>1,500</span>
                  <span>1,000</span>
                  <span>500</span>
                  <span>0</span>
                </div>

                {/* Grid lines */}
                <div className="absolute left-12 right-0 top-2 bottom-8 flex flex-col justify-between">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-full border-b border-gray-200 border-dashed"
                    ></div>
                  ))}
                </div>

                {/* SVG Area Chart */}
                <div className="absolute left-12 right-0 top-2 bottom-8">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#2563EB"
                          stopOpacity="0.15"
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563EB"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,80 C 10,80 15,60 25,60 C 35,60 40,30 50,30 C 60,30 70,50 80,50 C 90,50 95,20 100,20 L 100,100 L 0,100 Z"
                      fill="url(#gradient)"
                    />
                    <path
                      d="M 0,80 C 10,80 15,60 25,60 C 35,60 40,30 50,30 C 60,30 70,50 80,50 C 90,50 95,20 100,20"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs font-medium text-gray-400 px-2 sm:px-4">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Plan Usage */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-12">
                <h3 className="text-lg font-bold text-gray-900">Plan Usage</h3>
                <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Upgrade <span className="text-lg leading-none">→</span>
                </button>
              </div>

              {/* Semi-circle gauge */}
              <div className="relative w-72 h-36 flex items-end justify-center mb-8">
                <svg
                  className="absolute top-0 left-0 w-full h-full overflow-visible"
                  viewBox="0 0 100 50"
                >
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#EFF6FF"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="8"
                    strokeDasharray="125.6"
                    strokeDashoffset="82.89"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10 flex flex-col items-center mb-[-8px]">
                  <span className="text-5xl font-bold text-gray-900 tracking-tight mb-1">
                    34%
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    Total Used
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between w-full max-w-md mt-6 pt-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <span className="text-xs font-bold text-gray-900 uppercase">
                      Used
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">3,412</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-100"></div>
                    <span className="text-xs font-bold text-gray-900 uppercase">
                      Available
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">6,588</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      Total Limit
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">
                    10,000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(name, description) => {
          console.log("Create workflow:", name, description);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
