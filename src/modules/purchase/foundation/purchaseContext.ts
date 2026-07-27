/**
 * WYN ERP System - Purchase Shared Foundation
 * Multi-Tenant Business Context Resolver
 */

export const purchaseContext = {
  /**
   * Resolves a valid business_id or throws an Error if missing.
   * Resolves business_id ONLY. Never uses user_id.
   */
  resolveBusinessId(providedBusinessId?: string | null): string {
    const id = providedBusinessId?.trim();
    if (!id) {
      throw new Error('[PurchaseContext Error] business_id is required for purchase database operations.');
    }
    return id;
  },

  /**
   * Validates business_id format.
   */
  validateBusinessId(businessId?: string | null): boolean {
    if (!businessId || typeof businessId !== 'string') return false;
    return businessId.trim().length > 0;
  },
};
