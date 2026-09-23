"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
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
} from "@phosphor-icons/react";

export interface WorkflowNodeData {
  title: string;
  subtitle: string;
  category: "trigger" | "action" | "ai" | "logic";
  iconName: string;
  config?: Record<string, any>;
  status?: "idle" | "running" | "success" | "error";
  onDelete?: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  webhook: Lightning,
  cron: Clock,
  database: Database,
  ai: Sparkle,
  email: EnvelopeSimple,
  slack: ChatCircleDots,
  http: Globe,
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
  const IconComponent = ICON_MAP[nodeData.iconName] || Lightning;
  const catStyle = CATEGORY_STYLES[nodeData.category] || CATEGORY_STYLES.trigger;
  const status = nodeData.status || "idle";

  return (
    <div
      className={`relative group min-w-[260px] max-w-[320px] rounded-2xl bg-white border transition-all duration-200 select-none shadow-xs ${
        selected
          ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
          : status === "running"
          ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-md animate-pulse"
          : status === "success"
          ? "border-emerald-500/80 shadow-xs"
          : status === "error"
          ? "border-red-500 ring-2 ring-red-500/20 shadow-xs"
          : "border-gray-200/90 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Input Handle (Left) - omitted on root trigger if desired, but flexible for all */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-white !border-2 !border-blue-600 !-left-2 hover:!scale-125 transition-transform"
      />

      {/* Node Card Content */}
      <div className="p-4 flex flex-col gap-2.5">
        {/* Header: Icon, Category Pill, Status indicator */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl ${catStyle.iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}
            >
              <IconComponent weight="duotone" className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catStyle.badge}`}
            >
              {catStyle.text}
            </span>
          </div>

          {/* Status or Delete icon on hover */}
          <div className="flex items-center gap-1.5">
            {status === "running" ? (
              <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            ) : status === "success" ? (
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
            ) : status === "error" ? (
              <XCircle weight="fill" className="w-4 h-4 text-red-500" />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onDelete?.(id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Delete node"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">
            {nodeData.title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {nodeData.subtitle}
          </p>
        </div>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-white !border-2 !border-blue-600 !-right-2 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CustomNode);
