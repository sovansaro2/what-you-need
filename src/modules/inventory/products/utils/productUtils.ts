import { DEFAULT_MIN_STOCK_ALERT } from '../constants';
import { InventoryProduct } from '../types';

export type ProductStockStatusType = 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived';

export interface ProductStockStatusInfo {
  status: ProductStockStatusType;
  label: string;
  badgeClass: string;
  dotColor: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

/**
 * Unified calculation of product stock status and low stock detection.
 */
export function getProductStockStatus(product: {
  is_archived?: boolean;
  current_stock: number;
  min_stock_alert?: number | null;
}): ProductStockStatusInfo {
  if (product.is_archived) {
    return {
      status: 'archived',
      label: 'ប័ណ្ណសារ',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-500',
      isLowStock: false,
      isOutOfStock: false,
    };
  }

  const minAlert = product.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;

  if (product.current_stock <= 0) {
    return {
      status: 'out_of_stock',
      label: 'អស់ពីស្តុក',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
      isLowStock: true,
      isOutOfStock: true,
    };
  }

  if (product.current_stock <= minAlert) {
    return {
      status: 'low_stock',
      label: 'ជិតអស់ស្តុក',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      isLowStock: true,
      isOutOfStock: false,
    };
  }

  return {
    status: 'in_stock',
    label: 'មានស្តុក',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    isLowStock: false,
    isOutOfStock: false,
  };
}

/**
 * Check if a product is in low stock condition (current_stock <= min_stock_alert).
 */
export function isLowStockProduct(product: {
  is_archived?: boolean;
  current_stock: number;
  min_stock_alert?: number | null;
}): boolean {
  if (product.is_archived) return false;
  const minAlert = product.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;
  return product.current_stock <= minAlert;
}
