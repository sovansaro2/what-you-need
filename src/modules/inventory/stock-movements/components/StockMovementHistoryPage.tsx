import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  Package,
} from 'lucide-react';
import { useStockMovements } from '../hooks/useStockMovements';
import { StockMovementType, StockMovement } from '../types';
import {
  MovementFilterBar,
  DatePreset,
} from './MovementFilterBar';
import { MovementStatisticsBar } from './MovementStatisticsBar';
import { StockMovementHistoryList } from './StockMovementHistoryList';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export const StockMovementHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id') || undefined;

  const { movements, loading, error, fetchMovements } = useStockMovements(
    initialProductId ? { product_id: initialProductId } : undefined,
    true
  );

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [movementType, setMovementType] = useState<StockMovementType | 'all'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setMovementType('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      movementType !== 'all' ||
      datePreset !== 'all' ||
      startDate !== '' ||
      endDate !== '' ||
      sortOrder !== 'desc'
    );
  }, [searchQuery, movementType, datePreset, startDate, endDate, sortOrder]);

  // Compute Statistics for StatisticsBar (from all movements in memory)
  const statisticsProps = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    let todayMovements = 0;
    let stockInCount = 0;
    let stockOutCount = 0;
    let adjustmentCount = 0;
    let damageCount = 0;
    let expiredCount = 0;

    for (const m of movements) {
      if (m.created_at && m.created_at.startsWith(todayStr)) {
        todayMovements++;
      }

      switch (m.movement_type) {
        case 'stock_in':
          stockInCount++;
          break;
        case 'sale':
          stockOutCount++;
          break;
        case 'adjustment':
          adjustmentCount++;
          break;
        case 'damage':
          damageCount++;
          break;
        case 'expired':
          expiredCount++;
          break;
      }
    }

    return {
      totalMovements: movements.length,
      todayMovements,
      stockInCount,
      stockOutCount,
      adjustmentCount,
      damageCount,
      expiredCount,
    };
  }, [movements]);

  // Filter and Search Logic
  const filteredMovements = useMemo(() => {
    let result = [...movements];

    // 1. Movement Type filter
    if (movementType !== 'all') {
      result = result.filter((m) => m.movement_type === movementType);
    }

    // 2. Date preset filter
    if (datePreset !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (datePreset === 'today') {
        result = result.filter((m) => new Date(m.created_at) >= todayStart);
      } else if (datePreset === 'yesterday') {
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        result = result.filter((m) => {
          const d = new Date(m.created_at);
          return d >= yesterdayStart && d < todayStart;
        });
      } else if (datePreset === 'last7') {
        const last7Start = new Date(todayStart);
        last7Start.setDate(last7Start.getDate() - 7);
        result = result.filter((m) => new Date(m.created_at) >= last7Start);
      } else if (datePreset === 'last30') {
        const last30Start = new Date(todayStart);
        last30Start.setDate(last30Start.getDate() - 30);
        result = result.filter((m) => new Date(m.created_at) >= last30Start);
      } else if (datePreset === 'custom') {
        if (startDate) {
          const s = new Date(startDate);
          result = result.filter((m) => new Date(m.created_at) >= s);
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          result = result.filter((m) => new Date(m.created_at) <= e);
        }
      }
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const matchName = m.product_name?.toLowerCase().includes(q);
        const matchSku = m.product_sku?.toLowerCase().includes(q);
        const matchReason = m.reason?.toLowerCase().includes(q);
        const matchRefCode = m.reference_code?.toLowerCase().includes(q);
        const matchRefType = m.reference_type?.toLowerCase().includes(q);
        const matchType = m.movement_type.toLowerCase().includes(q);
        const matchId = m.id.toLowerCase().includes(q);
        return (
          matchName ||
          matchSku ||
          matchReason ||
          matchRefCode ||
          matchRefType ||
          matchType ||
          matchId
        );
      });
    }

    // 4. Sorting (Newest vs Oldest)
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [movements, movementType, datePreset, startDate, endDate, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="ត្រឡប់ក្រោយ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>សវនកម្មស្តុក</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                ប្រវត្តិផ្លាស់ប្តូរស្តុក
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMovements()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
              title="ទាញយកទិន្នន័យថ្មី"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-3.5">
        {/* Statistics Overview Bar */}
        <div className="mb-3">
          <MovementStatisticsBar {...statisticsProps} />
        </div>

        {/* Filter and Search Bar */}
        <MovementFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          movementType={movementType}
          onMovementTypeChange={setMovementType}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          startDate={startDate}
          endDate={endDate}
          onCustomDateChange={handleCustomDateChange}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Content State Handling */}
        {loading && movements.length === 0 ? (
          <LoadingState count={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMovements} />
        ) : (
          <StockMovementHistoryList
            movements={filteredMovements}
            loading={loading}
            onResetFilters={handleResetFilters}
            isFiltered={hasActiveFilters}
          />
        )}
      </main>
    </div>
  );
};
