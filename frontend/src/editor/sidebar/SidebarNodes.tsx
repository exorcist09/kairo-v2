import { NodeType } from "@/utils/constants";
import type { Icon } from "@phosphor-icons/react";
import {
  Lightning,
  Globe,
  Play,
  Sparkle,
  Brain,
  ChatCircleDots,
  EnvelopeSimple,
  Database,
} from "@phosphor-icons/react";

export interface SidebarNodeItem {
  type: NodeType;
  title: string;
  description: string;
  subtitle?: string;
  category: "trigger" | "action" | "ai" | "logic";
  icon: Icon;
  iconName?: string;
  cost: number;
}

export const TriggerNodes: SidebarNodeItem[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    title: "Manual Trigger",
    description: "Run workflow manually on demand",
    subtitle: "Run workflow manually on demand",
    category: "trigger",
    icon: Play,
    iconName: "branch",
    cost: 0,
  },
  {
    type: NodeType.WEBHOOK,
    title: "Webhook Trigger",
    description: "Receive HTTP payload from external service",
    subtitle: "Receive HTTP payload from external service",
    category: "trigger",
    icon: Lightning,
    iconName: "webhook",
    cost: 1,
  },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "HTTP Trigger",
    description: "Trigger pipeline via incoming HTTP request",
    subtitle: "Trigger pipeline via incoming HTTP request",
    category: "trigger",
    icon: Globe,
    iconName: "http",
    cost: 1,
  },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "HTTP Trigger",
    description: "Trigger pipeline via incoming HTTP request",
    subtitle: "Trigger pipeline via incoming HTTP request",
    category: "trigger",
    icon: Globe,
    iconName: "http",
    cost: 1,
  },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "HTTP Trigger",
    description: "Trigger pipeline via incoming HTTP request",
    subtitle: "Trigger pipeline via incoming HTTP request",
    category: "trigger",
    icon: Globe,
    iconName: "http",
    cost: 1,
  },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "HTTP Trigger",
    description: "Trigger pipeline via incoming HTTP request",
    subtitle: "Trigger pipeline via incoming HTTP request",
    category: "trigger",
    icon: Globe,
    iconName: "http",
    cost: 1,
  },
];

export const ExecutionNodes: SidebarNodeItem[] = [
  {
    type: NodeType.OPENAI,
    title: "OpenAI Completion",
    description: "Generate text, extract data, or reason with GPT",
    subtitle: "Generate text, extract data, or reason with GPT",
    category: "ai",
    icon: Sparkle,
    iconName: "ai",
    cost: 3,
  },
  {
    type: NodeType.GEMINI,
    title: "Google Gemini",
    description: "Multi-modal reasoning and text generation",
    subtitle: "Multi-modal reasoning and text generation",
    category: "ai",
    icon: Brain,
    iconName: "ai",
    cost: 2,
  },
  {
    type: NodeType.POSTGRES,
    title: "PostgreSQL Database",
    description: "Execute SQL queries, inserts, or updates",
    subtitle: "Execute SQL queries, inserts, or updates",
    category: "action",
    icon: Database,
    iconName: "database",
    cost: 2,
  },
  {
    type: NodeType.EMAIL,
    title: "Send Email",
    description: "Deliver automated transactional emails",
    subtitle: "Deliver automated transactional emails",
    category: "action",
    icon: EnvelopeSimple,
    iconName: "email",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.SLACK,
    title: "Slack Notification",
    description: "Post formatted messages to channels",
    subtitle: "Post formatted messages to channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
];
