
import { REWARDS, PRODUCT_RATIOS, SaleEntry, SalesPlan, AuditLog } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(value);
};

export const calculateGigoPlan = (total3Months: number) => {
  const monthly = total3Months / 3;
  const daily = total3Months / 90;

  return {
    total3Months,
    monthlyPlan: monthly,
    dailyPlan: daily,
    productPlans: {
      qurt: total3Months * PRODUCT_RATIOS.qurt,
      toy: total3Months * PRODUCT_RATIOS.toy,
      milichovka: total3Months * PRODUCT_RATIOS.milichovka
    }
  };
};

export const calculateProgressSummary = (entries: SaleEntry[], plan: SalesPlan) => {
  const approved = entries.filter(e => e.status === 'approved');
  
  const totals = {
    qurt: approved.reduce((s, e) => s + e.qurt, 0),
    toy: approved.reduce((s, e) => s + e.toy, 0),
    milichovka: approved.reduce((s, e) => s + e.milichovka, 0),
    overall: approved.reduce((s, e) => s + e.total, 0)
  };

  const percentages = {
    overall: (totals.overall / plan.total3Months) * 100,
    qurt: (totals.qurt / (plan.total3Months * PRODUCT_RATIOS.qurt)) * 100,
    toy: (totals.toy / (plan.total3Months * PRODUCT_RATIOS.toy)) * 100,
    milichovka: (totals.milichovka / (plan.total3Months * PRODUCT_RATIOS.milichovka)) * 100
  };

  return {
    totals,
    percentages,
    isCompleted: percentages.overall >= 100
  };
};

/**
 * 15.2.1 Range-based color logic
 */
export const getProgressColor = (percent: number) => {
  if (percent >= 86) return '#10B981'; // Emerald
  if (percent >= 51) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
};

export const getProgressBgClass = (percent: number) => {
  if (percent >= 86) return 'bg-emerald-500';
  if (percent >= 51) return 'bg-amber-500';
  return 'bg-red-500';
};

export const getActiveReward = (percent: number, planTotal: number) => {
  const earnedRewards = REWARDS.filter(r => percent >= r.threshold);
  const nextReward = REWARDS.find(r => percent < r.threshold);
  
  const current = earnedRewards.length > 0 ? earnedRewards[earnedRewards.length - 1] : null;
  const percentToNext = nextReward ? nextReward.threshold - percent : 0;
  const amountToNext = nextReward ? (planTotal * (nextReward.threshold / 100)) - (planTotal * (percent / 100)) : 0;

  return {
    current,
    next: nextReward || null,
    percentToNext,
    amountToNext: Math.max(0, amountToNext)
  };
};

export const createLog = (userId: string, userName: string, action: string, details: string): AuditLog => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    userName,
    action,
    details,
    timestamp: Date.now()
  };
};

export const getActionColor = (action: string) => {
  switch (action) {
    case 'SALE_SUBMITTED': return 'text-orange-500 bg-orange-50';
    case 'SALE_APPROVED': return 'text-emerald-500 bg-emerald-50';
    case 'NOTE_SENT': return 'text-indigo-500 bg-indigo-50';
    case 'PLAN_UPDATED': return 'text-purple-500 bg-purple-50';
    default: return 'text-slate-500 bg-slate-50';
  }
};

export const calculateDaysRemaining = (startDate: number) => {
  const end = startDate + (90 * 24 * 60 * 60 * 1000);
  const diff = end - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
