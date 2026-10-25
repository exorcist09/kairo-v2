"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Lightning,
  Database,
  Sparkle,
  Brain,
  ChatCircleDots,
  EnvelopeSimple,
  Globe,
  Trash,
  WebhooksLogoIcon,
  GearIcon,
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

  // Backend Node Data fields
  prompt?: string;
  urlForm?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string> | string;
  body?: Record<string, any> | string;
  credentialId?: string;
  model?: string;
  temperature?: number;
  from?: string;
  to?: string;
  subject?: string;
  query?: string;
  formUrl?: string;
  formId?: string;
  fields?: Array<{ questionId: string; title: string; type: string; options?: string[] }>;
  values?: Record<string, unknown>;
  channel?: string;
  message?: string;

  // Legacy / UI compat fields
  browserUrl?: string;
  httpMethod?: string;
  endpointUrl?: string;
  requestBody?: string;
  outputData?: any;
  textValue?: string;
  emailAddress?: string;

  status?: "idle" | "running" | "success" | "error";
  isCompletedWorkflow?: boolean;
  onDelete?: (id: string) => void;
  onExecute?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  onChangeText?: (id: string, text: string) => void;
  onChangeMethod?: (id: string, method: string) => void;
}

const ICON_MAP: Record<string, any> = {
  webhook: WebhooksLogoIcon,
  webhook_trigger: WebhooksLogoIcon,
  database: Database,
  postgres: Database,
  postgres_executer: Database,
  ai: Sparkle,
  claude: Sparkle,
  claude_executer: Sparkle,
  openai: Sparkle,
  openai_executer: Sparkle,
  gemini: Brain,
  gemini_executer: Brain,
  email: EnvelopeSimple,
  email_executer: EnvelopeSimple,
  slack: ChatCircleDots,
  slack_executer: ChatCircleDots,
  http: Globe,
  http_trigger: Globe,
  browser: Globe,
  browser_trigger: Globe,
  output: SquareIcon,
  input: TextT,
  input_trigger: TextT,
  google_form: FileIcon,
  google_form_executer: FileIcon,
};

export function formatCleanOutput(outputData: any): string {
  if (outputData === undefined || outputData === null) {
    return "No output yet. Run workflow to see results.";
  }
  if (typeof outputData === "string") {
    return outputData.trim() || "No output yet. Run workflow to see results.";
  }
  if (typeof outputData === "number" || typeof outputData === "boolean") {
    return String(outputData);
  }

  // Extract from known result shapes
  if (outputData.response && typeof outputData.response === "string") {
    return outputData.response;
  }
  if (outputData.prompt && typeof outputData.prompt === "string") {
    return outputData.prompt;
  }
  if (outputData.content !== undefined) {
    return typeof outputData.content === "string"
      ? outputData.content
      : JSON.stringify(outputData.content, null, 2);
  }
  if (outputData.text && typeof outputData.text === "string") {
    return outputData.text;
  }
  if (outputData.title && typeof outputData.title === "string") {
    return outputData.title;
  }
  if (outputData.query && typeof outputData.query === "string") {
    return `Executed SQL:\n${outputData.query}`;
  }
  if (Array.isArray(outputData.rows)) {
    return `${outputData.rowCount ?? outputData.rows.length} rows returned:\n` + JSON.stringify(outputData.rows, null, 2);
  }
  if (
    outputData.result &&
    typeof outputData.result === "string" &&
    outputData.result !== "ready" &&
    outputData.result !== "ok"
  ) {
    return outputData.result;
  }

  // If object with single string value, extract that directly
  const values = Object.values(outputData);
  if (values.length === 1 && typeof values[0] === "string") {
    return values[0];
  }

  return JSON.stringify(outputData, null, 2);
}

