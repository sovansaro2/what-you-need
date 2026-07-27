export const financeContext = {
  /**
   * Resolves a valid business_id or throws an error if missing.
   */
  resolveBusinessId(providedBusinessId?: string | null): string {
    const id = providedBusinessId?.trim();
    if (!id) {
      throw new Error('[FinanceContext Error] business_id is required for multi-tenant database operations.');
    }
    return id;
  },

  /**
   * Validates business_id format.
   */
  validateBusinessId(businessId: string): boolean {
    if (!businessId || typeof businessId !== 'string') return false;
    return businessId.trim().length > 0;
  },
};
