import { productCategoryService } from '@/modules/inventory/categories/services/productCategoryService';
import { customerService } from '@/modules/sales/services/customerService';
import { productService } from '@/modules/inventory/products/services/productService';
import { DEFAULT_CATEGORIES, DEFAULT_WALKIN_CUSTOMER, DEFAULT_SAMPLE_PRODUCTS } from './defaultData';
import { safeAsync, logError } from '../errors';

export interface SeedResult {
  categoriesSeeded: number;
  customersSeeded: number;
  productsSeeded: number;
  alreadySeeded: boolean;
}

export const seedService = {
  /**
   * Seeds default business data (categories, default walk-in customer, sample catalog products)
   * if they do not already exist in the database for the given user.
   */
  async seedDefaultBusinessData(userId: string): Promise<SeedResult> {
    if (!userId) {
      return { categoriesSeeded: 0, customersSeeded: 0, productsSeeded: 0, alreadySeeded: true };
    }

    let categoriesSeeded = 0;
    let customersSeeded = 0;
    let productsSeeded = 0;

    try {
      // 1. Categories
      const [cats] = await safeAsync(() => productCategoryService.ensureDefaultCategories(userId), 'SeedCategories');
      categoriesSeeded = cats?.length || 0;

      // 2. Default Walk-in Customer
      const [customers] = await safeAsync(() => customerService.getCustomers(userId), 'GetCustomersForSeed');
      const hasWalkIn = customers?.some(
        (c) => c.name.toLowerCase().includes('walk-in') || c.name.includes('អតិថិជនទូទៅ')
      );

      if (!hasWalkIn) {
        const [createdCust] = await safeAsync(
          () => customerService.createCustomer(userId, DEFAULT_WALKIN_CUSTOMER),
          'SeedWalkInCustomer'
        );
        if (createdCust) customersSeeded = 1;
      }

      // 3. Sample Products (if product table is empty)
      const [existingProds] = await safeAsync(() => productService.getProducts(userId), 'GetProductsForSeed');
      if (!existingProds || existingProds.length === 0) {
        for (const sample of DEFAULT_SAMPLE_PRODUCTS) {
          const [createdProd] = await safeAsync(
            () =>
              productService.createProduct(userId, {
                name: sample.name,
                category: sample.category,
                unit: sample.unit,
                cost_price: sample.cost_price,
                selling_price: sample.selling_price,
                initial_stock: sample.current_stock,
                min_stock_alert: sample.min_stock_alert,
                sku: sample.sku,
                barcode: sample.barcode,
                description: sample.description,
              }),
            `SeedProduct_${sample.sku}`
          );
          if (createdProd) productsSeeded++;
        }
      }

      const alreadySeeded = categoriesSeeded === 0 && customersSeeded === 0 && productsSeeded === 0;

      return {
        categoriesSeeded,
        customersSeeded,
        productsSeeded,
        alreadySeeded,
      };
    } catch (err) {
      logError(err, 'seedDefaultBusinessData');
      return { categoriesSeeded, customersSeeded, productsSeeded, alreadySeeded: false };
    }
  },
};
