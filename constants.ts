
import { User, Reward } from './types';

export const USERS: User[] = [
  { id: '1', email: 'director@gmail.com', name: 'GIGO Boss', role: 'DIRECTOR' },
  { id: '2', email: 'ruxshona@gmail.com', name: 'Ruxshona', role: 'AGENT' },
  { id: '3', email: 'muxlisa@gmail.com', name: 'Muxlisa', role: 'AGENT' },
  { id: '4', email: 'aziza@gmail.com', name: 'Aziza', role: 'AGENT' },
];

export const DEFAULT_REWARDS: Reward[] = [
  { id: 'wm', name: 'Kir yuvish mashinasi', percentage: 85, icon: 'WashingMachine', isUnlocked: false },
  { id: 'rf', name: 'Muzlatgich', percentage: 90, icon: 'Refrigerator', isUnlocked: false },
  { id: 'ac', name: 'Konditsioner', percentage: 100, icon: 'AirVent', isUnlocked: false },
];

export const TARGET_DEBT_LIMIT_PERCENTAGE = 7;
