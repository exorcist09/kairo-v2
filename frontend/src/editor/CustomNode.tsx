"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Lightning,
  Clock,
  Database,
  Sparkle,
  EnvelopeSimple,
  ChatCircleDots,
  Globe,
  GitBranch,
  CheckCircle,
  XCircle,
  Trash,
  Play,
} from "@phosphor-icons/react";

export interface WorkflowNodeData {
  title: string;
  subtitle: string;
  category: "trigger" | "action" | "ai" | "logic";
  iconName: string;
  config?: Record<string, any>;
  status?: "idle" | "running" | "success" | "error";
  onDelete?: (id: string) => void;
  onExecute?: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  webhook: Lightning,
  cron: Clock,
  database: Database,
  postgres: Database,
  ai: Sparkle,
  openai: Sparkle,
  gemini: Sparkle,
  email: EnvelopeSimple,
  slack: ChatCircleDots,
  http: Globe,
  http_trigger: Globe,
  manual_trigger: Play,
  branch: GitBranch,
};

const CATEGORY_STYLES: Record<
  WorkflowNodeData["category"],
  { badge: string; iconBg: string; text: string }
> = {
  trigger: {
    badge: "bg-blue-50 text-blue-700 border-blue-200/70",
    iconBg: "bg-blue-50 text-blue-600",
    text: "Trigger",
  },
  action: {
    badge: "bg-purple-50 text-purple-700 border-purple-200/70",
    iconBg: "bg-purple-50 text-purple-600",
    text: "Action",
  },
  ai: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
    iconBg: "bg-amber-50 text-amber-600",
    text: "AI Agent",
  },
  logic: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    iconBg: "bg-emerald-50 text-emerald-600",
    text: "Logic",
  },
};

function CustomNode({ id, data, selected }: any) {
  const nodeData = data as WorkflowNodeData;
  const iconKey = (nodeData.iconName || "").toLowerCase();
  const IconComponent = ICON_MAP[iconKey] || Lightning;
  const catStyle = CATEGORY_STYLES[nodeData.category] || CATEGORY_STYLES.trigger;
  const status = nodeData.status || "idle";

  return (
    <div
      className={`relative group w-[210px] rounded-xl bg-white border transition-all duration-200 select-none shadow-xs ${
        selected
          ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
          : status === "running"
            ? "border-indigo-500 ring-3 ring-indigo-500/20 shadow-md animate-pulse"
            : status === "success"
              ? "border-emerald-500/80 shadow-xs"
              : status === "error"
                ? "border-red-500 ring-2 ring-red-500/20 shadow-xs"
                : "border-gray-200 hover:border-gray-300 hover:shadow-xs"
      }`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-blue-600 !-left-1.5 hover:!scale-125 transition-transform"
      />

      {/* Node Card Content (Compact) */}
      <div className="p-2.5 flex flex-col gap-2">
        {/* Header: Icon, Category Pill, Play & Delete Actions */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-6 h-6 rounded-md ${catStyle.iconBg} flex items-center justify-center flex-shrink-0`}
            >
              <IconComponent weight="duotone" className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${catStyle.badge} truncate`}
            >
              {catStyle.text}
            </span>
          </div>

          {/* Action buttons: Play test button + Status/Delete */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onExecute?.(id);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
              title="Run step"
              aria-label="Run step"
            >
              <Play weight="fill" className="w-3 h-3 text-gray-500 hover:text-blue-600" />
            </button>

            {status === "running" ? (
              <div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin ml-0.5" />
            ) : status === "success" ? (
              <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
            ) : status === "error" ? (
              <XCircle weight="fill" className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onDelete?.(id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                title="Delete node"
                aria-label="Delete node"
              >
                <Trash className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
            {nodeData.title}
          </h4>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
            {nodeData.subtitle}
          </p>
        </div>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-blue-600 !-right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CustomNode);