function CustomNode({ id, data, selected }: any) {
  const nodeData = data as WorkflowNodeData;
  const iconKey = (nodeData.iconName || "").toLowerCase();
  const IconComponent =
    ICON_MAP[iconKey] ||
    ICON_MAP[String(nodeData.type || "").toLowerCase()] ||
    Lightning;
  const status = nodeData.status || "idle";

  const isHttpRequest =
    iconKey === "http" || nodeData.type === NodeType.HTTP_TRIGGER;

  const isOutput =
    iconKey === "output" ||
    iconKey === "diamond" ||
    nodeData.type === NodeType.OUTPUT;

  const isInput =
    iconKey === "input" || nodeData.type === NodeType.INPUT_TRIGGER;

  const isBrowser =
    iconKey === "browser" || nodeData.type === NodeType.BROWSER_TRIGGER;

  const isAI =
    nodeData.type === NodeType.CLAUDE_EXECUTER ||
    nodeData.type === NodeType.OPENAI_EXECUTER ||
    nodeData.type === NodeType.GEMINI_EXECUTER;

  // Node border colors matching user requirements:
  // - Currently running: GREEN (border-emerald-500)
  // - Done / success: GREY (border-gray-400)
  // - Failed / error: RED (border-red-500)
  // - Idle: default (border-gray-200)
  const borderClass =
    status === "running"
      ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"
      : status === "success"
        ? "border-2 border-gray-400"
        : status === "error"
          ? "border-2 border-red-500 ring-2 ring-red-500/20"
          : selected
            ? "border-2 border-blue-600 ring-2 ring-blue-500/20"
            : "border border-gray-200 hover:border-gray-300";

  return (
    <div
      className={`relative group w-[185px] rounded-xl bg-white transition-all duration-200 select-none shadow-xs ${borderClass}`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="main"
        className="!w-2 !h-2 !bg-blue-600 !-left-1 hover:!scale-125 transition-transform"
      />

      {/* Node Card Content */}
      <div className="p-2.5 flex flex-col gap-1.5">
        {/* Top row: icon | status tag | setting | delete */}
        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-md bg-blue-50/70 text-blue-700 border border-blue-200/60 flex items-center justify-center flex-shrink-0">
              <IconComponent weight="duotone" className="w-3 h-3" />
            </div>
            {status === "running" && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded animate-pulse">
                Running
              </span>
            )}
            {status === "success" && (
              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1 rounded">
                Done
              </span>
            )}
            {status === "error" && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                Failed
              </span>
            )}
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
              title="Configure Node"
              aria-label="Configure Node"
            >
              <GearIcon className="w-3.5 h-3.5" />
            </button>

            {/* Delete button: hidden if workflow is completed */}
            {!nodeData.isCompletedWorkflow && (
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
                <Trash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Preview info */}
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold text-gray-900 leading-tight truncate">
            {nodeData.title}
          </h4>

          {/* HTTP Trigger / Request: Method dropdown */}
          {isHttpRequest && (
            <div className="mt-1">
              <div className="relative">
                <select
                  value={nodeData.method || nodeData.httpMethod || "GET"}
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
              <div className="text-[9px] text-gray-500 font-mono truncate mt-0.5">
                {nodeData.url || nodeData.endpointUrl || "https://..."}
              </div>
            </div>
          )}

          {/* Browser Trigger: Browser URL badge */}
          {isBrowser && (
            <div className="mt-1 flex items-center gap-1 text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200/50 truncate">
              <span className="truncate text-gray-600 font-mono">
                {nodeData.urlForm || nodeData.browserUrl || "https://..."}
              </span>
            </div>
          )}

          {/* Input Trigger: Directly editable on the node */}
          {isInput && (
            <div className="mt-1">
              <textarea
                value={nodeData.prompt ?? nodeData.textValue ?? ""}
                onChange={(e) => {
                  nodeData.onChangeText?.(id, e.target.value);
                }}
                placeholder="Enter text here..."
                rows={2}
                className="nodrag nowheel nopan w-full bg-gray-50 hover:bg-white focus:bg-white text-gray-800 font-sans text-[10px] p-1.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all resize-none leading-tight"
              />
            </div>
          )}

          {/* AI Executors (Claude / OpenAI / Gemini): Model & Prompt preview */}
          {isAI && (
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-semibold text-blue-700 bg-blue-50 px-1 rounded truncate max-w-[100px]">
                  {nodeData.model || "Default Model"}
                </span>
                <span className="text-gray-400">
                  {nodeData.credentialId ? "✓ Key set" : "! Missing key"}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 truncate italic">
                {nodeData.prompt ? `"${nodeData.prompt}"` : "Click settings to configure"}
              </p>
            </div>
          )}

          {/* PostgreSQL: Query preview */}
          {nodeData.type === NodeType.POSTGRES_EXECUTER && (
            <div className="mt-1 text-[9px] font-mono text-gray-600 bg-gray-50 p-1 rounded border border-gray-200 truncate">
              {nodeData.query || "SELECT * FROM ..."}
            </div>
          )}

          {/* Email: Recipient */}
          {nodeData.type === NodeType.EMAIL_EXECUTER && (
            <div className="mt-1 text-[9px] text-gray-600 truncate">
              To: <span className="font-semibold text-gray-800">{nodeData.to || "recipient@..."}</span>
            </div>
          )}

          {/* Output Node: Result box displaying clean result in blue theme */}
          {isOutput && (
            <div className="mt-1">
              <div
                title={formatCleanOutput(nodeData.outputData)}
                className="bg-blue-950 text-blue-200 font-mono text-[9px] p-2 rounded-lg border border-blue-800 shadow-inner h-20 overflow-y-auto no-scrollbar whitespace-pre-wrap break-all leading-relaxed"
              >
                {formatCleanOutput(nodeData.outputData)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="main"
        className="!w-2 !h-2 !bg-blue-600 !-right-1 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CustomNode);
