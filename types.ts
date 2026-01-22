
export enum UserRole {
  ADMIN = 'director',
  AGENT = 'employee'
}

export const PRODUCT_RATIOS = {
  qurt: 0.15,
  toy: 0.40,
  milichovka: 0.45
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: number;
}

export interface SaleEntry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  qurt: number;
  toy: number;
  milichovka: number;
  total: number;
  status: 'pending' | 'approved';
  createdAt: number;
  warning?: string;
}

export interface SalesPlan {
  id: string;
  userId: string;
  total3Months: number;
  monthlyPlan: number;
  dailyPlan: number;
  startDate: number;
}

export const REWARDS = [
  { threshold: 85, name: "Kir yuvish mashinasi", icon: '🧺' },
  { threshold: 90, name: "Muzlatgich", icon: '🧊' },
  { threshold: 100, name: "Konditsioner + 'Yashirin Quti'", icon: '🎁' },
];

export interface AuditLog {
  id: string;
  // Fix: Added userId to support user tracking in audit logs and resolve TypeScript property errors
  userId: string;
  action: string;
  details: string;
  timestamp: number;
  userName: string;
}

export interface Note {
  id: string;
  userId: string; // Recipient ID
  message: string;
  senderName: string;
  timestamp: number;
  read: boolean; // 12.2 status logic
}
