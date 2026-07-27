import { supabase } from '@/lib/supabase';
import { financeContext } from './financeContext';
import { DatabaseError, NotFoundError } from '@/core/errors';

export class BaseFinanceRepository {
  constructor(protected tableName: string) {}

  /**
   * Builds base query filtered strictly by business_id.
   */
  protected getBaseQuery(businessId: string) {
    const validBusinessId = financeContext.resolveBusinessId(businessId);
    return supabase
      .from(this.tableName)
      .select('*')
      .eq('business_id', validBusinessId);
  }

  /**
   * Finder by ID with business_id scoping.
   */
  async findById(businessId: string, id: string, selectQuery: string = '*'): Promise<any | null> {
    const validBusinessId = financeContext.resolveBusinessId(businessId);
    const { data, error } = await supabase
      .from(this.tableName)
      .select(selectQuery)
      .eq('id', id)
      .eq('business_id', validBusinessId)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error, `FinanceRepository[${this.tableName}].findById`);
    }
    if (!data) {
      throw new NotFoundError(this.tableName, id);
    }
    return data;
  }

  /**
   * Delete by ID with business_id scoping.
   */
  async deleteById(businessId: string, id: string): Promise<boolean> {
    const validBusinessId = financeContext.resolveBusinessId(businessId);
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('business_id', validBusinessId);

    if (error) {
      throw new DatabaseError(error, `FinanceRepository[${this.tableName}].deleteById`);
    }
    return true;
  }
}

export const expenseRepository = new BaseFinanceRepository('expenses');
export const paymentRepository = new BaseFinanceRepository('payments');
export const categoryRepository = new BaseFinanceRepository('categories');
export const financeRepository = expenseRepository;

