import { Customer, Sale, SaleItem } from '../types';

export const salesMapper = {
  /**
   * Maps a DB record from public.customers to Customer model
   */
  mapDbToCustomer(record: any): Customer {
    return {
      id: record.id,
      business_id: record.business_id || '',
      name: record.name || 'អតិថិជនទូទៅ',
      phone: record.phone || null,
      email: record.email || null,
      address: record.address || null,
      type: record.type || 'walk_in',
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  },

  /**
   * Maps a DB record from public.sale_items to SaleItem model
   */
  mapDbToSaleItem(record: any): SaleItem {
    return {
      id: record.id,
      sale_id: record.sale_id,
      product_id: record.product_id,
      product_name: record.products?.name || record.product_name || 'ទំនិញ',
      quantity: Number(record.quantity) || 0,
      unit_price: Number(record.unit_price) || 0,
      discount_amount: Number(record.discount_amount) || 0,
      subtotal: Number(record.subtotal) || 0,
      total: Number(record.total) || 0,
      created_at: record.created_at,
    };
  },

  /**
   * Maps a DB record from public.sales to Sale model
   */
  mapDbToSale(record: any): Sale {
    const rawItems = Array.isArray(record.sale_items) ? record.sale_items : [];
    const items = rawItems.map((item: any) => this.mapDbToSaleItem(item));

    return {
      id: record.id,
      business_id: record.business_id || '',
      customer_id: record.customer_id || null,
      customer_name: record.customers?.name || record.customer_name || 'អតិថិជនទូទៅ (Walk-in)',
      sale_number: record.sale_number || `INV-${record.id?.substring(0, 8) || '000'}`,
      status: record.status || 'completed',
      payment_status: record.payment_status || 'paid',
      payment_method: record.payment_method || 'cash',
      subtotal: Number(record.subtotal) || 0,
      discount_amount: Number(record.discount_amount) || 0,
      tax_amount: Number(record.tax_amount) || 0,
      total_amount: Number(record.total_amount) || 0,
      paid_amount: Number(record.paid_amount) || 0,
      due_amount: Number(record.due_amount) || 0,
      change_amount: Number(record.change_amount) || 0,
      notes: record.notes || null,
      sold_at: record.sold_at || record.created_at || new Date().toISOString(),
      created_by: record.created_by,
      created_at: record.created_at,
      updated_at: record.updated_at,
      items,
    };
  },
};
