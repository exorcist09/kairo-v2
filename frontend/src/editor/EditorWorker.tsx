"use client";

import { useState } from "react";
import {
  CheckCircle,
  Play,
  Stop,
  Copy,
  Check,
  Clock,
  Terminal,
  ArrowsClockwise,
  Coins,
} from "@phosphor-icons/react";

interface EditorWorkerProps {
  workflowName: string;
  isExecuting: boolean;
  onExecute: () => void;
  onStop?: () => void;
}

const SAMPLE_PAYLOAD = {
  event: "charge.succeeded",
  id: "evt_3N4k29Jks912kL",
  created: 1716542400,
  data: {
    object: {
      id: "ch_9X123kL",
      amount: 4900,
      currency: "usd",
      customer: "cus_P92kL1",
      billing_details: {
        email: "alex@acme.inc",
        name: "Alex Vance",
      },
      status: "succeeded",
    },
  },
  database_sync: {
    table: "orders",
    rows_affected: 1,
    query_duration_ms: 18,
  },
  slack_alert: {
    channel: "#sales-pipeline",
    delivered: true,
  },
};

export default function EditorWorker({
  workflowName,
  isExecuting,
  onExecute,
  onStop,
}: EditorWorkerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "payload">("logs");

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden select-none p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Top Worker Status Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              {isExecuting ? (
                <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              ) : (
                <CheckCircle weight="fill" className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {workflowName}
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  Worker Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                <span>Last run: Just now</span>
                <span>•</span>
                <span>Latency: 240ms</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Coins weight="bold" className="w-3.5 h-3.5" /> 1 credit consumed
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={isExecuting ? onStop : onExecute}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer self-start sm:self-auto ${
              isExecuting
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isExecuting ? (
              <>
                <Stop weight="fill" className="w-4 h-4" />
                <span>Stop Worker</span>
              </>
            ) : (
              <>
                <Play weight="fill" className="w-4 h-4" />
                <span>Re-run Worker</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Switcher: Logs vs Payload */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200/90 shadow-xs flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Execution Logs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("payload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "payload"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Payload Inspector
              </button>
            </div>

            {activeTab === "payload" && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied JSON</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {activeTab === "logs" ? (
              <div className="flex flex-col gap-3 font-mono text-xs text-gray-700">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-400 select-none">03:30:10.102</span>
                  <span className="text-blue-600 font-bold">[TRIGGER]</span>
                  <span>Webhook event received from Stripe webhook endpoint (2.4 KB)</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-400 select-none">03:30:10.145</span>
                  <span className="text-purple-600 font-bold">[TRANSFORM]</span>
                  <span>Extracted order ID: ch_9X123kL, customer: alex@acme.inc</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-400 select-none">03:30:10.220</span>
                  <span className="text-emerald-600 font-bold">[DATABASE]</span>
                  <span>SQL INSERT executed successfully on postgres_cluster (18ms)</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-400 select-none">03:30:10.342</span>
                  <span className="text-amber-600 font-bold">[SLACK]</span>
                  <span>Posted notification to #sales-pipeline (HTTP 200 OK)</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 font-semibold">
                  <span className="text-emerald-500 select-none">03:30:10.344</span>
                  <span>Pipeline run completed successfully in 242ms with 0 errors.</span>
                </div>
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-gray-950 text-gray-100 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
