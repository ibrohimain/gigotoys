
export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  AGENT = 'AGENT'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  notificationsEnabled?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface DailyPlan {
  id: string;
  agentId: string;
  text: string;
  isCompleted: boolean;
  timestamp: number;
}

export interface LongTermGoal {
  id: string;
  agentId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export interface Sale {
  id: string;
  agentId: string;
  agentName: string;
  category: string;
  totalPrice: number;
  isDebt: boolean;
  timestamp: number;
  notes?: string;
}

export interface Reward {
  threshold: number;
  title: string;
  description: string;
  icon: string;
}

export interface SalaryConfig {
  commissionRate: number;
}
