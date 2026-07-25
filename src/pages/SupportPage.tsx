import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headset, PhoneCall, Mail, MessageSquare, Clock, Send, ShieldAlert } from 'lucide-react';
import { Card, Button, Input } from '@/components/common';

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    alert('សាររបស់អ្នកត្រូវបានផ្ញើជូនអ្នកគ្រប់គ្រងរួចរាល់ហើយ!');
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-6 animate-fade-in">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ក្រោយ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            ទំនាក់ទំនងអ្នកគ្រប់គ្រង (Contact Administrator)
          </h1>
          <p className="text-xs text-slate-500">
            ស្នើសុំជំនួយបច្ចេកទេស ឬរាយការណ៍បញ្ហាប្រព័ន្ធ
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-5 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Headset className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ព័ត៌មានទំនាក់ទំនង</h3>
            <p className="text-xs text-slate-500">ទំនាក់ទំនងអ្នកគ្រប់គ្រងប្រព័ន្ធផ្ទាល់</p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 gap-3">
          <a
            href="tel:+85512345678"
            className="p-3.5 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100/80 text-teal-700 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">លេខទូរស័ព្ទគាំទ្រ (Phone)</p>
                <p className="text-xs text-slate-600 font-medium">+855 12 345 678</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
              ទូរស័ព្ទ
            </span>
          </a>

          <a
            href="mailto:support@pos-system.com"
            className="p-3.5 bg-slate-50 hover:bg-sky-50/50 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100/80 text-sky-700 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">អ៊ីមែលគាំទ្រ (Email)</p>
                <p className="text-xs text-slate-600 font-medium">support@pos-system.com</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
              អ៊ីមែល
            </span>
          </a>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-100/80 text-indigo-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">ម៉ោងធ្វើការ (Working Hours)</p>
              <p className="text-xs text-slate-600">ចន្ទ - អាទិត្យ (8:00 AM - 8:00 PM)</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            ផ្ញើសារសួរព័ត៌មាន ឬរាយការណ៍
          </h4>

          <form onSubmit={handleSendMessage} className="space-y-3">
            <Input
              label="ប្រធានបទ"
              placeholder="ឧទាហរណ៍៖ ស្នើសុំបន្ថែមមុខងារ..."
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                បរិយាយលម្អិត
              </label>
              <textarea
                rows={3}
                placeholder="រៀបរាប់ពីបញ្ហា ឬសំណួររបស់អ្នក..."
                required
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold min-h-[44px]"
              icon={<Send className="w-4 h-4" />}
            >
              ផ្ញើសារជូនអ្នកគ្រប់គ្រង
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
