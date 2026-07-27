export const queryHelpers = {
  /**
   * Filters Supabase query by business_id.
   */
  byBusiness<T>(query: T, businessId: string): T {
    return (query as any).eq('business_id', businessId);
  },

  /**
   * Filters query by primary key ID.
   */
  byId<T>(query: T, id: string): T {
    return (query as any).eq('id', id);
  },

  /**
   * Excludes soft-deleted records.
   */
  notDeleted<T>(query: T): T {
    return (query as any).is('deleted_at', null);
  },

  /**
   * Excludes archived items.
   */
  notArchived<T>(query: T): T {
    return (query as any).eq('is_archived', false);
  },

  /**
   * Applies page & limit pagination.
   */
  withPagination<T>(query: T, page: number = 1, limit: number = 20): T {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return (query as any).range(from, to);
  },
};
