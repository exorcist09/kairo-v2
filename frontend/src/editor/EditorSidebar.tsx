"use client";

import Image from "next/image";
import {
  Lightning,
  Clock,
  Database,
  Sparkle,
  EnvelopeSimple,
  ChatCircleDots,
  Globe,
  GitBranch,
  Plus,
} from "@phosphor-icons/react";

export interface NodePaletteItem {
  type: string;
  title: string;
  subtitle: string;
  category: "trigger" | "action" | "ai" | "logic";
  iconName: string;
}

export const PALETTE_ITEMS: NodePaletteItem[] = [
  {
    type: "webhook",
    title: "Webhook Trigger",
    subtitle: "Receive HTTP payload from external service",
    category: "trigger",
    iconName: "webhook",
  },
  {
    type: "cron",
    title: "Scheduled Cron",
    subtitle: "Trigger pipeline on recurring interval",
    category: "trigger",
    iconName: "cron",
  },
  {
    type: "database",
    title: "PostgreSQL Database",
    subtitle: "Execute SQL queries, inserts, or updates",
    category: "action",
    iconName: "database",
  },
  {
    type: "ai",
    title: "Kai AI Agent",
    subtitle: "Reason, summarize, or extract with Kai AI",
    category: "ai",
    iconName: "ai",
  },
  {
    type: "email",
    title: "Send Email",
    subtitle: "Deliver automated transactional emails",
    category: "action",
    iconName: "email",
  },
  {
    type: "slack",
    title: "Slack Notification",
    subtitle: "Post formatted messages to channels",
    category: "action",
    iconName: "slack",
  },
  {
    type: "http",
    title: "HTTP Request",
    subtitle: "Call any external REST or GraphQL API",
    category: "action",
    iconName: "http",
  },
  {
    type: "branch",
    title: "Condition Branch",
    subtitle: "Split workflow based on boolean logic",
    category: "logic",
    iconName: "branch",
  },
];

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

interface EditorSidebarProps {
  onAddNode: (item: NodePaletteItem) => void;
}

export default function EditorSidebar({ onAddNode }: EditorSidebarProps) {
  const handleDragStart = (e: React.DragEvent, item: NodePaletteItem) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-72 h-full bg-white flex flex-col border-r border-gray-200 flex-shrink-0 z-20 select-none">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Node Library
        </span>
        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {PALETTE_ITEMS.length} available
        </span>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-2.5">
        <p className="text-[11px] text-gray-400 font-medium px-1">
          Drag to canvas or click to add
        </p>

        {PALETTE_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.iconName] || Lightning;

          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => onAddNode(item)}
              className="group bg-white border border-gray-200/80 hover:border-blue-300 hover:shadow-xs p-3 rounded-xl flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.category === "trigger"
                      ? "bg-blue-50 text-blue-600"
                      : item.category === "ai"
                      ? "bg-amber-50 text-amber-600"
                      : item.category === "logic"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  <Icon weight="duotone" className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h5>
                  <p className="text-[11px] text-gray-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Add to canvas"
              >
                <Plus weight="bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom: Logo */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-center bg-gray-50/50">
        <Image
          src="/Kairo.png"
          alt="Logo"
          width={90}
          height={28}
          className="h-5 w-auto brightness-0 opacity-40 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}
