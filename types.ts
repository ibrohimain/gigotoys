
export type Role = 'DIRECTOR' | 'AGENT';
export type Timeframe = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TransactionType = 'SALARY' | 'BONUS' | 'REWARD' | 'AVANS';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  phone?: string;
  status?: string; // e.g., "Oltin Agent"
  dailyGoal?: string;
  longTermGoal?: string;
  bonusBalance?: number;
  transactions?: Transaction[];
}

export interface Reward {
  id: string;
  name: string;
  percentage: number;
  icon: string;
  isUnlocked: boolean;
}

export interface SaleRecord {
  id: string;
  agentId: string;
  date: string;
  qurt: number;
  toys: number;
  milchofka: number;
  total: number;
  debtAmount: number;
  status: ReportStatus;
}

export interface SalesPlan {
  id: string;
  agentId: string;
  totalTarget: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isSecretKeyUnlocked?: boolean;
  isDirectorSigned?: boolean;
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  totalSales: number;
  qurtSales: number;
  toySales: number;
  milchofkaSales: number;
  totalDebt: number;
  progressPercentage: number;
  targetReached: boolean;
}
