import React from 'react';
import {
  ArrowDownLeft,
  ShoppingCart,
  SlidersHorizontal,
  AlertTriangle,
  CalendarX,
  Check,
} from 'lucide-react';
import { StockMovementType } from '../types';
import {
  MOVEMENT_TYPES,
  KHMER_MOVEMENT_LABELS,
  KHMER_MOVEMENT_DESCRIPTIONS,
  STATUS_COLORS,
} from '../constants';

interface MovementTypeSelectorProps {
  selectedType: StockMovementType;
  onSelectType: (type: StockMovementType) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<StockMovementType, React.ElementType> = {
  stock_in: ArrowDownLeft,
  sale: ShoppingCart,
  adjustment: SlidersHorizontal,
  damage: AlertTriangle,
  expired: CalendarX,
};

export const MovementTypeSelector: React.FC<MovementTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  disabled = false,
}) => {
  return (
    <div id="movement-type-selector" className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>ប្រភេទប្រតិបត្តិការស្តុក</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">ជ្រើសរើស ១</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MOVEMENT_TYPES.map((type) => {
          const Icon = ICON_MAP[type];
          const isSelected = selectedType === type;
          const colors = STATUS_COLORS[type];

          return (
            <button
              key={type}
              id={`movement-type-btn-${type}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectType(type)}
              className={`
                relative p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer min-h-[52px]
                flex items-start gap-3 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                ${
                  isSelected
                    ? `${colors.bg} ${colors.border} ring-2 ring-indigo-500/30 shadow-xs`
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}
              `}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isSelected ? colors.badge : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? colors.text : 'text-slate-900'
                    }`}
                  >
                    {KHMER_MOVEMENT_LABELS[type]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal line-clamp-1">
                  {KHMER_MOVEMENT_DESCRIPTIONS[type]}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-indigo-600 text-white shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
