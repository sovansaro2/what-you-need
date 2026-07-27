# WYN Database Migration Rollback Plan
**Overall Strategy:** `MANUAL`
**Summary:** Rollback requires manual data verification and structured SQL scripts for column modifications.

---

## Stage Rollback Plans

### Foundation & Schemas [SAFE]
*Reason:* All tasks in this stage are fully reversible without data loss.

**Rollback Steps:**
```sql
DROP EXTENSION IF EXISTS pgcrypto;
```

### Lookup & Reference Tables [SAFE]
*Reason:* All tasks in this stage are fully reversible without data loss.

**Rollback Steps:**
- No rollback steps required for this stage.

### Core Entities & Inventory [MANUAL]
*Reason:* Stage contains column type conversions or table renames requiring manual backup restoration.

**Rollback Steps:**
```sql
-- Manual rollback step required for Modify Column Type 'subtotal' in 'purchase_items'
-- Manual rollback step required for Modify Column Type 'unit_cost' in 'purchase_items'
-- Manual rollback step required for Modify Column Type 'quantity_received' in 'purchase_items'
-- Manual rollback step required for Modify Column Type 'quantity_ordered' in 'purchase_items'
-- Manual rollback step required for Modify Column Type 'outstanding_balance' in 'suppliers'
-- Manual rollback step required for Modify Column Type 'subtotal' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'discount_amount' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'unit_cost' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'unit_price' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'quantity' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'min_stock_alert' in 'products'
-- Manual rollback step required for Modify Column Type 'current_stock' in 'products'
-- Manual rollback step required for Modify Column Type 'selling_price' in 'products'
-- Manual rollback step required for Modify Column Type 'cost_price' in 'products'
-- Manual rollback step required for Modify Column Type 'outstanding_balance' in 'customers'
-- Manual rollback step required for Modify Column Type 'credit_limit' in 'customers'
```

### Ledger & Transactions [MANUAL]
*Reason:* Stage contains column type conversions or table renames requiring manual backup restoration.

**Rollback Steps:**
```sql
-- Manual rollback step required for Modify Column Type 'due_amount' in 'purchase_orders'
-- Manual rollback step required for Modify Column Type 'paid_amount' in 'purchase_orders'
-- Manual rollback step required for Modify Column Type 'total_amount' in 'purchase_orders'
ALTER TABLE stock_movements DROP COLUMN IF EXISTS created_by;
ALTER TABLE stock_movements DROP COLUMN IF EXISTS notes;
-- Manual rollback step required for Modify Column Type 'total_cost' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'unit_cost' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'balance_after' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'balance_before' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'quantity' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'exchange_rate' in 'payments'
-- Manual rollback step required for Modify Column Type 'amount' in 'payments'
-- Manual rollback step required for Modify Column Type 'due_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'paid_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'total_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'tax_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'discount_amount' in 'sales'
ALTER TABLE sales DROP COLUMN IF EXISTS subtotal_amount;
```

### Finance & Analytics [MANUAL]
*Reason:* Stage contains column type conversions or table renames requiring manual backup restoration.

**Rollback Steps:**
```sql
-- Manual rollback step required for Modify Column Type 'amount' in 'expenses'
-- Manual rollback step required for Modify Column Type 'total_stock_out_qty' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_stock_in_qty' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_net_profit' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_expenses_amount' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_gross_profit' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_cost_amount' in 'daily_summaries'
-- Manual rollback step required for Modify Column Type 'total_sales_amount' in 'daily_summaries'
```

### Constraints & Indexes [SAFE]
*Reason:* All tasks in this stage are fully reversible without data loss.

**Rollback Steps:**
```sql
DROP INDEX IF EXISTS idx_daily_summaries_biz_date;
ALTER TABLE daily_summaries DROP CONSTRAINT IF EXISTS fk_daily_summaries_business_id;
DROP INDEX IF EXISTS idx_expenses_category;
DROP INDEX IF EXISTS idx_expenses_biz_date;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS fk_expenses_category_id;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS fk_expenses_business_id;
ALTER TABLE expense_categories DROP CONSTRAINT IF EXISTS fk_expense_categories_business_id;
DROP INDEX IF EXISTS idx_purchase_items_po;
ALTER TABLE purchase_items DROP CONSTRAINT IF EXISTS fk_purchase_items_product_id;
ALTER TABLE purchase_items DROP CONSTRAINT IF EXISTS fk_purchase_items_purchase_order_id;
ALTER TABLE purchase_items DROP CONSTRAINT IF EXISTS fk_purchase_items_business_id;
DROP INDEX IF EXISTS idx_purchase_orders_supplier;
DROP INDEX IF EXISTS idx_purchase_orders_biz_status;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS fk_purchase_orders_supplier_id;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS fk_purchase_orders_business_id;
DROP INDEX IF EXISTS idx_suppliers_biz;
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS fk_suppliers_business_id;
DROP INDEX IF EXISTS idx_payments_customer;
DROP INDEX IF EXISTS idx_payments_sale;
DROP INDEX IF EXISTS idx_payments_biz_created;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_customer_id;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_sale_id;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_business_id;
DROP INDEX IF EXISTS idx_sale_items_product;
DROP INDEX IF EXISTS idx_sale_items_sale;
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS fk_sale_items_product_id;
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS fk_sale_items_sale_id;
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS fk_sale_items_business_id;
DROP INDEX IF EXISTS idx_sales_status;
DROP INDEX IF EXISTS idx_sales_customer;
DROP INDEX IF EXISTS idx_sales_biz_created;
ALTER TABLE sales DROP CONSTRAINT IF EXISTS fk_sales_customer_id;
ALTER TABLE sales DROP CONSTRAINT IF EXISTS fk_sales_business_id;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_business_id;
DROP INDEX IF EXISTS idx_stock_movements_ref;
DROP INDEX IF EXISTS idx_stock_movements_type;
DROP INDEX IF EXISTS idx_stock_movements_biz_product;
DROP INDEX IF EXISTS uq_stock_movements_idempotency;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS fk_stock_movements_product_id;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS fk_stock_movements_business_id;
DROP INDEX IF EXISTS idx_products_low_stock;
DROP INDEX IF EXISTS idx_products_search;
DROP INDEX IF EXISTS idx_products_unit_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_business_id;
DROP INDEX IF EXISTS uq_products_biz_barcode;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_unit_id;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_category_id;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_business_id;
ALTER TABLE product_units DROP CONSTRAINT IF EXISTS fk_product_units_business_id;
ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS fk_product_categories_business_id;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_business_id;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_business_id;
```
