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
  WebhooksLogoIcon,
  BrowserIcon,
  DiamondIcon,
  TextT,
  SquareIcon,
  BrowsersIcon,
  FileIcon,
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
    type: NodeType.TEXT,
    title: "Text Node",
    description: "Enter or edit text directly on node",
    subtitle: "Enter or edit text directly on node",
    category: "trigger",
    icon: TextT,
    iconName: "text",
    cost: 0,
  },
  // {
  //   type: NodeType.MANUAL_TRIGGER,
  //   title: "Manual Trigger",
  //   description: "Run workflow manually on demand",
  //   subtitle: "Run workflow manually on demand",
  //   category: "trigger",
  //   icon: Lightning,
  //   iconName: "branch",
  //   cost: 0,
  // },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "Browser Trigger",
    description: "Enter browser URL to search",
    subtitle: "Enter browser URL to search",
    category: "trigger",
    icon: Globe,
    iconName: "browser",
    cost: 0,
  },
  {
    type: NodeType.HTTP_REQUEST,
    title: "HTTP Request",
    description: "Enter browser URL to trigger workflow",
    subtitle: "Enter browser URL to trigger workflow",
    category: "trigger",
    icon: BrowsersIcon,
    iconName: "http",
    cost: 0,
  },
  {
    type: NodeType.WEBHOOK,
    title: "Webhook Trigger",
    description: "Receive HTTP payload from external service",
    subtitle: "Receive HTTP payload from external service",
    category: "trigger",
    icon: WebhooksLogoIcon,
    iconName: "webhook",
    cost: 1,
  }
];

export const ExecutionNodes: SidebarNodeItem[] = [
  {
    type: NodeType.OUTPUT,
    title: "Output Node",
    description: "Capture and display execution results on node",
    subtitle: "Capture and display execution results on node",
    category: "action",
    icon: SquareIcon,
    iconName: "diamond",
    cost: 0,
  },
  {
    type: NodeType.OPENAI,
    title: "AI",
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
    type: NodeType.GOOGLE_FORM,
    title: "Google Form",
    description: "Submit responses or extract Google Form data",
    subtitle: "Submit responses or extract Google Form data",
    category: "action",
    icon: FileIcon,
    iconName: "google_form",
    cost: 1,
  },
];
