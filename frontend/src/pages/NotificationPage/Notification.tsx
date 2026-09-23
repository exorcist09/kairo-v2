"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  Warning,
  XCircle,
  Info,
  Checks,
  Trash,
  Funnel,
  Path,
  Gear,
  Clock,
  Check,
} from "@phosphor-icons/react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "workflow" | "system" | "security";
  type: "success" | "warning" | "error" | "info";
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Workflow 'Customer Onboarding' completed",
    description: "42 user records were successfully synced to PostgreSQL database without errors.",
    category: "workflow",
    type: "success",
    timestamp: "12 minutes ago",
    isRead: false,
    link: "/workflows",
  },
  {
    id: "notif-2",
    title: "Stripe Credential Expiring Soon",
    description: "Your connected Stripe API key will expire in 3 days. Update it to prevent execution pauses.",
    category: "security",
    type: "warning",
    timestamp: "2 hours ago",
    isRead: false,
    link: "/credentials",
  },
  {
    id: "notif-3",
    title: "Execution Failed: 'Slack Webhook Dispatcher'",
    description: "Encountered 400 Bad Request during payload delivery to webhook URL.",
    category: "workflow",
    type: "error",
    timestamp: "5 hours ago",
    isRead: false,
    link: "/workflows",
  },
  {
    id: "notif-4",
    title: "Welcome to Kairo v2!",
    description: "Explore the redesigned dashboard, flexible canvas editor, and enhanced authentication.",
    category: "system",
    type: "info",
    timestamp: "Yesterday",
    isRead: true,
  },
  {
    id: "notif-5",
    title: "Monthly Usage Milestone Reached",
    description: "You've successfully processed over 1,200 automated workflow executions this cycle.",
    category: "system",
    type: "success",
    timestamp: "2 days ago",
    isRead: true,
    link: "/billing",
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "workflow" | "system">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "workflow") return n.category === "workflow";
    if (filter === "system") return n.category === "system" || n.category === "security";
    return true;
  });

  const getStatusIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <Warning weight="fill" className="w-5 h-5 text-amber-500" />;
      case "error":
        return <XCircle weight="fill" className="w-5 h-5 text-red-500" />;
      case "info":
      default:
        return <Info weight="fill" className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryBadge = (category: NotificationItem["category"]) => {
    switch (category) {
      case "workflow":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            <Path weight="bold" className="w-3 h-3" /> Workflow
          </span>
        );
      case "security":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            <Gear weight="bold" className="w-3 h-3" /> Security
          </span>
        );
      case "system":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
            <Bell weight="bold" className="w-3 h-3" /> System
          </span>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header (No unread count badge) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-xs cursor-pointer"
            >
              <Checks weight="bold" className="w-4 h-4 text-blue-600" />
              <span>Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
            >
              <Trash weight="bold" className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        {/* Filters Bar (No unread count badge in tab label) */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "workflow", label: "Workflows" },
              { key: "system", label: "System" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.key
                    ? "bg-white text-blue-600 shadow-xs border border-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Funnel className="w-3.5 h-3.5" />
            <span>Showing {filteredNotifications.length} items</span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 flex flex-col gap-3">
          {filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-xs">
                <Bell weight="thin" className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {filter === "unread" ? "No unread notifications" : "All caught up!"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                {filter === "unread"
                  ? "You have reviewed all your pending alerts and workflow events."
                  : "There are no notifications to display in this view."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`relative flex items-start justify-between gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                  item.isRead
                    ? "bg-white border-gray-200/70 hover:border-gray-300 hover:bg-gray-50/50"
                    : "bg-blue-50/30 border-blue-200/70 hover:border-blue-300 shadow-xs"
                }`}
              >
                {/* Left side: Icon & Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="mt-0.5 flex-shrink-0">{getStatusIcon(item.type)}</div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm tracking-tight ${
                          item.isRead ? "font-semibold text-gray-800" : "font-bold text-gray-900"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {getCategoryBadge(item.category)}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pr-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.timestamp}
                      </span>
                      {item.link && (
                        <span className="text-blue-600 font-medium hover:underline">
                          View details →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRead(item.id);
                    }}
                    title={item.isRead ? "Mark as unread" : "Mark as read"}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Check weight="bold" className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => deleteNotification(item.id, e)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash weight="bold" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
