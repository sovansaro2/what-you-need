import { supabase } from '@/lib/supabase';
import { Customer, CreateCustomerInput } from '../types';
import { DEFAULT_WALK_IN_CUSTOMER } from '../constants';
import { salesMapper } from '../foundation/salesMapper';
import { salesValidator } from '../validators/salesValidator';
import { handleSalesError } from '../foundation/errorHandler';
import { businessContext, queryHelpers } from '../../inventory/foundation';
import { appEventBus } from '@/core/events';

export const customerService = {
  /**
   * Retrieves all customers for the active business, always including Walk-in Customer at top.
   */
  async getCustomers(userId: string): Promise<Customer[]> {
    try {
      const businessId = businessContext.resolveBusinessId(userId);

      let query = supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (businessContext.validateBusinessId(businessId)) {
        query = queryHelpers.byBusiness(query, businessId);
      }

      const { data, error } = await query;

      const mappedCustomers = (!error && data ? data : []).map((row) => salesMapper.mapDbToCustomer(row));

      const walkInCustomer: Customer = {
        ...DEFAULT_WALK_IN_CUSTOMER,
        business_id: businessId,
      };

      return [walkInCustomer, ...mappedCustomers];
    } catch (err) {
      console.warn('[customerService.getCustomers] Error fetching customers, returning default walk-in:', err);
      const businessId = businessContext.resolveBusinessId(userId);
      return [{
        ...DEFAULT_WALK_IN_CUSTOMER,
        business_id: businessId,
      }];
    }
  },

  /**
   * Search customer by name or phone
   */
  async searchCustomers(userId: string, term: string): Promise<Customer[]> {
    const all = await this.getCustomers(userId);
    if (!term || !term.trim()) return all;

    const query = term.toLowerCase().trim();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
    );
  },

  /**
   * Create a new customer in DB
   */
  async createCustomer(userId: string, input: CreateCustomerInput): Promise<Customer> {
    try {
      const businessId = businessContext.resolveBusinessId(userId);

      const validation = salesValidator.validateCustomerInput(input);
      if (!validation.isValid) {
        const firstErr = Object.values(validation.errors)[0];
        throw new Error(firstErr);
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          email: input.email?.trim() || null,
          address: input.address?.trim() || null,
          type: input.type || 'individual',
        })
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create customer');
      }

      const createdCustomer = salesMapper.mapDbToCustomer(data);

      appEventBus.emit('customer:created', {
        customerId: createdCustomer.id,
        name: createdCustomer.name,
        phone: createdCustomer.phone,
        userId: businessId,
      });

      return createdCustomer;
    } catch (err) {
      handleSalesError(err, 'customerService.createCustomer');
    }
  },
};
