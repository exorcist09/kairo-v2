"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Clock,
  Coins,
  Copy,
  Check,
  Cpu,
  Globe,
  EnvelopeSimple,
  Database,
  ChatCircleText,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  Sparkle,
  Tray,
  Lightning,
  Article,
} from "@phosphor-icons/react";
import { getSocket } from "@/lib/socket";
import { NodeType, NODE_CREDIT_COSTS } from "@/utils/constants";

interface EditorWorkerProps {
  workflowId: string;
  workflowName: string;
  workflowStatus: string;
  isExecuting: boolean;
  nodes?: any[];
  edges?: any[];
}

interface LiveNodeTelemetry {
  status: "idle" | "running" | "success" | "error";
  sent?: any;
  result?: any;
  error?: string;
  updatedAt?: string;
}

export default function EditorWorker({
  workflowId,
  workflowName,
  workflowStatus,
  isExecuting,
  nodes = [],
  edges = [],
}: EditorWorkerProps) {
  const [telemetry, setTelemetry] = useState<Record<string, LiveNodeTelemetry>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<"all" | "executors" | "triggers" | "outputs">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"executors" | "raw">("executors");

  // Real-time socket listener for live worker execution events
  useEffect(() => {
    if (!workflowId) return;
    const socket = getSocket();
    socket.emit("join:workflow", workflowId);

    const handleNodeStart = (data: {
      nodeId: string;
      nodeType?: string;
      nodeTitle?: string;
      sent?: any;
    }) => {
      setTelemetry((prev) => ({
        ...prev,
        [data.nodeId]: {
          ...prev[data.nodeId],
          status: "running",
          sent: data.sent ?? prev[data.nodeId]?.sent,
          updatedAt: new Date().toLocaleTimeString(),
        },
      }));
      // Auto-expand node when it starts running
      setExpandedNodes((prev) => ({ ...prev, [data.nodeId]: true }));
    };

    const handleNodeSuccess = (data: {
      nodeId: string;
      nodeType?: string;
      nodeTitle?: string;
      sent?: any;
      result?: any;
    }) => {
      setTelemetry((prev) => ({
        ...prev,
        [data.nodeId]: {
          ...prev[data.nodeId],
          status: "success",
          sent: data.sent ?? prev[data.nodeId]?.sent,
          result: data.result,
          updatedAt: new Date().toLocaleTimeString(),
        },
      }));
    };

    const handleNodeError = (data: {
      nodeId: string;
      nodeType?: string;
      nodeTitle?: string;
      sent?: any;
      error?: string;
    }) => {
      setTelemetry((prev) => ({
        ...prev,
        [data.nodeId]: {
          ...prev[data.nodeId],
          status: "error",
          sent: data.sent ?? prev[data.nodeId]?.sent,
          error: data.error || "Execution failed",
          updatedAt: new Date().toLocaleTimeString(),
        },
      }));
      setExpandedNodes((prev) => ({ ...prev, [data.nodeId]: true }));
    };

    const handleExecutionComplete = (data: { results?: Record<string, any> }) => {
      if (data?.results) {
        setTelemetry((prev) => {
          const updated = { ...prev };
          Object.entries(data.results!).forEach(([nodeId, res]) => {
            updated[nodeId] = {
              ...updated[nodeId],
              status: "success",
              result: res,
              updatedAt: new Date().toLocaleTimeString(),
            };
          });
          return updated;
        });
      }
    };

    socket.on("workflow:node:start", handleNodeStart);
    socket.on("workflow:node:success", handleNodeSuccess);
    socket.on("workflow:node:error", handleNodeError);
    socket.on("workflow:execution:complete", handleExecutionComplete);

    return () => {
      socket.off("workflow:node:start", handleNodeStart);
      socket.off("workflow:node:success", handleNodeSuccess);
      socket.off("workflow:node:error", handleNodeError);
      socket.off("workflow:execution:complete", handleExecutionComplete);
    };
  }, [workflowId]);

  // Compute total credits consumed at that moment
  const totalCreditsConsumed = useMemo(() => {
    const isWfCompleted = workflowStatus.toUpperCase() === "COMPLETED";

    return nodes.reduce((sum, n) => {
      const typeKey = String(n.data?.nodeType || n.type || "").toUpperCase();
      const nodeCost =
        typeof (n.data as any)?.cost === "number"
          ? (n.data as any).cost
          : NODE_CREDIT_COSTS[typeKey] ?? 0;

      const liveStatus = telemetry[n.id]?.status;
      const nodeStatus = liveStatus || n.data?.status || (isWfCompleted ? "success" : "idle");

      // Credits are consumed once node executes or if entire workflow is completed
      const isConsumed =
        isWfCompleted ||
        nodeStatus === "success" ||
        nodeStatus === "running" ||
        nodeStatus === "error";

      return isConsumed ? sum + nodeCost : sum;
    }, 0);
  }, [nodes, telemetry, workflowStatus]);

  // Handle payload copy
  const handleCopy = (key: string, data: any) => {
    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Helper to extract sent payload for a node
  const getNodeSentPayload = (node: any) => {
    const liveSent = telemetry[node.id]?.sent;
    if (liveSent) return liveSent;

    // Upstream inputs from connections
    const incoming = edges.filter(
      (e) => e.target === node.id || (e as any).toNodeId === node.id,
    );

    const incomingInputs: Record<string, any> = {};
    incoming.forEach((edge) => {
      const sourceId = edge.source || (edge as any).fromNodeId;
      const sourceNode = nodes.find((n) => n.id === sourceId);
      const sourceOutput =
        telemetry[sourceId]?.result ??
        sourceNode?.data?.outputData ??
        sourceNode?.data?.result;
      if (sourceOutput !== undefined) {
        incomingInputs[sourceNode?.data?.title || sourceId] = sourceOutput;
      }
    });

    const d = node.data || {};
    const configParams: Record<string, any> = {};

    if (d.prompt) configParams.prompt = d.prompt;
    if (d.model) configParams.model = d.model;
    if (d.url) configParams.url = d.url;
    if (d.method) configParams.method = d.method;
    if (d.headers && Object.keys(d.headers).length > 0) configParams.headers = d.headers;
    if (d.body && Object.keys(d.body).length > 0) configParams.body = d.body;
    if (d.query) configParams.query = d.query;
    if (d.to) configParams.to = d.to;
    if (d.subject) configParams.subject = d.subject;
    if (d.channel) configParams.channel = d.channel;
    if (d.message) configParams.message = d.message;
    if (d.textValue) configParams.text = d.textValue;
    if (d.urlForm) configParams.urlForm = d.urlForm;
    if (d.values && Object.keys(d.values).length > 0) configParams.values = d.values;

    return {
      nodeConfig: Object.keys(configParams).length > 0 ? configParams : d,
      incomingInputs: Object.keys(incomingInputs).length > 0 ? incomingInputs : null,
    };
  };

  // Helper to extract received payload for a node
  const getNodeReceivedPayload = (node: any) => {
    const live = telemetry[node.id];
    if (live?.result !== undefined) return live.result;
    if (live?.error) return { error: live.error };

    const d = node.data || {};
    if (d.outputData !== undefined) return d.outputData;
    if (d.result !== undefined) return d.result;
    if (d.error) return { error: d.error };

    return null;
  };

  // Helper to determine node category
  const getNodeCategory = (node: any): "trigger" | "executor" | "output" => {
    const t = String(node.data?.nodeType || node.type || "").toUpperCase();
    if (t.includes("TRIGGER")) return "trigger";
    if (t.includes("OUTPUT") || node.data?.iconName === "output") return "output";
    return "executor";
  };

  // Node Icon Helper
  const getNodeIcon = (node: any) => {
    const t = String(node.data?.nodeType || node.type || "").toUpperCase();
    if (t.includes("CLAUDE") || t.includes("OPENAI") || t.includes("GEMINI")) {
      return <Sparkle weight="duotone" className="w-5 h-5 text-purple-600" />;
    }
    if (t.includes("POSTGRES")) {
      return <Database weight="duotone" className="w-5 h-5 text-indigo-600" />;
    }
    if (t.includes("EMAIL")) {
      return <EnvelopeSimple weight="duotone" className="w-5 h-5 text-amber-600" />;
    }
    if (t.includes("SLACK")) {
      return <ChatCircleText weight="duotone" className="w-5 h-5 text-emerald-600" />;
    }
    if (t.includes("HTTP")) {
      return <Globe weight="duotone" className="w-5 h-5 text-blue-600" />;
    }
    if (t.includes("INPUT")) {
      return <Article weight="duotone" className="w-5 h-5 text-blue-600" />;
    }
    if (t.includes("OUTPUT")) {
      return <Tray weight="duotone" className="w-5 h-5 text-blue-600" />;
    }
    return <Cpu weight="duotone" className="w-5 h-5 text-gray-700" />;
  };

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const category = getNodeCategory(node);
      if (filterType === "executors" && category !== "executor") return false;
      if (filterType === "triggers" && category !== "trigger") return false;
      if (filterType === "outputs" && category !== "output") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (node.data?.title || node.name || node.id).toLowerCase();
        const type = String(node.data?.nodeType || node.type || "").toLowerCase();
        return title.includes(query) || type.includes(query);
      }
      return true;
    });
  }, [nodes, filterType, searchQuery]);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    nodes.forEach((n) => {
      updated[n.id] = expand;
    });
    setExpandedNodes(updated);
  };

  const isWfCompleted = workflowStatus.toUpperCase() === "COMPLETED";

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden select-none p-5 md:p-8">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Top Worker Status Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isExecuting
                  ? "bg-blue-50 text-blue-600"
                  : isWfCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {isExecuting ? (
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              ) : isWfCompleted ? (
                <CheckCircle weight="fill" className="w-6 h-6" />
              ) : (
                <Clock weight="duotone" className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-gray-900">{workflowName}</h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isExecuting
                      ? "text-blue-700 bg-blue-50 border-blue-200 animate-pulse"
                      : isWfCompleted
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200/70"
                        : "text-gray-700 bg-gray-50 border-gray-200"
                  }`}
                >
                  {isExecuting
                    ? "Worker Executing"
                    : isWfCompleted
                      ? "Worker Completed"
                      : "Worker Ready"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2.5 flex-wrap">
                <span>{nodes.length} nodes in pipeline</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50/70 px-2 py-0.5 rounded-md border border-blue-100">
                  <Coins weight="bold" className="w-3.5 h-3.5" />
                  {totalCreditsConsumed} {totalCreditsConsumed === 1 ? "credit" : "credits"} consumed
                </span>
                <span>•</span>
                <span>
                  Status: <strong className="text-gray-700 uppercase font-mono">{workflowStatus}</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("executors")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "executors"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Node Telemetry ({nodes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "raw"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Full JSON Inspector
            </button>
          </div>

          {activeTab === "executors" && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Pills */}
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === "all" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("executors")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === "executors"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-500"
                  }`}
                >
                  Executors
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("triggers")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === "triggers"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-500"
                  }`}
                >
                  Triggers
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("outputs")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === "outputs"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-500"
                  }`}
                >
                  Output
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <MagnifyingGlass className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col">
          {activeTab === "executors" ? (
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              {filteredNodes.length === 0 ? (
                <div className="py-16 text-center">
                  <Cpu weight="duotone" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-gray-700">No nodes found</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery
                      ? "No nodes match your search query."
                      : "This workflow currently has no configured nodes."}
                  </p>
                </div>
              ) : (
                filteredNodes.map((node, index) => {
                  const nodeTypeKey = String(node.data?.nodeType || node.type || "").toUpperCase();
                  const cost =
                    typeof (node.data as any)?.cost === "number"
                      ? (node.data as any).cost
                      : NODE_CREDIT_COSTS[nodeTypeKey] ?? 0;

                  const liveTelemetry = telemetry[node.id];
                  const status =
                    liveTelemetry?.status ||
                    node.data?.status ||
                    (isWfCompleted ? "success" : "idle");

                  const isExpanded = expandedNodes[node.id] !== false; // Default expanded
                  const sentPayload = getNodeSentPayload(node);
                  const receivedPayload = getNodeReceivedPayload(node);

                  return (
                    <div
                      key={node.id}
                      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all hover:border-gray-300"
                    >
                      {/* Node Executor Header */}
                      <div
                        onClick={() => toggleNode(node.id)}
                        className="px-5 py-3.5 bg-gray-50/70 hover:bg-gray-100/60 transition-colors flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {getNodeIcon(node)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                              <h4 className="text-sm font-bold text-gray-900 truncate">
                                {node.data?.title || node.name || node.id}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-200/70 text-gray-700 font-semibold">
                                {nodeTypeKey}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                              <span className="font-medium text-blue-600">
                                {cost} {cost === 1 ? "credit" : "credits"}
                              </span>
                              {liveTelemetry?.updatedAt && (
                                <>
                                  <span>•</span>
                                  <span>Updated: {liveTelemetry.updatedAt}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Node Status Pill */}
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                              status === "running"
                                ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse font-bold"
                                : status === "success"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : status === "error"
                                    ? "bg-red-50 text-red-700 border border-red-200 font-bold"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {status === "running" ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                <span>Running</span>
                              </>
                            ) : status === "success" ? (
                              <>
                                <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Success</span>
                              </>
                            ) : status === "error" ? (
                              <>
                                <WarningCircle weight="fill" className="w-3.5 h-3.5 text-red-600" />
                                <span>Failed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Idle</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            {isExpanded ? (
                              <CaretUp className="w-4 h-4" />
                            ) : (
                              <CaretDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sent & Received Panel */}
                      {isExpanded && (
                        <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column: What Executor Sends */}
                          <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
                            <div className="px-3.5 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-gray-800">
                                  SENT TO EXECUTOR (INPUT)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(`sent-${node.id}`, sentPayload)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {copiedKey === `sent-${node.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Sent</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-3 flex-1 overflow-x-auto">
                              <pre className="text-[11px] font-mono text-gray-800 leading-relaxed whitespace-pre-wrap break-all">
                                {JSON.stringify(sentPayload, null, 2)}
                              </pre>
                            </div>
                          </div>

                          {/* Right Column: What Executor Receives */}
                          <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
                            <div className="px-3.5 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    status === "error"
                                      ? "bg-red-500"
                                      : receivedPayload !== null
                                        ? "bg-emerald-500"
                                        : "bg-gray-400"
                                  }`}
                                />
                                <span className="text-xs font-bold text-gray-800">
                                  RECEIVED FROM EXECUTOR (OUTPUT)
                                </span>
                              </div>
                              {receivedPayload !== null && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(`recv-${node.id}`, receivedPayload)}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  {copiedKey === `recv-${node.id}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-600">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Received</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="p-3 flex-1 overflow-x-auto">
                              {status === "error" && liveTelemetry?.error ? (
                                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                                  <strong>Error:</strong> {liveTelemetry.error}
                                </div>
                              ) : receivedPayload !== null ? (
                                <pre className="text-[11px] font-mono text-gray-800 leading-relaxed whitespace-pre-wrap break-all">
                                  {typeof receivedPayload === "string"
                                    ? receivedPayload
                                    : JSON.stringify(receivedPayload, null, 2)}
                                </pre>
                              ) : (
                                <div className="text-xs text-gray-400 italic py-4 text-center">
                                  {status === "running"
                                    ? "Executing... Awaiting response from background worker..."
                                    : "No execution result recorded yet."}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Full JSON Inspector */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                <span className="text-xs font-semibold text-gray-600">
                  Full Pipeline Telemetry & Node Graph
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy("full-telemetry", {
                      workflowId,
                      workflowName,
                      workflowStatus,
                      totalCreditsConsumed,
                      nodes,
                      telemetry,
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {copiedKey === "full-telemetry" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied Full JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full JSON</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5">
                <pre className="p-4 rounded-xl bg-gray-950 text-gray-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  {JSON.stringify(
                    {
                      workflowId,
                      workflowName,
                      workflowStatus,
                      totalCreditsConsumed,
                      nodes: nodes.map((n) => ({
                        id: n.id,
                        type: n.type,
                        title: n.data?.title || n.name,
                        cost:
                          typeof (n.data as any)?.cost === "number"
                            ? (n.data as any).cost
                            : NODE_CREDIT_COSTS[String(n.data?.nodeType || n.type || "").toUpperCase()] ?? 0,
                        status:
                          telemetry[n.id]?.status ||
                          n.data?.status ||
                          (isWfCompleted ? "success" : "idle"),
                        sent: getNodeSentPayload(n),
                        received: getNodeReceivedPayload(n),
                      })),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
