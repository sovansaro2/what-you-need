import { supabase } from '@/lib/supabase';
import {
  Sale,
  ProcessSaleInput,
  ProcessSaleResult,
  SaleFilter,
} from '../types';
import { salesMapper } from '../foundation/salesMapper';
import { salesValidator } from '../validators/salesValidator';
import { handleSalesError } from '../foundation/errorHandler';
import { businessContext, queryHelpers } from '../../inventory/foundation';
import { KHMER_SALES_MESSAGES } from '../constants';
import { notifyInventoryUpdated } from '../../inventory/events/inventoryEvents';
import { appEventBus } from '@/core/events';

export const salesService = {
  /**
   * Main transactional sale processor calling Supabase PostgreSQL RPC `process_sale_transaction`
   */
  async processSale(
    userId: string,
    input: ProcessSaleInput
  ): Promise<ProcessSaleResult> {
    try {
      const businessId = businessContext.resolveBusinessId(userId);

      // 1. Fetch live product records for validation
      const productIds = input.items.map((i) => i.product_id);
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (prodErr) {
        throw prodErr;
      }

      const productMap = new Map<string, any>();
      (prods || []).forEach((p) => productMap.set(p.id, p));

      // 2. Validate sale payload against live products
      const validation = salesValidator.validateSalePayload(input, productMap);
      if (!validation.isValid) {
        const firstErr = Object.values(validation.errors)[0];
        throw new Error(firstErr);
      }

      // 3. Compute payment financial numbers
      let subtotal = 0;
      for (const item of input.items) {
        subtotal += item.quantity * item.unit_price;
      }
      const discount = Math.max(0, input.discount_amount || 0);
      const tax = Math.max(0, input.tax_amount || 0);
      const totalAmount = Math.max(0, subtotal - discount + tax);
      const paidAmount = Math.max(0, input.paid_amount || 0);
      const changeAmount = Math.max(0, paidAmount - totalAmount);
      const dueAmount = Math.max(0, totalAmount - paidAmount);

      let paymentStatus = input.payment_status;
      if (!paymentStatus) {
        if (dueAmount <= 0) {
          paymentStatus = 'paid';
        } else if (paidAmount > 0) {
          paymentStatus = 'partial';
        } else {
          paymentStatus = 'unpaid';
        }
      }

      // 4. Call Supabase PostgreSQL RPC
      const rpcParams = {
        p_business_id: businessId,
        p_customer_id: input.customer_id && input.customer_id !== 'walk-in' ? input.customer_id : null,
        p_customer_name: input.customer_name || 'អតិថិជនទូទៅ (Walk-in)',
        p_payment_method: input.payment_method || 'cash',
        p_payment_status: paymentStatus,
        p_subtotal: subtotal,
        p_discount_amount: discount,
        p_tax_amount: tax,
        p_total_amount: totalAmount,
        p_paid_amount: paidAmount,
        p_due_amount: dueAmount,
        p_change_amount: changeAmount,
        p_notes: input.notes || null,
        p_items: input.items,
        p_idempotency_key: input.idempotency_key || null,
        p_created_by: userId,
      };

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'process_sale_transaction',
        rpcParams
      );

      let result: any = rpcData;

      // 5. Direct DB transaction fallback if RPC is not deployed yet
      if (rpcError) {
        if (rpcError.code === '42883') {
          result = await this.fallbackDirectSaleTransaction(userId, businessId, input, productMap, {
            subtotal,
            discount,
            tax,
            totalAmount,
            paidAmount,
            changeAmount,
            dueAmount,
            paymentStatus,
          });
        } else {
          throw new Error(rpcError.message || KHMER_SALES_MESSAGES.SALE_FAILED);
        }
      }

      // 6. Notify inventory stock updates & emit domain events
      const soldAtStr = result.sold_at || new Date().toISOString();
      const eventItems = input.items.map((item) => {
        const p = productMap.get(item.product_id);
        const prodName = p ? p.name : 'ទំនិញ';
        const itemSubtotal = item.quantity * item.unit_price;
        const itemDiscount = item.discount_amount || 0;
        const itemTotal = Math.max(0, itemSubtotal - itemDiscount);

        const oldStock = Number(p?.current_stock ?? 0);
        const newStock = Math.max(0, oldStock - item.quantity);
        const minAlert = Number(p?.min_stock_alert ?? 5);

        notifyInventoryUpdated({
          productId: item.product_id,
          isLowStock: newStock <= minAlert,
          source: 'sale',
        });

        appEventBus.emit('stock:updated', {
          productId: item.product_id,
          productName: prodName,
          oldStock,
          newStock,
          changeQty: item.quantity,
          type: 'sale',
          referenceId: result.sale_id,
          timestamp: soldAtStr,
        });

        if (newStock <= minAlert) {
          appEventBus.emit('stock:low_alert', {
            productId: item.product_id,
            productName: prodName,
            currentStock: newStock,
            minStockAlert: minAlert,
            unit: p?.unit || 'ឯកតា',
          });
        }

        return {
          productId: item.product_id,
          productName: prodName,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: itemTotal,
        };
      });

      appEventBus.emit('sale:created', {
        saleId: result.sale_id,
        saleNumber: result.sale_number,
        userId,
        customerName: input.customer_name || 'អតិថិជនទូទៅ (Walk-in)',
        totalAmount: result.total_amount ?? totalAmount,
        paymentMethod: input.payment_method || 'cash',
        items: eventItems,
        soldAt: soldAtStr,
      });

      return {
        success: true,
        sale_id: result.sale_id,
        sale_number: result.sale_number,
        total_amount: result.total_amount ?? totalAmount,
        paid_amount: result.paid_amount ?? paidAmount,
        change_amount: result.change_amount ?? changeAmount,
        due_amount: result.due_amount ?? dueAmount,
        payment_status: result.payment_status ?? paymentStatus,
        sold_at: result.sold_at || new Date().toISOString(),
      };
    } catch (err) {
      handleSalesError(err, 'salesService.processSale');
    }
  },

  /**
   * Direct DB transaction fallback if RPC is not deployed
   */
  async fallbackDirectSaleTransaction(
    userId: string,
    businessId: string,
    input: ProcessSaleInput,
    productMap: Map<string, any>,
    calc: {
      subtotal: number;
      discount: number;
      tax: number;
      totalAmount: number;
      paidAmount: number;
      changeAmount: number;
      dueAmount: number;
      paymentStatus: string;
    }
  ): Promise<any> {
    const saleNumber = `INV-${Date.now().toString().slice(-8)}`;
    const soldAt = new Date().toISOString();

    // Insert sale
    const { data: saleData, error: saleErr } = await supabase
      .from('sales')
      .insert({
        business_id: businessId,
        customer_id: input.customer_id && input.customer_id !== 'walk-in' ? input.customer_id : null,
        sale_number: saleNumber,
        status: 'completed',
        payment_status: calc.paymentStatus,
        payment_method: input.payment_method || 'cash',
        subtotal: calc.subtotal,
        discount_amount: calc.discount,
        tax_amount: calc.tax,
        total_amount: calc.totalAmount,
        paid_amount: calc.paidAmount,
        due_amount: calc.dueAmount,
        change_amount: calc.changeAmount,
        notes: input.notes || null,
        sold_at: soldAt,
        created_by: userId,
      })
      .select('id, sale_number')
      .single();

    if (saleErr || !saleData) {
      throw saleErr || new Error('Failed to create sale record');
    }

    const saleId = saleData.id;

    // Process items & update stock
    for (const item of input.items) {
      const p = productMap.get(item.product_id);
      const prodName = p ? p.name : 'ទំនិញ';
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = item.discount_amount || 0;
      const itemTotal = Math.max(0, itemSubtotal - itemDiscount);

      await supabase.from('sale_items').insert({
        sale_id: saleId,
        product_id: item.product_id,
        product_name: prodName,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: itemDiscount,
        subtotal: itemSubtotal,
        total: itemTotal,
      });

      const balanceBefore = Number(p?.current_stock ?? 0);
      const balanceAfter = Math.max(0, balanceBefore - item.quantity);

      await supabase.from('stock_movements').insert({
        business_id: businessId,
        product_id: item.product_id,
        movement_type: 'sale',
        quantity: item.quantity,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        unit_cost: p?.cost_price || null,
        total_cost: p?.cost_price ? p.cost_price * item.quantity : null,
        reference_type: 'sale',
        reference_id: saleId,
        reason: `លក់ចេញ (POS Sale: ${saleNumber})`,
      });

      await supabase
        .from('products')
        .update({ current_stock: balanceAfter, updated_at: soldAt })
        .eq('id', item.product_id);
    }

    // Insert payment record if paid_amount > 0
    if (calc.paidAmount > 0) {
      await supabase.from('payments').insert({
        business_id: businessId,
        sale_id: saleId,
        amount: calc.paidAmount,
        payment_method: input.payment_method || 'cash',
        payment_date: soldAt,
        reference_number: saleNumber,
        notes: 'ការទូទាត់ប្រាក់ដើមគ្រា (POS Sale Payment)',
      });
    }

    return {
      sale_id: saleId,
      sale_number: saleNumber,
      total_amount: calc.totalAmount,
      paid_amount: calc.paidAmount,
      change_amount: calc.changeAmount,
      due_amount: calc.dueAmount,
      payment_status: calc.paymentStatus,
      sold_at: soldAt,
    };
  },

  /**
   * Fetch sale history with filters
   */
  async getSaleHistory(userId: string, filter?: SaleFilter): Promise<Sale[]> {
    try {
      const businessId = businessContext.resolveBusinessId(userId);

      let query = supabase
        .from('sales')
        .select('*, customers(name), sale_items(*)')
        .is('deleted_at', null)
        .order('sold_at', { ascending: false });

      if (businessContext.validateBusinessId(businessId)) {
        query = queryHelpers.byBusiness(query, businessId);
      }

      if (filter?.customer_id) {
        query = query.eq('customer_id', filter.customer_id);
      }

      if (filter?.payment_method && filter.payment_method !== 'all') {
        query = query.eq('payment_method', filter.payment_method);
      }

      if (filter?.payment_status && filter.payment_status !== 'all') {
        query = query.eq('payment_status', filter.payment_status);
      }

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      if (filter?.startDate) {
        query = query.gte('sold_at', filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte('sold_at', filter.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let sales = (data || []).map((row) => salesMapper.mapDbToSale(row));

      if (filter?.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        sales = sales.filter(
          (s) =>
            s.sale_number.toLowerCase().includes(q) ||
            (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
            (s.notes && s.notes.toLowerCase().includes(q))
        );
      }

      return sales;
    } catch (err) {
      handleSalesError(err, 'salesService.getSaleHistory');
    }
  },

  /**
   * Fetch single sale record with full item details
   */
  async getSaleById(userId: string, saleId: string): Promise<Sale | null> {
    try {
      const businessId = businessContext.resolveBusinessId(userId);

      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name), sale_items(*)')
        .eq('id', saleId)
        .eq('business_id', businessId)
        .single();

      if (error || !data) {
        return null;
      }

      return salesMapper.mapDbToSale(data);
    } catch (err) {
      handleSalesError(err, 'salesService.getSaleById');
    }
  },
};
