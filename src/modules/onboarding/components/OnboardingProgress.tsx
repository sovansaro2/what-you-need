import React from 'react';
import { OnboardingStep } from '../types';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

const STEPS: { id: OnboardingStep; label: string; number: number }[] = [
  { id: 'welcome', label: 'ស្វាគមន៍', number: 1 },
  { id: 'business_info', label: 'ព័ត៌មានអាជីវកម្ម', number: 2 },
  { id: 'currency', label: 'ជ្រើសរើសរូបិយវត្ថុ', number: 3 },
  { id: 'completion', label: 'រួចរាល់', number: 4 },
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = Math.round(((currentIndex + 1) / STEPS.length) * 100);

  return (
    <div className="w-full space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      {/* Step Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>ជំហានទី {currentIndex + 1} នៃ {STEPS.length}</span>
        <span className="text-indigo-600">{progressPercent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Breadcrumbs */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="text-center space-y-1">
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
              </div>
              <p
                className={`text-[10px] font-medium leading-tight truncate px-0.5 ${
                  isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
