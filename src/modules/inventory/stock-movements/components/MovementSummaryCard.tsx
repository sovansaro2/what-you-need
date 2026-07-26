import React from 'react';
import {
  ClipboardList,
  ArrowRight,
  Tag,
  Hash,
  FileText,
} from 'lucide-react';
import { StockMovementType } from '../types';
import { KHMER_MOVEMENT_LABELS, STATUS_COLORS } from '../constants';

interface MovementSummaryCardProps {
  productName: string;
  movementType: StockMovementType;
  quantity: number;
  delta: number;
  currentStock: number;
  projectedStock: number;
  unit: string;
  reason?: string;
  referenceCode?: string;
  notes?: string;
}

export const MovementSummaryCard: React.FC<MovementSummaryCardProps> = ({
  productName,
  movementType,
  quantity,
  delta,
  currentStock,
  projectedStock,
  unit,
  reason,
  referenceCode,
  notes,
}) => {
  const colors = STATUS_COLORS[movementType];

  return (
    <div
      id="movement-summary-card"
      className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3.5 border border-slate-800"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-indigo-400 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            សេចក្តីសង្ខេបប្រតិបត្តិការ (Summary Review)
          </h3>
        </div>
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors.badge}`}
        >
          {KHMER_MOVEMENT_LABELS[movementType]}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Product Name */}
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">ទំនិញ៖</span>
          <span className="font-bold text-slate-100 truncate max-w-[200px]">
            {productName}
          </span>
        </div>

        {/* Quantity & Delta */}
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">បរិមាណប្រតិបត្តិការ៖</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {quantity} {unit} ({delta > 0 ? `+${delta}` : delta})
          </span>
        </div>

        {/* Stock Shift: Current -> Projected */}
        <div className="flex justify-between items-center text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400">ការផ្លាស់ប្តូរស្តុក៖</span>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-slate-300">{currentStock}</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            <span
              className={
                projectedStock < 0
                  ? 'text-rose-400'
                  : projectedStock === 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {projectedStock} {unit}
            </span>
          </div>
        </div>

        {/* Reason */}
        {reason && (
          <div className="flex items-start justify-between gap-2 text-slate-300 pt-1 border-t border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>មូលហេតុ៖</span>
            </span>
            <span className="font-medium text-slate-200 text-right truncate max-w-[220px]">
              {reason}
            </span>
          </div>
        )}

        {/* Ref Code */}
        {referenceCode && (
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1 shrink-0">
              <Hash className="w-3 h-3 text-indigo-400" />
              <span>លេខយោង៖</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{referenceCode}</span>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="flex items-start justify-between gap-2 text-slate-300">
            <span className="text-slate-400 flex items-center gap-1 shrink-0">
              <FileText className="w-3 h-3 text-indigo-400" />
              <span>កំណត់សម្គាល់៖</span>
            </span>
            <span className="font-normal italic text-slate-300 text-right line-clamp-2 max-w-[220px]">
              {notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
