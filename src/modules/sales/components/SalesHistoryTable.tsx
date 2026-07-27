import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, FileText, Calendar, Eye } from 'lucide-react';
import { Sale, SaleFilter } from '../types';
import { salesService } from '../services/salesService';
import { PAYMENT_STATUS_LABELS } from '../constants';

interface SalesHistoryTableProps {
  userId: string;
}

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({ userId }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [filter, setFilter] = useState<SaleFilter>({
    searchQuery: '',
    payment_status: 'all',
    payment_method: 'all',
  });

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await salesService.getSaleHistory(userId, filter);
      setSales(data || []);
    } catch (err) {
      console.error('Failed to load sales history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div id="sales-history-container" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div id="sales-history-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ប្រវត្តិការលក់ (Sales History)</h1>
          <p className="text-sm text-slate-500">មើលកំណត់ត្រាការលក់ និង វិក្កយបត្រទាំងអស់</p>
        </div>

        <button
          id="refresh-sales-history"
          type="button"
          onClick={loadHistory}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ទាញយកទិន្នន័យថ្មី
        </button>
      </div>

      {/* Filter Bar */}
      <div id="sales-filter-card" className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div id="filter-search-wrapper" className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="sales-search-input"
            type="text"
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, ឈ្មោះអតិថិជន..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div id="filter-payment-status" className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="payment-status-select"
            value={filter.payment_status || 'all'}
            onChange={(e) => setFilter((prev) => ({ ...prev, payment_status: e.target.value as any }))}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">ស្ថានភាពទូទាត់ទាំងអស់</option>
            <option value="paid">បង់រួច (Paid)</option>
            <option value="partial">បង់ខ្លះ (Partial)</option>
            <option value="unpaid">មិនទាន់បង់ (Unpaid)</option>
          </select>
        </div>

        <div id="filter-payment-method">
          <select
            id="payment-method-select"
            value={filter.payment_method || 'all'}
            onChange={(e) => setFilter((prev) => ({ ...prev, payment_method: e.target.value as any }))}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">វិធីសាស្ត្រទូទាត់ទាំងអស់</option>
            <option value="cash">សាច់ប្រាក់ (Cash)</option>
            <option value="khqr">KHQR</option>
            <option value="bank_transfer">វេរប្រាក់តាមធនាគារ</option>
            <option value="credit">ជំពាក់ (Credit)</option>
          </select>
        </div>
      </div>

      {/* Sales History Table */}
      <div id="sales-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">កំពុងទាញយកប្រវត្តិការលក់...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">មិនទាន់មានប្រវត្តិការលក់នៅឡើយទេ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">លេខវិក្កយបត្រ</th>
                  <th className="p-3.5">កាលបរិច្ឆេទ</th>
                  <th className="p-3.5">អតិថិជន</th>
                  <th className="p-3.5">វិធីសាស្ត្រ</th>
                  <th className="p-3.5">ទឹកប្រាក់សរុប</th>
                  <th className="p-3.5">បានបង់</th>
                  <th className="p-3.5">ស្ថានភាព</th>
                  <th className="p-3.5 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {sales.map((sale) => {
                  const statusInfo = PAYMENT_STATUS_LABELS[sale.payment_status] || {
                    label: sale.payment_status,
                    color: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-emerald-700">
                        {sale.sale_number}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(sale.sold_at).toLocaleString('km-KH')}
                      </td>
                      <td className="p-3.5 font-medium">{sale.customer_name}</td>
                      <td className="p-3.5 uppercase">{sale.payment_method}</td>
                      <td className="p-3.5 font-bold text-slate-900">${sale.total_amount.toFixed(2)}</td>
                      <td className="p-3.5 font-medium text-emerald-600">${sale.paid_amount.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          id={`view-sale-${sale.id}`}
                          type="button"
                          onClick={() => setSelectedSale(sale)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ពិនិត្យ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div id="sale-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">វិក្កយបត្រ #{selectedSale.sale_number}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedSale.sold_at).toLocaleString('km-KH')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">អតិថិជន:</span>
                <span className="font-semibold text-slate-800">{selectedSale.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">វិធីសាស្ត្រទូទាត់:</span>
                <span className="uppercase font-medium">{selectedSale.payment_method}</span>
              </div>

              {/* Items */}
              <div className="border-t border-b border-slate-100 py-3 space-y-2">
                {(selectedSale.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between">
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

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>សរុប (Total):</span>
                  <span className="text-emerald-600">${selectedSale.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>បានបង់ (Paid):</span>
                  <span>${selectedSale.paid_amount.toFixed(2)}</span>
                </div>
                {selectedSale.due_amount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>នៅខ្វះ (Due):</span>
                    <span>${selectedSale.due_amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
