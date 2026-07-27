import React, { useState } from 'react';
import {
  ShoppingCart,
  User,
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  Building2,
  CreditCard,
  Clock,
  Percent,
} from 'lucide-react';
import { UseCartReturn } from '../hooks/useCart';
import { PAYMENT_METHODS } from '../constants';

interface CartDrawerProps {
  cart: UseCartReturn;
  onOpenCustomerModal: () => void;
  onCheckout: () => Promise<any>;
  processing: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onOpenCustomerModal,
  onCheckout,
  processing,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showTaxInput, setShowTaxInput] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'khqr':
        return <QrCode className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'credit':
        return <Clock className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const handleExecuteCheckout = async () => {
    setCheckoutError(null);
    try {
      await onCheckout();
    } catch (err: any) {
      setCheckoutError(err?.message || 'បរាជ័យក្នុងការកត់ត្រាការលក់');
    }
  };

  return (
    <div id="pos-cart-drawer" className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Customer Header Bar */}
      <div id="cart-customer-bar" className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div id="selected-customer-info" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              {cart.customer.name}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {cart.customer.phone || 'អតិថិជនទូទៅ'}
            </span>
          </div>
        </div>

        <button
          id="change-customer-btn"
          type="button"
          onClick={onOpenCustomerModal}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          ផ្លាស់ប្តូរ
        </button>
      </div>

      {/* Cart Validation Alert */}
      {(cart.validationError || checkoutError) && (
        <div id="cart-error-banner" className="p-3 bg-rose-50 text-rose-700 text-xs border-b border-rose-100 font-medium">
          {cart.validationError || checkoutError}
        </div>
      )}

      {/* Cart Items List */}
      <div id="cart-items-container" className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.cartItems.length === 0 ? (
          <div id="empty-cart-state" className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">មិនទាន់មានទំនិញក្នុងកន្ត្រកទេ</p>
          </div>
        ) : (
          cart.cartItems.map((item) => (
            <div
              key={item.product_id}
              id={`cart-item-${item.product_id}`}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-800">{item.product_name}</h4>
                  <span className="text-xs text-slate-500">
                    ${item.unit_price.toFixed(2)} / {item.unit_name || 'ឯកតា'}
                  </span>
                </div>
                <button
                  id={`remove-item-${item.product_id}`}
                  type="button"
                  onClick={() => cart.removeFromCart(item.product_id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div id={`qty-controls-${item.product_id}`} className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    id={`dec-qty-${item.product_id}`}
                    type="button"
                    onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-semibold text-slate-800 min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    id={`inc-qty-${item.product_id}`}
                    type="button"
                    onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800 block">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Controls */}
      <div id="cart-footer-controls" className="p-4 border-t border-slate-200 bg-white space-y-3">
        {/* Discount & Tax Toggle */}
        <div id="discount-tax-buttons" className="flex items-center justify-between text-xs">
          <button
            id="toggle-order-discount"
            type="button"
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className="text-slate-600 hover:text-emerald-600 font-medium flex items-center gap-1"
          >
            <Percent className="w-3.5 h-3.5" />
            បញ្ចុះតម្លៃសរុប
          </button>
          <button
            id="toggle-order-tax"
            type="button"
            onClick={() => setShowTaxInput(!showTaxInput)}
            className="text-slate-600 hover:text-emerald-600 font-medium"
          >
            ពន្ធ (Tax)
          </button>
        </div>

        {/* Discount Input Row */}
        {showDiscountInput && (
          <div id="discount-input-row" className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-600">បញ្ចុះតម្លៃ ($):</span>
            <input
              id="order-discount-input"
              type="number"
              min="0"
              step="0.5"
              value={cart.discountAmount || ''}
              onChange={(e) => cart.setOrderDiscount(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-28 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Tax Input Row */}
        {showTaxInput && (
          <div id="tax-input-row" className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-600">ពន្ធ ($):</span>
            <input
              id="order-tax-input"
              type="number"
              min="0"
              step="0.5"
              value={cart.taxAmount || ''}
              onChange={(e) => cart.setOrderTax(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-28 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Calculation Table */}
        <div id="calculation-summary-table" className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex justify-between">
            <span>តម្លៃសរុបដើម (Subtotal)</span>
            <span className="font-medium text-slate-800">${cart.totals.subtotal.toFixed(2)}</span>
          </div>
          {cart.totals.discount_amount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>បញ្ចុះតម្លៃ (Discount)</span>
              <span>-${cart.totals.discount_amount.toFixed(2)}</span>
            </div>
          )}
          {cart.totals.tax_amount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>ពន្ធ (Tax)</span>
              <span>+${cart.totals.tax_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>ទឹកប្រាក់ត្រូវទូទាត់ (Total)</span>
            <span className="text-emerald-600">${cart.totals.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div id="payment-methods-grid" className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            វិធីសាស្ត្រទូទាត់ (Accounting Method)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_METHODS.slice(0, 3).map((pm) => {
              const active = cart.paymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  id={`pm-btn-${pm.id}`}
                  type="button"
                  onClick={() => cart.setPaymentMethod(pm.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-medium transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {getMethodIcon(pm.id)}
                  <span className="mt-1">{pm.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paid Amount Input */}
        <div id="paid-amount-row" className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-medium text-slate-700">ប្រាក់ទទួលបាន ($):</span>
          <input
            id="paid-amount-input"
            type="number"
            min="0"
            step="1"
            value={cart.paidAmount || ''}
            onChange={(e) => cart.setPaidAmount(Number(e.target.value) || 0)}
            placeholder={cart.totals.total_amount.toFixed(2)}
            className="w-32 px-3 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-right"
          />
        </div>

        {/* Checkout Primary Button */}
        <button
          id="execute-checkout-btn"
          type="button"
          disabled={cart.cartItems.length === 0 || processing}
          onClick={handleExecuteCheckout}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          {processing ? 'កំពុងដំណើរការ...' : `ទូទាត់ប្រាក់ $${cart.totals.total_amount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};
