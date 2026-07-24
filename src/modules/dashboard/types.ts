import { LucideIcon } from 'lucide-react';

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  type: 'income' | 'expense' | 'profit' | 'inventory' | 'sales';
  icon: LucideIcon;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: string;
  date: string;
  type: 'income' | 'expense' | 'sale' | 'inventory';
}
