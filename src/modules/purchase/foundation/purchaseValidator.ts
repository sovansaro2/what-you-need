/**
 * WYN ERP System - Purchase Shared Foundation
 * Input Validator & Business Logic Enforcer
 */

import { ValidationError } from '@/core/errors';
import { purchaseContext } from './purchaseContext';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  CreatePurchaseItemInput,
  ReceivePurchaseInput,
  PurchaseStatus,
  PurchasePaymentStatus,
} from './purchaseTypes';

const VALID_PURCHASE_STATUSES: PurchaseStatus[] = ['draft', 'ordered', 'received', 'cancelled'];
const VALID_PAYMENT_STATUSES: PurchasePaymentStatus[] = ['unpaid', 'partially_paid', 'paid'];

export const purchaseValidator = {
  /**
   * Validates business ownership consistency.
   */
  validateBusinessOwnership(requestedBusinessId: string, recordBusinessId: string): void {
    const validReq = purchaseContext.resolveBusinessId(requestedBusinessId);
    if (!recordBusinessId || validReq !== recordBusinessId) {
      throw new ValidationError(
        `Business ownership mismatch. Requested: '${validReq}', Record: '${recordBusinessId}'`,
        'ប្រតិបត្តិការនេះមិនត្រូវបានអនុញ្ញាតទេ (ខុសអត្តសញ្ញាណអាជីវកម្ម)'
      );
    }
  },

  /**
   * Validates Supplier creation payload.
   */
  validateCreateSupplier(input: CreateSupplierInput): void {
    if (!purchaseContext.validateBusinessId(input.business_id)) {
      throw new ValidationError('business_id is required for supplier operations.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (!input.company_name || !input.company_name.trim()) {
      throw new ValidationError('Supplier company_name is required.', 'ឈ្មោះក្រុមហ៊ុនអ្នកផ្គត់ផ្គង់ត្រូវបានទាមទារ');
    }
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      throw new ValidationError('Invalid supplier email address format.', 'អុីមែលអ្នកផ្គត់ផ្គង់មិនត្រឹមត្រូវទេ');
    }
    if (input.outstanding_balance !== undefined && (typeof input.outstanding_balance !== 'number' || isNaN(input.outstanding_balance) || input.outstanding_balance < 0)) {
      throw new ValidationError('Outstanding balance must be a non-negative number.', 'សមតុល្យជំពាក់ត្រូវតែជាចំនួនវិជ្ជមាន');
    }
  },

  /**
   * Validates Supplier update payload.
   */
  validateUpdateSupplier(input: UpdateSupplierInput): void {
    if (!purchaseContext.validateBusinessId(input.business_id)) {
      throw new ValidationError('business_id is required for supplier operations.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (input.company_name !== undefined && !input.company_name.trim()) {
      throw new ValidationError('Supplier company_name cannot be empty.', 'ឈ្មោះក្រុមហ៊ុនអ្នកផ្គត់ផ្គង់មិនអាចទទេរបានទេ');
    }
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      throw new ValidationError('Invalid supplier email address format.', 'អុីមែលអ្នកផ្គត់ផ្គង់មិនត្រឹមត្រូវទេ');
    }
    if (input.outstanding_balance !== undefined && (typeof input.outstanding_balance !== 'number' || isNaN(input.outstanding_balance) || input.outstanding_balance < 0)) {
      throw new ValidationError('Outstanding balance must be a non-negative number.', 'សមតុល្យជំពាក់ត្រូវតែជាចំនួនវិជ្ជមាន');
    }
  },

  /**
   * Validates individual Purchase Item input.
   */
  validatePurchaseItem(item: CreatePurchaseItemInput, index?: number): void {
    const itemPrefix = index !== undefined ? `Item #${index + 1}` : 'Purchase Item';

    if (!item.product_id || !item.product_id.trim()) {
      throw new ValidationError(`${itemPrefix}: product_id is required.`, 'សូមជ្រើសរើសទំនិញ');
    }
    if (typeof item.quantity_ordered !== 'number' || isNaN(item.quantity_ordered) || item.quantity_ordered <= 0) {
      throw new ValidationError(`${itemPrefix}: quantity_ordered must be a positive number greater than 0.`, 'បរិមាណបញ្ជាទិញត្រូវតែធំជាង ០');
    }
    if (typeof item.unit_cost !== 'number' || isNaN(item.unit_cost) || item.unit_cost < 0) {
      throw new ValidationError(`${itemPrefix}: unit_cost must be a non-negative number.`, 'តម្លៃដើមត្រូវតែធំជាង ឬស្មើ ០');
    }
    if (item.subtotal !== undefined && (typeof item.subtotal !== 'number' || isNaN(item.subtotal) || item.subtotal < 0)) {
      throw new ValidationError(`${itemPrefix}: subtotal must be a non-negative number.`, 'តម្លៃសរុបនៃមុខទំនិញមិនត្រឹមត្រូវ');
    }
  },

  /**
   * Validates Purchase Order creation payload.
   */
  validateCreatePurchaseOrder(input: CreatePurchaseOrderInput): void {
    if (!purchaseContext.validateBusinessId(input.business_id)) {
      throw new ValidationError('business_id is required for purchase order operations.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (!input.supplier_id || !input.supplier_id.trim()) {
      throw new ValidationError('supplier_id is required for creating a purchase order.', 'សូមជ្រើសរើសអ្នកផ្គត់ផ្គង់');
    }
    if (input.status && !VALID_PURCHASE_STATUSES.includes(input.status)) {
      throw new ValidationError(`Invalid purchase status '${input.status}'.`, 'ស្ថានភាពបញ្ជាទិញមិនត្រឹមត្រូវ');
    }
    if (input.payment_status && !VALID_PAYMENT_STATUSES.includes(input.payment_status)) {
      throw new ValidationError(`Invalid payment status '${input.payment_status}'.`, 'ស្ថានភាពទូទាត់ប្រាក់មិនត្រឹមត្រូវ');
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new ValidationError('Purchase order must contain at least one item.', 'ប័ណ្ណបញ្ជាទិញត្រូវមានយ៉ាងហោចណាស់មុខទំនិញមួយ');
    }

    input.items.forEach((item, index) => {
      this.validatePurchaseItem(item, index);
    });
  },

  /**
   * Validates Purchase Order update payload.
   */
  validateUpdatePurchaseOrder(input: UpdatePurchaseOrderInput): void {
    if (!purchaseContext.validateBusinessId(input.business_id)) {
      throw new ValidationError('business_id is required for purchase order operations.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (input.supplier_id !== undefined && !input.supplier_id.trim()) {
      throw new ValidationError('supplier_id cannot be empty.', 'អ្នកផ្គត់ផ្គង់មិនអាចទទេបានទេ');
    }
    if (input.status && !VALID_PURCHASE_STATUSES.includes(input.status)) {
      throw new ValidationError(`Invalid purchase status '${input.status}'.`, 'ស្ថានភាពបញ្ជាទិញមិនត្រឹមត្រូវ');
    }
    if (input.payment_status && !VALID_PAYMENT_STATUSES.includes(input.payment_status)) {
      throw new ValidationError(`Invalid payment status '${input.payment_status}'.`, 'ស្ថានភាពទូទាត់ប្រាក់មិនត្រឹមត្រូវ');
    }
    if (input.items !== undefined) {
      if (!Array.isArray(input.items) || input.items.length === 0) {
        throw new ValidationError('Purchase order items cannot be an empty list.', 'បញ្ជីមុខទំនិញមិនអាចទទេបានទេ');
      }
      input.items.forEach((item, index) => {
        this.validatePurchaseItem(item, index);
      });
    }
  },

  /**
   * Validates Receiving stock against Purchase Order.
   */
  validateReceivePurchase(input: ReceivePurchaseInput): void {
    if (!purchaseContext.validateBusinessId(input.business_id)) {
      throw new ValidationError('business_id is required for receiving stock.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (!input.purchase_order_id || !input.purchase_order_id.trim()) {
      throw new ValidationError('purchase_order_id is required for receiving items.', 'សូមជ្រើសរើសប័ណ្ណបញ្ជាទិញ');
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new ValidationError('Receiving payload must include at least one item.', 'សូមជ្រើសរើសមុខទំនិញដែលបានទទួល');
    }

    input.items.forEach((item, index) => {
      if (!item.item_id || !item.item_id.trim()) {
        throw new ValidationError(`Item #${index + 1}: item_id is required.`, 'អត្តសញ្ញាណមុខទំនិញមិនត្រឹមត្រូវ');
      }
      if (typeof item.quantity_received !== 'number' || isNaN(item.quantity_received) || item.quantity_received <= 0) {
        throw new ValidationError(`Item #${index + 1}: quantity_received must be greater than 0.`, 'បរិមាណទទួលបានត្រូវតែធំជាង ០');
      }
    });
  },
};
