import React from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';

interface QuantityInputProps {
  quantity: number | string;
  onChangeQuantity: (val: number) => void;
  unit?: string;
  error?: string | null;
  disabled?: boolean;
}

const PRESET_STEPS = [1, 5, 10, 50, 100];

export const QuantityInput: React.FC<QuantityInputProps> = ({
  quantity,
  onChangeQuantity,
  unit = 'ឯកតា',
  error = null,
  disabled = false,
}) => {
  const numericValue = typeof quantity === 'number' ? quantity : parseFloat(quantity) || 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChangeQuantity(0);
      return;
    }
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeQuantity(parsed);
    }
  };

  const handleIncrement = (amount = 1) => {
    if (disabled) return;
    const current = Math.max(0, numericValue);
    onChangeQuantity(Number((current + amount).toFixed(4)));
  };

  const handleDecrement = (amount = 1) => {
    if (disabled) return;
    const current = Math.max(0, numericValue);
    const nextVal = Math.max(0, current - amount);
    onChangeQuantity(Number(nextVal.toFixed(4)));
  };

  return (
    <div id="quantity-input-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="stock-quantity-input"
          className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>បរិមាណប្រតិបត្តិការ</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">ឯកតា៖ {unit}</span>
      </div>

      {/* Main Large Quantity Control Box */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          {/* Minus Button */}
          <button
            type="button"
            id="qty-btn-decrement"
            disabled={disabled || numericValue <= 0}
            onClick={() => handleDecrement(1)}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shrink-0 border border-slate-200"
            title="កាត់បន្ថយ ១"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Number Input Field */}
          <div className="relative flex-1">
            <input
              id="stock-quantity-input"
              type="number"
              inputMode="decimal"
              min="0.0001"
              step="any"
              disabled={disabled}
              value={numericValue === 0 ? '' : numericValue}
              onChange={handleInputChange}
              placeholder="0"
              className={`
                w-full text-center text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 bg-slate-50/80
                py-2.5 px-3 rounded-xl border transition-all focus:outline-none focus:ring-2
                ${
                  error
                    ? 'border-rose-300 ring-rose-500/20 bg-rose-50/20 text-rose-900'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              {unit}
            </span>
          </div>

          {/* Plus Button */}
          <button
            type="button"
            id="qty-btn-increment"
            disabled={disabled}
            onClick={() => handleIncrement(1)}
            className="w-12 h-12 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shrink-0 border border-indigo-200"
            title="បន្ថែម ១"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1">បន្ថែមរហ័ស៖</span>
          {PRESET_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              id={`qty-preset-${step}`}
              disabled={disabled}
              onClick={() => handleIncrement(step)}
              className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer min-h-[36px] flex items-center border border-slate-200/60"
            >
              +{step}
            </button>
          ))}
          {numericValue > 0 && (
            <button
              type="button"
              id="qty-preset-clear"
              disabled={disabled}
              onClick={() => onChangeQuantity(0)}
              className="py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all cursor-pointer min-h-[36px] flex items-center border border-rose-200 ml-auto"
            >
              សម្អាត
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Message */}
      {error && (
        <div
          id="quantity-error-msg"
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
