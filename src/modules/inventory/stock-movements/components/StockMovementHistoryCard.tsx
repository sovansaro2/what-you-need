import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  AlertTriangle,
  CalendarX,
  User,
  Clock,
  Hash,
  FileText,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  Key,
} from 'lucide-react';
import { StockMovement, StockMovementType } from '../types';

interface StockMovementHistoryCardProps {
  movement: StockMovement;
}

export const StockMovementHistoryCard: React.FC<StockMovementHistoryCardProps> = ({
  movement,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMovementConfig = (type: StockMovementType) => {
    switch (type) {
      case 'stock_in':
        return {
          label: 'បញ្ចូលស្តុក',
          subLabel: 'Stock In',
          icon: ArrowDownLeft,
          bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          badgeBg: 'bg-emerald-100/90 text-emerald-800',
          deltaPrefix: '+',
          deltaColor: 'text-emerald-700',
        };
      case 'sale':
        return {
          label: 'លក់ចេញ',
          subLabel: 'Sale',
          icon: ArrowUpRight,
          bgColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
          badgeBg: 'bg-blue-100/90 text-blue-800',
          deltaPrefix: '',
          deltaColor: 'text-blue-700',
        };
      case 'adjustment':
        return {
          label: 'កែសម្រួល',
          subLabel: 'Adjustment',
          icon: Sliders,
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
          badgeBg: 'bg-amber-100/90 text-amber-900',
          deltaPrefix: movement.delta > 0 ? '+' : '',
          deltaColor: movement.delta >= 0 ? 'text-amber-800' : 'text-rose-700',
        };
      case 'damage':
        return {
          label: 'ខូចខាត',
          subLabel: 'Damage',
          icon: AlertTriangle,
          bgColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
          badgeBg: 'bg-rose-100/90 text-rose-800',
          deltaPrefix: '',
          deltaColor: 'text-rose-700',
        };
      case 'expired':
        return {
          label: 'ហួសកាលកំណត់',
          subLabel: 'Expired',
          icon: CalendarX,
          bgColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
          badgeBg: 'bg-purple-100/90 text-purple-800',
          deltaPrefix: '',
          deltaColor: 'text-purple-700',
        };
      default:
        return {
          label: 'ចលនាស្តុក',
          subLabel: 'Movement',
          icon: ArrowDownLeft,
          bgColor: 'bg-slate-50 text-slate-700 border-slate-200',
          badgeBg: 'bg-slate-100 text-slate-800',
          deltaPrefix: '',
          deltaColor: 'text-slate-800',
        };
    }
  };

  const config = getMovementConfig(movement.movement_type);
  const MovementIcon = config.icon;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString('km-KH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        timeStr: date.toLocaleTimeString('km-KH', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { dateStr: isoString, timeStr: '' };
    }
  };

  const { dateStr, timeStr } = formatDate(movement.created_at);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden">
      {/* Primary Card View */}
      <div className="p-3.5 sm:p-4">
        {/* Header: Icon, Type Badge, Product Name & Status */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${config.bgColor}`}
            >
              <MovementIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${config.badgeBg}`}
                >
                  <span>{config.label}</span>
                </span>
                {movement.product_sku && (
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-0.5">
                    <Tag className="w-3 h-3 text-slate-300" />
                    {movement.product_sku}
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-slate-900 truncate leading-snug">
                {movement.product_name || 'ផលិតផលអត់ឈ្មោះ'}
              </h4>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200/60 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="hidden xs:inline">បានរួចរាល់</span>
          </div>
        </div>

        {/* Stock Balance Transition Box */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/90 rounded-xl border border-slate-100 text-center my-3">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-500 font-medium mb-0.5">
              ស្តុកមុន
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {movement.balance_before.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-slate-200/60 px-1">
            <span className="text-[11px] text-slate-500 font-medium mb-0.5">
              បម្រែបម្រួល
            </span>
            <span className={`text-sm font-bold ${config.deltaColor}`}>
              {config.deltaPrefix}
              {movement.delta.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-500 font-medium mb-0.5">
              ស្តុកក្រោយ
            </span>
            <span className="text-sm font-bold text-slate-900">
              {movement.balance_after.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metadata Grid (Reason & Reference) */}
        {(movement.reason || movement.reference_code) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
            {movement.reason && (
              <div className="flex items-center gap-1.5 bg-slate-100/70 px-2.5 py-1.5 rounded-lg border border-slate-200/50 min-w-0">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 shrink-0">មូលហេតុ:</span>
                <span className="font-medium text-slate-700 truncate">
                  {movement.reason}
                </span>
              </div>
            )}

            {movement.reference_code && (
              <div className="flex items-center gap-1.5 bg-slate-100/70 px-2.5 py-1.5 rounded-lg border border-slate-200/50 min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 shrink-0">លេខយោង:</span>
                <span className="font-mono font-medium text-slate-700 truncate">
                  {movement.reference_code}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer info: User, Date/Time & Audit Toggle */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {dateStr} {timeStr && `• ${timeStr}`}
              </span>
            </div>

            {movement.created_by && (
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {movement.created_by === 'guest_user' ? 'អ្នកប្រើប្រាស់' : movement.created_by}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-blue-600 font-medium rounded-lg hover:bg-slate-100 transition-colors min-h-[36px] touch-manipulation"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">ព័ត៌មានលម្អិត</span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Audit Trail Expanded Details */}
      {showDetails && (
        <div className="bg-slate-900 text-slate-200 p-3.5 sm:p-4 text-xs space-y-2 border-t border-slate-800 animate-fadeIn font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              កំណត់ត្រាសវនកម្ម (Audit Ledger Record)
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              មិនអាចកែប្រែបាន (Immutable)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-sans">ID ប្រតិបត្តិការ:</span>
              <span className="text-slate-200 text-[11px] truncate">{movement.id}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-sans">ប្រភពប្រតិបត្តិការ:</span>
              <span className="text-slate-200 text-[11px]">{movement.movement_source}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-sans">ប្រភេទសេចក្តីយោង:</span>
              <span className="text-slate-200 text-[11px]">
                {movement.reference_type || 'manual'}
              </span>
            </div>

            {movement.reference_id && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-sans">ID សេចក្តីយោង:</span>
                <span className="text-slate-200 text-[11px] truncate">
                  {movement.reference_id}
                </span>
              </div>
            )}

            {movement.idempotency_key && (
              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  Idempotency Key:
                </span>
                <span className="text-amber-300 text-[11px] truncate max-w-[220px] sm:max-w-none">
                  {movement.idempotency_key}
                </span>
              </div>
            )}

            {movement.notes && (
              <div className="sm:col-span-2 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400 font-sans block mb-0.5">ចំណាំបន្ថែម:</span>
                <span className="text-slate-300 font-sans italic">{movement.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
