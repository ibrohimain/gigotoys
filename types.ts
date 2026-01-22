
export type Role = 'DIRECTOR' | 'AGENT';
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TransactionType = 'SALARY' | 'BONUS' | 'REWARD' | 'AVANS' | 'EXPENSE';

// Added Timeframe type used in analytics and view state
export type Timeframe = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Added Reward interface used for gamification and milestones
export interface Reward {
  id: string;
  name: string;
  percentage: number;
  icon: string;
  isUnlocked: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface DailyPlan {
  id: string;
  agentId: string;
  title: string;
  time: string;
  date: string;
  isCompleted: boolean;
}

export interface LongTermGoal {
  id: string;
  agentId: string;
  title: string;
  progress: number; // 0-100
  targetDate: string;
  description: string;
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
  status?: string;
  bonusBalance?: number;
  transactions?: Transaction[];
  dailyPlans?: DailyPlan[];
  longTermGoals?: LongTermGoal[];
  // Added goal fields used in ProfileView
  dailyGoal?: string;
  longTermGoal?: string;
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
  // Added flag used for reward unlocking logic
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
