import React, { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SummaryCard } from '@/modules/dashboard/components/SummaryCard';
import { QuickActions } from '@/modules/dashboard/components/QuickActions';
import { RecentActivity } from '@/modules/dashboard/components/RecentActivity';
import { QuickActionItem } from '@/modules/dashboard/types';
import { useDashboardSummary } from '@/modules/dashboard/hooks/useDashboardSummary';
import { DashboardChecklist } from '@/modules/onboarding/components/DashboardChecklist';
import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';

export const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const { summaryMetrics, recentActivities } = useDashboardSummary();
  const { businessProfile } = useOnboarding();
  const [showChecklist, setShowChecklist] = useState<boolean>(true);

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'អ្នកប្រើប្រាស់';
  const businessDisplayName = businessProfile?.businessName || 'អាជីវកម្មរបស់អ្នក';

  const todayDate = new Date().toLocaleDateString('km-KH', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const quickActions: QuickActionItem[] = [
    {
      id: 'action-sales',
      label: 'លក់ទំនិញ (POS)',
      description: 'បង្កើតការលក់ថ្មី',
      path: '/sales',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'action-finance',
      label: 'កត់ត្រាហិរញ្ញវត្ថុ',
      description: 'ចំណូល និង ចំណាយ',
      path: '/finance',
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-700',
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
              សួស្តី, {userName}
            </h2>
            <p id="dashboard-tagline" className="text-indigo-100 text-xs mt-1">
              {businessProfile?.businessName ? `គ្រប់គ្រង ${businessDisplayName}` : 'ទិដ្ឋភាពទូទៅនៃអាជីវកម្ម និងហិរញ្ញវត្ថុរបស់អ្នកថ្ងៃនេះ'}
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Setup Checklist */}
      {showChecklist && (
        <DashboardChecklist
          onDismiss={() => setShowChecklist(false)}
        />
      )}

      {/* Summary Cards Grid */}
      <div id="dashboard-summary-section" className="space-y-2">
        <h3 id="summary-cards-title" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          ទិដ្ឋភាពទូទៅនៃអាជីវកម្ម & ហិរញ្ញវត្ថុ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summaryMetrics.map((metric) => (
            <SummaryCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );
};
