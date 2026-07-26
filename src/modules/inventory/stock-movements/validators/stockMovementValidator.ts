import { CreateStockMovementInput, StockMovementType, MovementSource } from '../types';
import {
  KHMER_MOVEMENT_ERRORS,
  MOVEMENT_TYPES,
  DEFAULT_CONFIG,
} from '../constants';
import { InventoryProduct } from '../../products/types';

/**
 * Pure validation functions for Stock Movement operations.
 * Strictly free of side-effects, DOM, React hooks, or database calls.
 */

export function validateQuantity(quantity: number | undefined | null): string | null {
  if (quantity === undefined || quantity === null || Number.isNaN(quantity)) {
    return KHMER_MOVEMENT_ERRORS.MISSING_QUANTITY;
  }

  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    return KHMER_MOVEMENT_ERRORS.INVALID_QUANTITY;
  }

  if (quantity > DEFAULT_CONFIG.MAX_MOVEMENT_QUANTITY) {
    return KHMER_MOVEMENT_ERRORS.MAX_QUANTITY_EXCEEDED;
  }

  return null;
}

export function validateMovementType(type: string | undefined | null): string | null {
  if (!type || !type.trim()) {
    return KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
  }

  if (!MOVEMENT_TYPES.includes(type as StockMovementType)) {
    return KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
  }

  return null;
}

export function validateReason(
  movementType: StockMovementType,
  reason?: string | null
): string | null {
  // Reason is mandatory for adjustment, damage, and expired movements
  if (
    movementType === 'adjustment' ||
    movementType === 'damage' ||
    movementType === 'expired'
  ) {
    if (!reason || !reason.trim()) {
      return KHMER_MOVEMENT_ERRORS.MISSING_REASON;
    }
  }
  return null;
}

export function validateArchivedProduct(
  product: Pick<InventoryProduct, 'is_archived'> | null | undefined
): string | null {
  if (!product) {
    return KHMER_MOVEMENT_ERRORS.PRODUCT_NOT_FOUND;
  }

  if (product.is_archived) {
    return KHMER_MOVEMENT_ERRORS.ARCHIVED_PRODUCT;
  }

  return null;
}

export function validateStockAvailability(
  currentStock: number,
  quantity: number,
  movementType: StockMovementType
): string | null {
  // For outgoing movements (sale, damage, expired), current stock must be sufficient
  if (
    movementType === 'sale' ||
    movementType === 'damage' ||
    movementType === 'expired'
  ) {
    if (currentStock < quantity) {
      return KHMER_MOVEMENT_ERRORS.INSUFFICIENT_STOCK;
    }
  }

  return null;
}

export function validateMovementSource(source?: string | null): string | null {
  const validSources: MovementSource[] = ['manual', 'pos', 'purchase', 'system', 'adjustment'];
  if (source && !validSources.includes(source as MovementSource)) {
    return KHMER_MOVEMENT_ERRORS.UNEXPECTED_ERROR;
  }
  return null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMovementPayload(
  input: CreateStockMovementInput,
  product: InventoryProduct
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Product archived check
  const archiveErr = validateArchivedProduct(product);
  if (archiveErr) {
    errors.product = archiveErr;
  }

  // 2. Movement type check
  const typeErr = validateMovementType(input.movement_type);
  if (typeErr) {
    errors.movement_type = typeErr;
  }

  // 3. Quantity check
  const qtyErr = validateQuantity(input.quantity);
  if (qtyErr) {
    errors.quantity = qtyErr;
  }

  // 4. Reason check
  const reasonErr = validateReason(input.movement_type, input.reason);
  if (reasonErr) {
    errors.reason = reasonErr;
  }

  // 5. Availability check (only if quantity is valid)
  if (!qtyErr) {
    const stockErr = validateStockAvailability(
      product.current_stock,
      input.quantity,
      input.movement_type
    );
    if (stockErr) {
      errors.stock = stockErr;
    }
  }

  // 6. Source check
  const sourceErr = validateMovementSource(input.movement_source);
  if (sourceErr) {
    errors.movement_source = sourceErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const stockMovementValidator = {
  validateQuantity,
  validateMovementType,
  validateReason,
  validateArchivedProduct,
  validateStockAvailability,
  validateMovementSource,
  validateMovementPayload,
};
