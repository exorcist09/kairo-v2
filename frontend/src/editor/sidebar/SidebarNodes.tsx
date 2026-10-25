import { NodeType } from "@/utils/constants";
import type { Icon } from "@phosphor-icons/react";
import {
  Globe,
  Sparkle,
  Brain,
  ChatCircleDots,
  EnvelopeSimple,
  Database,
  WebhooksLogoIcon,
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
    type: NodeType.INPUT_TRIGGER,
    title: "Input Trigger",
    description: "Provide initial text prompt or structured data",
    subtitle: "Provide initial text prompt or structured data",
    category: "trigger",
    icon: TextT,
    iconName: "input",
    cost: 0,
  },
  {
    type: NodeType.BROWSER_TRIGGER,
    title: "Browser Trigger",
    description: "Automate Playwright headless browser navigation",
    subtitle: "Automate Playwright headless browser navigation",
    category: "trigger",
    icon: Globe,
    iconName: "browser",
    cost: 1,
  },
  {
    type: NodeType.HTTP_TRIGGER,
    title: "HTTP Request",
    description: "Trigger via HTTP or make outbound REST API requests",
    subtitle: "Trigger via HTTP or make outbound REST API requests",
    category: "trigger",
    icon: BrowsersIcon,
    iconName: "http",
    cost: 0,
  },
  {
    type: NodeType.WEBHOOK_TRIGGER,
    title: "Webhook Trigger",
    description: "Receive incoming payloads from external services",
    subtitle: "Receive incoming payloads from external services",
    category: "trigger",
    icon: WebhooksLogoIcon,
    iconName: "webhook",
    cost: 0,
  },
];

export const ExecutionNodes: SidebarNodeItem[] = [
  {
    type: NodeType.CLAUDE_EXECUTER,
    title: "Anthropic Claude",
    description: "Claude 3.5 Sonnet & Haiku text reasoning",
    subtitle: "Claude 3.5 Sonnet & Haiku text reasoning",
    category: "ai",
    icon: Sparkle,
    iconName: "claude",
    cost: 3,
  },
  {
    type: NodeType.OPENAI_EXECUTER,
    title: "OpenAI GPT",
    description: "GPT-4o & GPT-4o-mini completion and reasoning",
    subtitle: "GPT-4o & GPT-4o-mini completion and reasoning",
    category: "ai",
    icon: Sparkle,
    iconName: "openai",
    cost: 3,
  },
  {
    type: NodeType.GEMINI_EXECUTER,
    title: "Google Gemini",
    description: "Gemini 1.5 Pro & Flash multimodal intelligence",
    subtitle: "Gemini 1.5 Pro & Flash multimodal intelligence",
    category: "ai",
    icon: Brain,
    iconName: "gemini",
    cost: 2,
  },
  {
    type: NodeType.POSTGRES_EXECUTER,
    title: "PostgreSQL Database",
    description: "Execute SQL queries, updates, and transactions",
    subtitle: "Execute SQL queries, updates, and transactions",
    category: "action",
    icon: Database,
    iconName: "postgres",
    cost: 2,
  },
  {
    type: NodeType.EMAIL_EXECUTER,
    title: "Send Email",
    description: "Deliver transactional emails via SMTP",
    subtitle: "Deliver transactional emails via SMTP",
    category: "action",
    icon: EnvelopeSimple,
    iconName: "email",
    cost: 1,
  },
  {
    type: NodeType.SLACK_EXECUTER,
    title: "Slack Notification",
    description: "Post automated messages to Slack channels",
    subtitle: "Post automated messages to Slack channels",
    category: "action",
    icon: ChatCircleDots,
    iconName: "slack",
    cost: 1,
  },
  {
    type: NodeType.GOOGLE_FORM_EXECUTER,
    title: "Google Form",
    description: "Submit responses or extract Google Form questions",
    subtitle: "Submit responses or extract Google Form questions",
    category: "action",
    icon: FileIcon,
    iconName: "google_form",
    cost: 1,
  },
  {
    type: NodeType.OUTPUT,
    title: "Output",
    description: "Collect and return workflow final results",
    subtitle: "Collect and return workflow final results",
    category: "action",
    icon: SquareIcon,
    iconName: "output",
    cost: 0,
  },
];

