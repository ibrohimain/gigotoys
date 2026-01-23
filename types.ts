
export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  AGENT = 'AGENT'
}

export type ProductType = 'QURT' | 'OYINCHOQ' | 'MILICHOFAKA';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductSale {
  quantity: number;
  totalPrice: number;
  debtAmount: number;
}

export interface SalesReport {
  id?: string;
  agentEmail: string;
  agentName: string;
  date: string; // ISO string YYYY-MM-DD
  timestamp: number;
  status: ReportStatus;
  items: {
    [key in ProductType]: ProductSale;
  };
  totalDaySales: number;
  totalDayDebt: number;
}

export interface BonusTier {
  id: string;
  threshold: number; // e.g., 90 (%)
  prize: string; // e.g., 'Muzlatgich'
}

export interface SalesPlan {
  id?: string;
  agentEmail: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  debtLimitPercent: number; // Max allowed debt percentage
  distribution: {
    [key in ProductType]: number; // Percentages
  };
  active: boolean;
  createdAt: number;
}

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
}
