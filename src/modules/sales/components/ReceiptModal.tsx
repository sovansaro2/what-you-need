import React from 'react';
import { CheckCircle2, Printer, X, ShoppingBag } from 'lucide-react';
import { ProcessSaleResult, CartItem, Customer } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleResult: ProcessSaleResult | null;
  items: CartItem[];
  customer: Customer;
  businessName?: string;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  saleResult,
  items,
  customer,
  businessName = 'WHAT YOU NEED (WYN)',
  onNewSale,
}) => {
  if (!isOpen || !saleResult) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div id="receipt-modal-card" className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Confirmation Banner */}
        <div id="receipt-modal-banner" className="bg-emerald-600 p-6 text-white text-center relative">
          <button
            id="close-receipt-modal"
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-200" />
          <h3 className="font-bold text-lg">ការលក់ជោគជ័យ!</h3>
          <p className="text-emerald-100 text-xs">លេខវិក្កយបត្រ: {saleResult.sale_number}</p>
        </div>

        {/* Printable Receipt Preview Body */}
        <div id="printable-receipt-body" className="p-6 space-y-4 text-slate-800 max-h-[60vh] overflow-y-auto">
          <div id="receipt-header-center" className="text-center border-b border-dashed border-slate-200 pb-4">
            <h4 className="font-bold text-base text-slate-900">{businessName}</h4>
            <p className="text-xs text-slate-500">វិក្កយបត្រលក់ទំនិញ (Sales Invoice)</p>
            <p className="text-[11px] text-slate-400 mt-1">
              កាលបរិច្ឆេទ: {new Date(saleResult.sold_at).toLocaleString('km-KH')}
            </p>
          </div>

          <div id="receipt-customer-details" className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">អតិថិជន:</span>
              <span className="font-semibold text-slate-800">{customer.name}</span>
            </div>
            {customer.phone && (
              <div className="flex justify-between">
                <span className="text-slate-500">លេខទូរស័ព្ទ:</span>
                <span>{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div id="receipt-items-table" className="border-t border-b border-dashed border-slate-200 py-3 space-y-2 text-xs">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800 block">{item.product_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {item.quantity} x ${item.unit_price.toFixed(2)}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div id="receipt-totals-summary" className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
              <span>ទឹកប្រាក់សរុប (Total)</span>
              <span className="text-emerald-600">${saleResult.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ប្រាក់ទទួលបាន (Paid)</span>
              <span>${saleResult.paid_amount.toFixed(2)}</span>
            </div>
            {saleResult.change_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>ប្រាក់អាប់ (Change)</span>
                <span>${saleResult.change_amount.toFixed(2)}</span>
              </div>
            )}
            {saleResult.due_amount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>នៅខ្វះ (Due)</span>
                <span>${saleResult.due_amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-[11px] text-slate-400 italic">
            ~ សូមអរគុណ ជួបគ្នាវគ្គក្រោយ ~
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div id="receipt-modal-actions" className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            id="print-receipt-btn"
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            បោះពុម្ព (Print)
          </button>
          <button
            id="start-next-sale-btn"
            type="button"
            onClick={onNewSale}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            លក់បន្តទៀត (Next Sale)
          </button>
        </div>
      </div>
    </div>
  );
};
