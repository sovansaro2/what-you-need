import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Tag,
  Layers,
  AlertTriangle,
  Archive,
  Save,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { InventoryProduct } from '../../products/types';
import { StockMovementType, CreateStockMovementInput } from '../types';
import { stockMovementValidator } from '../validators/stockMovementValidator';
import { MovementTypeSelector } from './MovementTypeSelector';
import { QuantityInput } from './QuantityInput';
import { ProjectedStockCard } from './ProjectedStockCard';
import { ReasonPicker } from './ReasonPicker';
import { ReferenceNoteInput } from './ReferenceNoteInput';
import { MovementSummaryCard } from './MovementSummaryCard';

interface StockMovementFormProps {
  product: InventoryProduct;
  onSubmit: (input: CreateStockMovementInput) => Promise<boolean>;
  onCancel: () => void;
  submitting?: boolean;
  externalError?: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const StockMovementForm: React.FC<StockMovementFormProps> = ({
  product,
  onSubmit,
  onCancel,
  submitting = false,
  externalError = null,
  onDirtyChange,
}) => {
  const [movementType, setMovementType] = useState<StockMovementType>('stock_in');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculate delta & projected stock dynamically
  const { delta, projectedStock } = useMemo(() => {
    const current = product.current_stock ?? 0;
    const qty = Math.abs(quantity);
    let d = 0;

    switch (movementType) {
      case 'stock_in':
        d = qty;
        break;
      case 'sale':
      case 'damage':
      case 'expired':
        d = -qty;
        break;
      case 'adjustment':
        d = quantity; // Adjustment quantity is delta directly
        break;
      default:
        d = qty;
    }

    const proj = Math.max(0, current + d);
    return { delta: d, projectedStock: proj };
  }, [product.current_stock, movementType, quantity]);

  // Track dirty state
  useEffect(() => {
    const isDirty =
      movementType !== 'stock_in' ||
      quantity !== 1 ||
      reason.trim() !== '' ||
      referenceCode.trim() !== '' ||
      notes.trim() !== '';
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [movementType, quantity, reason, referenceCode, notes, onDirtyChange]);

  const handleMovementTypeChange = (type: StockMovementType) => {
    setMovementType(type);
    setReason('');
    setFormErrors((prev) => ({ ...prev, movement_type: '', reason: '' }));
  };

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    setFormErrors((prev) => ({ ...prev, quantity: '', stock: '' }));
  };

  const handleReasonChange = (val: string) => {
    setReason(val);
    setFormErrors((prev) => ({ ...prev, reason: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateStockMovementInput = {
      product_id: product.id,
      movement_type: movementType,
      quantity,
      reason,
      reference_code: referenceCode,
      notes,
      movement_source: 'manual',
      reference_type: 'manual',
      expected_balance_before: product.current_stock ?? 0,
      idempotency_key: `mvt_req_${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    // Client validation check
    const validation = stockMovementValidator.validateMovementPayload(payload, product);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await onSubmit(payload);
  };

  return (
    <form id="stock-movement-form" onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Product Context Card (Read-only) */}
      <div
        id="product-context-card"
        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.is_archived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                <Archive className="w-3 h-3" />
                <span>ប័ណ្ណសារ (Archived)</span>
              </span>
            )}
            {product.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{product.category}</span>
              </span>
            )}
            {product.unit && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{product.unit}</span>
              </span>
            )}
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {product.name}
          </h2>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-medium">ស្តុកបច្ចុប្បន្ន៖</span>
            <span className="font-extrabold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {product.current_stock ?? 0} {product.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Global External or Form Error */}
      {(externalError || formErrors.product || formErrors.stock) && (
        <div
          id="global-movement-error"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-700"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            {externalError || formErrors.product || formErrors.stock}
          </span>
        </div>
      )}

      {/* 2. Movement Type Selector */}
      <MovementTypeSelector
        selectedType={movementType}
        onSelectType={handleMovementTypeChange}
        disabled={submitting || product.is_archived}
      />

      {/* 3. Quantity Input */}
      <QuantityInput
        quantity={quantity}
        onChangeQuantity={handleQuantityChange}
        unit={product.unit}
        error={formErrors.quantity}
        disabled={submitting || product.is_archived}
      />

      {/* 4. Projected Stock Card */}
      <ProjectedStockCard
        currentStock={product.current_stock ?? 0}
        delta={delta}
        projectedStock={projectedStock}
        unit={product.unit}
        minStockAlert={product.min_stock_alert}
        movementType={movementType}
      />

      {/* 5. Reason Picker */}
      <ReasonPicker
        movementType={movementType}
        reason={reason}
        onChangeReason={handleReasonChange}
        error={formErrors.reason}
        disabled={submitting || product.is_archived}
      />

      {/* 6. Reference & Note Input */}
      <ReferenceNoteInput
        referenceCode={referenceCode}
        onChangeReferenceCode={setReferenceCode}
        notes={notes}
        onChangeNotes={setNotes}
        disabled={submitting || product.is_archived}
      />

      {/* 7. Movement Summary Review Card */}
      <MovementSummaryCard
        productName={product.name}
        movementType={movementType}
        quantity={quantity}
        delta={delta}
        currentStock={product.current_stock ?? 0}
        projectedStock={projectedStock}
        unit={product.unit}
        reason={reason}
        referenceCode={referenceCode}
        notes={notes}
      />

      {/* 8. Sticky Action Footer Bar */}
      <div
        id="stock-movement-sticky-footer"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 sm:p-4 shadow-lg pb-safe"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-end gap-3">
          <button
            type="button"
            id="movement-cancel-btn"
            disabled={submitting}
            onClick={onCancel}
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2 border border-slate-200/80 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>បោះបង់</span>
          </button>

          <button
            type="submit"
            id="movement-submit-btn"
            disabled={submitting || product.is_archived || projectedStock < 0}
            className={`
              py-3 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2
              ${
                submitting || product.is_archived || projectedStock < 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }
            `}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>កំពុងរក្សាទុក...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>រក្សាទុកការផ្លាស់ប្តូរ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
