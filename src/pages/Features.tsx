import React from 'react';
import { FeatureCard } from '@/modules/features/components/FeatureCard';
import { featuresData } from '@/modules/features/data';

export const Features: React.FC = () => {
  return (
    <div id="features-page" className="space-y-4">
      {/* Page Header */}
      <div id="features-header" className="bg-white p-4 border border-slate-200 rounded-2xl shadow-2xs">
        <h2 id="features-title" className="text-base font-bold text-slate-900 tracking-tight">
          មុខងារអាជីវកម្ម
        </h2>
        <p id="features-subtitle" className="text-xs text-slate-500 mt-0.5">
          ជ្រើសរើសមុខងារដើម្បីគ្រប់គ្រងប្រតិបត្តិការអាជីវកម្មរបស់អ្នក។
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div id="features-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {featuresData.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};
