import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SummaryCard } from '@/modules/dashboard/components/SummaryCard';
import { QuickActions } from '@/modules/dashboard/components/QuickActions';
import { RecentActivity } from '@/modules/dashboard/components/RecentActivity';
import { SummaryMetric, QuickActionItem, RecentActivityItem } from '@/modules/dashboard/types';

export const Home: React.FC = () => {
  const { user, profile } = useAuth();

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const mockMetrics: SummaryMetric[] = [
    {
      id: 'metric-income',
      label: 'ចំណូល',
      value: '$12,450.00',
      change: '+12.5%',
      isPositive: true,
      type: 'income',
      icon: ArrowUpRight,
    },
    {
      id: 'metric-expense',
      label: 'ចំណាយ',
      value: '$3,820.00',
      change: '-4.2%',
      isPositive: true,
      type: 'expense',
      icon: ArrowDownRight,
    },
    {
      id: 'metric-profit',
      label: 'ប្រាក់ចំណេញ',
      value: '$8,630.00',
      change: '+18.4%',
      isPositive: true,
      type: 'profit',
      icon: TrendingUp,
    },
    {
      id: 'metric-sales',
      label: 'ប្រាក់លក់',
      value: '$15,890.00',
      change: '+8.1%',
      isPositive: true,
      type: 'sales',
      icon: DollarSign,
    },
    {
      id: 'metric-inventory',
      label: 'ស្តុកទំនិញ',
      value: '148 ប្រភេទ',
      change: '12 ជិតអស់',
      isPositive: false,
      type: 'inventory',
      icon: Package,
    },
  ];

  const mockQuickActions: QuickActionItem[] = [
    {
      id: 'action-finance',
      label: 'ហិរញ្ញវត្ថុ',
      description: 'ចំណូល និង ចំណាយ',
      path: '/features',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'action-inventory',
      label: 'ស្តុកទំនិញ',
      description: 'គ្រប់គ្រងស្តុក',
      path: '/features',
      icon: Package,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'action-sales',
      label: 'ការលក់',
      description: 'កត់ត្រាការលក់',
      path: '/features',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  const mockActivities: RecentActivityItem[] = [
    {
      id: 'act-1',
      title: 'ប្រតិបត្តិការលក់ #1042',
      subtitle: 'លក់បាន 3 មុខ • អតិថិជនទូទៅ',
      amount: '+$240.00',
      date: '10 នាទីមុន',
      type: 'sale',
    },
    {
      id: 'act-2',
      title: 'ចំណាយលើសម្ភារការិយាល័យ',
      subtitle: 'ក្រដាស និងទឹកថ្នាំម៉ាស៊ីនបោះពុម្ព',
      amount: '-$85.50',
      date: '2 ម៉ោងមុន',
      type: 'expense',
    },
    {
      id: 'act-3',
      title: 'ទទួលបានថ្លៃសេវាពិគ្រោះយោបល់',
      subtitle: 'ការទូទាត់ថ្លៃសេវាកម្ម',
      amount: '+$500.00',
      date: 'ម្សិលមិញ',
      type: 'income',
    },
    {
      id: 'act-4',
      title: 'ការរំលឹកស្តុកទំនិញ',
      subtitle: 'ក្តារចុចឥតខ្សែជិតអស់ពីស្តុក (នៅសល់ 2)',
      date: 'ម្សិលមិញ',
      type: 'inventory',
    },
  ];

  return (
    <div id="home-dashboard-page" className="space-y-5">
      {/* User Greeting & Date Header */}
      <div id="dashboard-header" className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p id="dashboard-date" className="text-indigo-200 text-xs font-medium mb-0.5">
              {todayDate}
            </p>
            <h2 id="dashboard-user-greeting" className="text-xl font-bold tracking-tight">
              សួស្តី, {userName}! 👋
            </h2>
            <p id="dashboard-tagline" className="text-indigo-100 text-xs mt-1">
              នេះជាទិដ្ឋភាពទូទៅនៃអាជីវកម្មរបស់អ្នកថ្ងៃនេះ។
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div id="dashboard-summary-section" className="space-y-2">
        <h3 id="summary-cards-title" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          ទិដ្ឋភាពទូទៅនៃហិរញ្ញវត្ថុ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mockMetrics.map((metric) => (
            <SummaryCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={mockQuickActions} />

      {/* Recent Activity */}
      <RecentActivity activities={mockActivities} />
    </div>
  );
};
