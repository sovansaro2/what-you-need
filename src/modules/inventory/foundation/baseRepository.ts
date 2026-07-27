import { supabase } from '@/lib/supabase';
import { businessContext } from './businessContext';
import { handleInventoryError } from './errorHandler';

export class BaseInventoryRepository {
  constructor(protected tableName: string) {}

  /**
   * Builds base query filtered by business_id.
   */
  protected getBaseQuery(businessId: string) {
    const validBusinessId = businessContext.resolveBusinessId(businessId);
    return supabase.from(this.tableName).select('*').eq('business_id', validBusinessId);
  }

  /**
   * Generic finder by ID with business_id scoping.
   */
  async findById(businessId: string, id: string, selectQuery: string = '*'): Promise<any | null> {
    try {
      const validBusinessId = businessContext.resolveBusinessId(businessId);
      const { data, error } = await supabase
        .from(this.tableName)
        .select(selectQuery)
        .eq('id', id)
        .eq('business_id', validBusinessId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (err: any) {
      handleInventoryError(err, `BaseRepository[${this.tableName}].findById`);
    }
  }

  /**
   * Generic hard delete with business_id check.
   */
  async deleteById(businessId: string, id: string): Promise<boolean> {
    try {
      const validBusinessId = businessContext.resolveBusinessId(businessId);
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('business_id', validBusinessId);

      if (error) {
        throw error;
      }
      return true;
    } catch (err: any) {
      handleInventoryError(err, `BaseRepository[${this.tableName}].deleteById`);
    }
  }
}
