export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
}

export interface WorkflowCard {
  id: number;
  title: string;
  description: string;
  tagline: string;
  glowColor: string;
}

export interface NodeItem {
  id: string;
  title: string;
  type: 'api-call' | 'branch' | 'formatter' | 'ai-prompt' | 'webhook';
  method?: string;
  path?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  x: number;
  y: number;
  inputs?: string[];
  outputs?: string[];
  properties?: { [key: string]: string };
}

export interface NodeConnection {
  id: string;
  fromId: string;
  toId: string;
  fromOutput?: string;
  toInput?: string;
  isActive?: boolean;
  label?: string;
}
