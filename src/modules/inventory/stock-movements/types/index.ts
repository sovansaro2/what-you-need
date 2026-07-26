export type StockMovementType = 'stock_in' | 'sale' | 'adjustment' | 'damage' | 'expired';

export type MovementSource = 'manual' | 'pos' | 'purchase' | 'system' | 'adjustment';

export type MovementStatus = 'completed' | 'pending' | 'cancelled' | 'failed';

export type MovementReferenceType =
  | 'manual'
  | 'purchase_order'
  | 'sales_invoice'
  | 'system_adjustment'
  | 'damage_report'
  | 'expired_disposal'
  | string;

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string | null;
  movement_type: StockMovementType;
  quantity: number; // Always positive magnitude
  delta: number; // Signed change: + for increase, - for decrease
  balance_before: number;
  balance_after: number;
  reason?: string | null;
  reference_type?: MovementReferenceType | null;
  reference_id?: string | null;
  reference_code?: string | null;
  movement_source: MovementSource;
  status?: MovementStatus;
  idempotency_key?: string | null;
  created_by?: string | null;
  created_at: string;
  notes?: string | null;
}

export interface StockBalanceSnapshot {
  product_id: string;
  balance_before: number;
  balance_after: number;
  delta: number;
}

export interface ProductStockSnapshot {
  product_id: string;
  product_name: string;
  sku?: string | null;
  current_stock: number;
  unit: string;
  min_stock_alert?: number | null;
}

export interface CreateStockMovementInput {
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reason?: string;
  reference_type?: MovementReferenceType;
  reference_id?: string;
  reference_code?: string;
  movement_source?: MovementSource;
  notes?: string;
  idempotency_key?: string;
  request_id?: string;
  expected_balance_before?: number;
}

export interface StockMovementResult {
  movement_id: string;
  product_id: string;
  movement_type: StockMovementType;
  balance_before: number;
  delta: number;
  balance_after: number;
  created_by: string;
  created_at: string;
  status: MovementStatus;
  movement: StockMovement;
  is_duplicate?: boolean;
  is_low_stock?: boolean;
  isLowStock?: boolean;
}

export interface TransactionOptions {
  allow_negative_stock?: boolean;
  skip_concurrency_check?: boolean;
  idempotency_key?: string;
}

export interface UpdateStockMovementInput {
  status?: MovementStatus;
  notes?: string;
}

export interface StockMovementFilter {
  product_id?: string;
  movement_type?: StockMovementType | 'all';
  movement_source?: MovementSource | 'all';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  sortBy?: 'created_at' | 'quantity' | 'product_name';
  sortOrder?: 'asc' | 'desc';
}

export interface StockMovementSummary {
  total_movements: number;
  total_stock_in: number;
  total_stock_out: number;
  total_adjustments: number;
  net_change: number;
}

export interface MovementStatistics {
  by_type: Record<StockMovementType, number>;
  by_reason: Record<string, number>;
  recent_movements_count: number;
}
