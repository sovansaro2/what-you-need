import React from 'react';
import { Store, ShieldCheck, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/common';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="space-y-5">
      {/* Hero Welcome Card */}
      <Card className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl space-y-4 border-none shadow-xl">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-indigo-200">
          <Store className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មឆ្លាតវៃ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ WYN
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            ជំនួយការឌីជីថលសម្រាប់អាជីវកម្មខ្នាតតូច ហាងលក់ទំនិញ និងអ្នកលក់ប្រចាំថ្ងៃ។ ជួយកត់ត្រាហិរញ្ញវត្ថុ គ្រប់គ្រងស្តុកទំនិញ និងពិនិត្យចំណេញខាតយ៉ាងងាយស្រួល។
          </p>
        </div>
      </Card>

      {/* Feature Value Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4 space-y-2 border-slate-200/80">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">កត់ត្រាហិរញ្ញវត្ថុច្បាស់លាស់</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ដឹងពីចំណូល ចំណាយ និងប្រាក់ចំណេញពិតប្រាកដប្រចាំថ្ងៃ និងប្រចាំខែ។
          </p>
        </Card>

        <Card className="p-4 space-y-2 border-slate-200/80">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">សុវត្ថិភាពទិន្នន័យខ្ពស់</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            រក្សាទុកទិន្នន័យអាជីវកម្មរបស់អ្នកដោយសុវត្ថិភាព និងអាចចូលមើលបានគ្រប់ពេលវេលា។
          </p>
        </Card>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Button
          onClick={onNext}
          size="lg"
          variant="primary"
          className="w-full text-base font-bold shadow-md"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          ចាប់ផ្តើមរៀបចំអាជីវកម្ម
        </Button>
      </div>
    </div>
  );
};
