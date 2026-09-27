"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
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
  WebhooksLogoIcon,
  GearIcon,
  BrowserIcon,
  BrowsersIcon,
  SquareIcon,
  FileIcon,
  TextT,
  CaretDown,
} from "@phosphor-icons/react";
import { NodeType } from "@/utils/constants";

export interface WorkflowNodeData {
  title: string;
  subtitle: string;
  description?: string;
  category: "trigger" | "action" | "ai" | "logic";
  iconName: string;
  type?: NodeType | string;
  browserUrl?: string;
  httpMethod?: string;
  endpointUrl?: string;
  requestBody?: string;
  formUrl?: string;
  outputData?: any;
  textValue?: string;
  apiEndpoint?: string;
  emailAddress?: string;
  config?: Record<string, any>;
  status?: "idle" | "running" | "success" | "error";
  onDelete?: (id: string) => void;
  onExecute?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  onChangeText?: (id: string, text: string) => void;
  onChangeMethod?: (id: string, method: string) => void;
}

const ICON_MAP: Record<string, any> = {
  webhook: WebhooksLogoIcon,
  cron: Clock,
  database: Database,
  postgres: Database,
  ai: Sparkle,
  openai: Sparkle,
  gemini: Sparkle,
  email: EnvelopeSimple,
  slack: ChatCircleDots,
  http: BrowsersIcon,
  http_trigger: BrowsersIcon,
  manual_trigger: Play,
  branch: GitBranch,
  browser: Globe,
  diamond: SquareIcon,
  output: SquareIcon,
  text: TextT,
  google_form: FileIcon,
  form: FileIcon,
};

function CustomNode({ id, data, selected }: any) {
  const nodeData = data as WorkflowNodeData;
  const iconKey = (nodeData.iconName || "").toLowerCase();
  const IconComponent = ICON_MAP[iconKey] || Lightning;
  const status = nodeData.status || "idle";

  const isHttpRequest =
    iconKey === "http" ||
    nodeData.type === NodeType.HTTP_REQUEST ||
    (nodeData.type === NodeType.HTTP_TRIGGER && iconKey !== "browser");

  return (
    <div
      className={`relative group w-[170px] rounded-xl bg-white border transition-all duration-200 select-none shadow-xs ${
        selected
          ? "border-blue-600 ring-2 ring-blue-500/20"
          : status === "running"
            ? "border-2 border-blue-600 ring-2 ring-blue-500/30 animate-pulse"
            : status === "success"
              ? "border-emerald-500/80"
              : status === "error"
                ? "border-2 border-dashed border-red-500 ring-2 ring-red-500/20 animate-pulse"
                : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-600 !-left-1 hover:!scale-125 transition-transform"
      />

      {/* Node Card Content */}
      <div className="p-2 flex flex-col gap-1.5">
        {/* Top row: icon | setting | delete | play */}
        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gray-100">
          <div className="w-5 h-5 rounded-md bg-blue-50/70 text-blue-700 border border-blue-200/60 flex items-center justify-center flex-shrink-0">
            <IconComponent weight="duotone" className="w-3 h-3" />
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Setting button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onOpenSettings?.(id);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <GearIcon className="w-3 h-3" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onDelete?.(id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Delete node"
              aria-label="Delete node"
            >
              <Trash className="w-3 h-3" />
            </button>

            {/* Play button or Status indicator */}
            {/* {status === "running" ? (
              <div className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin ml-0.5" />
            ) : status === "success" ? (
              <CheckCircle
                weight="fill"
                className="w-3.5 h-3.5 text-emerald-500"
              />
            ) : status === "error" ? (
              <XCircle weight="fill" className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onExecute?.(id);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title="Run step"
                aria-label="Run step"
              >
                <Play
                  weight="fill"
                  className="w-3 h-3 text-gray-500 hover:text-blue-600"
                />
              </button>
            )} */}
          </div>
        </div>

        {/* Title */}
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold text-gray-900 leading-tight truncate">
            {nodeData.title}
          </h4>

          {/* HTTP Request: Only a dropdown of methods on the node */}
          {isHttpRequest && (
            <div className="mt-1">
              <div className="relative">
                <select
                  value={nodeData.httpMethod || "GET"}
                  onChange={(e) => {
                    nodeData.onChangeMethod?.(id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="nodrag nowheel w-full bg-gray-50 hover:bg-white text-gray-800 text-[10px] font-bold py-1 px-2 rounded-md border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 cursor-pointer appearance-none pr-5 transition-colors"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <CaretDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Browser Trigger: Browser URL badge */}
          {iconKey === "browser" && (
            <div className="mt-1 flex items-center gap-1 text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200/50 truncate">
              <span className="truncate text-gray-600 font-mono">
                {nodeData.browserUrl || "https://..."}
              </span>
            </div>
          )}


          {/* Output Node: Vertically bigger box */}
          {(iconKey === "diamond" || iconKey === "output" || nodeData.type === NodeType.OUTPUT) && (
            <div className="mt-1">
              <div
                title={
                  nodeData.outputData
                    ? typeof nodeData.outputData === "string"
                      ? nodeData.outputData
                      : JSON.stringify(nodeData.outputData)
                    : '{"status": 200, "result": "ok"}'
                }
                className="bg-gray-900 text-emerald-400 font-mono text-[9px] p-2 rounded-lg border border-gray-800 shadow-inner h-24 overflow-y-auto no-scrollbar whitespace-pre-wrap break-all leading-relaxed"
              >
                {nodeData.outputData
                  ? typeof nodeData.outputData === "string"
                    ? nodeData.outputData
                    : JSON.stringify(nodeData.outputData, null, 2)
                  : '{\n  "status": 200,\n  "result": "ok"\n}'}
              </div>
            </div>
          )}

          {/* Text Node: Directly editable on the node */}
          {(iconKey === "text" || nodeData.type === NodeType.TEXT) && (
            <div className="mt-1">
              <textarea
                value={nodeData.textValue ?? ""}
                onChange={(e) => {
                  nodeData.onChangeText?.(id, e.target.value);
                }}
                placeholder="Type text here..."
                rows={3}
                className="nodrag nowheel w-full bg-gray-50 hover:bg-white focus:bg-white text-gray-800 font-sans text-[10px] p-1.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all resize-none leading-tight"
              />
            </div>
          )}
        </div>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-600 !-right-1 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CustomNode);
