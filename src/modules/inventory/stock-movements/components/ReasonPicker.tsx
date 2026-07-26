import React, { useState, useEffect } from 'react';
import { Tag, AlertCircle } from 'lucide-react';
import { StockMovementType } from '../types';
import {
  DEFAULT_ADJUSTMENT_REASONS,
  DEFAULT_DAMAGE_REASONS,
  DEFAULT_EXPIRED_REASONS,
} from '../constants';

interface ReasonPickerProps {
  movementType: StockMovementType;
  reason: string;
  onChangeReason: (val: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const ReasonPicker: React.FC<ReasonPickerProps> = ({
  movementType,
  reason,
  onChangeReason,
  error = null,
  disabled = false,
}) => {
  const isReasonRequired =
    movementType === 'adjustment' ||
    movementType === 'damage' ||
    movementType === 'expired';

  let presetChips: string[] = [];
  if (movementType === 'adjustment') {
    presetChips = DEFAULT_ADJUSTMENT_REASONS;
  } else if (movementType === 'damage') {
    presetChips = DEFAULT_DAMAGE_REASONS;
  } else if (movementType === 'expired') {
    presetChips = DEFAULT_EXPIRED_REASONS;
  }

  const [customInput, setCustomInput] = useState(reason || '');

  useEffect(() => {
    setCustomInput(reason || '');
  }, [reason]);

  const handleChipClick = (chip: string) => {
    if (disabled) return;
    onChangeReason(chip);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    onChangeReason(val);
  };

  return (
    <div id="reason-picker-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="movement-reason-input"
          className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>មូលហេតុប្រតិបត្តិការ</span>
          {isReasonRequired ? (
            <span className="text-rose-500">*</span>
          ) : (
            <span className="text-slate-400 font-normal text-[11px]">(ជម្រើសបន្ថែម)</span>
          )}
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          {isReasonRequired ? 'តម្រូវឱ្យជ្រើសរើស' : 'មិនបង្ខំ'}
        </span>
      </div>

      {/* Preset Chips */}
      {presetChips.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-500 font-medium block">
            ជ្រើសរើសមូលហេតុរហ័ស៖
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetChips.map((chip) => {
              const isSelected = reason === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  id={`reason-chip-${chip.substring(0, 10)}`}
                  disabled={disabled}
                  onClick={() => handleChipClick(chip)}
                  className={`
                    py-1.5 px-3 rounded-xl font-medium text-xs transition-all cursor-pointer min-h-[38px]
                    flex items-center gap-1.5 border select-none
                    ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Tag className="w-3 h-3 shrink-0" />
                  <span>{chip}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Reason Input */}
      <div className="relative">
        <input
          id="movement-reason-input"
          type="text"
          disabled={disabled}
          value={customInput}
          onChange={handleInputChange}
          placeholder={
            isReasonRequired
              ? 'សូមជ្រើសរើស ឬបញ្ចូលមូលហេតុនៅទីនេះ...'
              : 'បញ្ចូលមូលហេតុ ឬការពិពណ៌នាបន្ថែម (បើមាន)...'
          }
          className={`
            w-full text-xs font-medium text-slate-900 bg-white py-3 px-3.5 rounded-xl border transition-all
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-rose-300 ring-rose-500/20 bg-rose-50/20 text-rose-900'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* Validation Error Message */}
      {error && (
        <div
          id="reason-error-msg"
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
