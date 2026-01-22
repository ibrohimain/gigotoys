
export type Role = 'director' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ProductBreakdown {
  qurt: number;
  toys: number;
  milchofka: number;
}

export interface SaleReport {
  id: string;
  agentId: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  categories: ProductBreakdown;
  debt: number;
  totalAmount: number;
  status: 'pending' | 'approved';
  lastEditedBy?: string;
}

export interface Reward {
  threshold: number;
  prize: string;
  icon: string;
}

export interface AgentPlan {
  agentId: string;
  totalTarget: number;
  currentTotal: number;
  startDate: string;
  endDate: string;
}

export const CATEGORY_RATIOS = {
  qurt: 0.15,
  toys: 0.40,
  milchofka: 0.45
};

export const REWARD_THRESHOLDS: Reward[] = [
  { threshold: 100, prize: 'Konditsioner + Sovg‘a', icon: 'fa-snowflake' },
  { threshold: 90, prize: 'Muzlatgich', icon: 'fa-refrigerator' },
  { threshold: 85, prize: 'Kir yuvish mashinasi', icon: 'fa-soap' }
];

export const getDaysBetween = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(Math.ceil(diff / (1000 * 3600 * 24)), 1);
};
