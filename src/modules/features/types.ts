import { LucideIcon } from 'lucide-react';

export type FeatureStatus = 'available' | 'coming_soon';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  route: string;
  status: FeatureStatus;
  icon: LucideIcon;
  badgeText?: string;
  badgeColor?: string;
}
