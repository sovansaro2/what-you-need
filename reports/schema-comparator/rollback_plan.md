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
```sql
ALTER TABLE product_units DROP COLUMN IF EXISTS updated_by;
ALTER TABLE product_units DROP COLUMN IF EXISTS created_by;
ALTER TABLE product_units DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE product_units DROP COLUMN IF EXISTS updated_at;
ALTER TABLE product_units DROP COLUMN IF EXISTS is_active;
ALTER TABLE product_units DROP COLUMN IF EXISTS symbol;
ALTER TABLE product_units DROP COLUMN IF EXISTS code;
ALTER TABLE product_units DROP COLUMN IF EXISTS business_id;
```

### Core Entities & Inventory [MANUAL]
*Reason:* Stage contains column type conversions or table renames requiring manual backup restoration.

**Rollback Steps:**
```sql
ALTER TABLE purchase_items DROP COLUMN IF EXISTS subtotal;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS unit_cost;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS quantity_received;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS quantity_ordered;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS product_id;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS purchase_order_id;
ALTER TABLE purchase_items DROP COLUMN IF EXISTS business_id;
ALTER TABLE suppliers DROP COLUMN IF EXISTS updated_by;
ALTER TABLE suppliers DROP COLUMN IF EXISTS created_by;
ALTER TABLE suppliers DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE suppliers DROP COLUMN IF EXISTS updated_at;
ALTER TABLE suppliers DROP COLUMN IF EXISTS is_active;
ALTER TABLE suppliers DROP COLUMN IF EXISTS outstanding_balance;
ALTER TABLE suppliers DROP COLUMN IF EXISTS address;
ALTER TABLE suppliers DROP COLUMN IF EXISTS email;
ALTER TABLE suppliers DROP COLUMN IF EXISTS phone;
ALTER TABLE suppliers DROP COLUMN IF EXISTS contact_name;
ALTER TABLE suppliers DROP COLUMN IF EXISTS company_name;
ALTER TABLE suppliers DROP COLUMN IF EXISTS supplier_code;
ALTER TABLE suppliers DROP COLUMN IF EXISTS business_id;
-- Manual rollback step required for Modify Column Type 'subtotal' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'discount_amount' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'unit_cost' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'unit_price' in 'sale_items'
-- Manual rollback step required for Modify Column Type 'quantity' in 'sale_items'
ALTER TABLE profiles DROP COLUMN IF EXISTS updated_by;
ALTER TABLE profiles DROP COLUMN IF EXISTS created_by;
ALTER TABLE profiles DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS updated_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_active;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS business_id;
-- Manual rollback step required for Modify Column Type 'min_stock_alert' in 'products'
-- Manual rollback step required for Modify Column Type 'current_stock' in 'products'
-- Manual rollback step required for Modify Column Type 'selling_price' in 'products'
-- Manual rollback step required for Modify Column Type 'cost_price' in 'products'
ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE product_categories DROP COLUMN IF EXISTS updated_by;
ALTER TABLE product_categories DROP COLUMN IF EXISTS created_by;
ALTER TABLE product_categories DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE product_categories DROP COLUMN IF EXISTS updated_at;
ALTER TABLE product_categories DROP COLUMN IF EXISTS is_active;
ALTER TABLE product_categories DROP COLUMN IF EXISTS icon;
ALTER TABLE product_categories DROP COLUMN IF EXISTS color;
ALTER TABLE product_categories DROP COLUMN IF EXISTS description;
ALTER TABLE product_categories DROP COLUMN IF EXISTS code;
ALTER TABLE product_categories DROP COLUMN IF EXISTS business_id;
ALTER TABLE customers DROP COLUMN IF EXISTS updated_by;
ALTER TABLE customers DROP COLUMN IF EXISTS created_by;
ALTER TABLE customers DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE customers DROP COLUMN IF EXISTS updated_at;
ALTER TABLE customers DROP COLUMN IF EXISTS is_active;
ALTER TABLE customers DROP COLUMN IF EXISTS outstanding_balance;
ALTER TABLE customers DROP COLUMN IF EXISTS credit_limit;
ALTER TABLE customers DROP COLUMN IF EXISTS address;
ALTER TABLE customers DROP COLUMN IF EXISTS email;
ALTER TABLE customers DROP COLUMN IF EXISTS phone;
ALTER TABLE customers DROP COLUMN IF EXISTS customer_code;
ALTER TABLE customers DROP COLUMN IF EXISTS business_id;
```

### Ledger & Transactions [MANUAL]
*Reason:* Stage contains column type conversions or table renames requiring manual backup restoration.

**Rollback Steps:**
```sql
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS updated_by;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS created_by;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS updated_at;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS notes;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS received_at;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS expected_delivery_date;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS due_amount;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS paid_amount;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS total_amount;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS payment_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS po_number;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS supplier_id;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS business_id;
ALTER TABLE stock_movements DROP COLUMN IF EXISTS created_by;
ALTER TABLE stock_movements DROP COLUMN IF EXISTS notes;
-- Manual rollback step required for Modify Column Type 'total_cost' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'unit_cost' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'balance_after' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'balance_before' in 'stock_movements'
-- Manual rollback step required for Modify Column Type 'quantity' in 'stock_movements'
ALTER TABLE payments DROP COLUMN IF EXISTS created_by;
ALTER TABLE payments DROP COLUMN IF EXISTS paid_at;
ALTER TABLE payments DROP COLUMN IF EXISTS notes;
ALTER TABLE payments DROP COLUMN IF EXISTS status;
ALTER TABLE payments DROP COLUMN IF EXISTS reference_number;
ALTER TABLE payments DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE payments DROP COLUMN IF EXISTS currency;
ALTER TABLE payments DROP COLUMN IF EXISTS amount;
ALTER TABLE payments DROP COLUMN IF EXISTS payment_method;
ALTER TABLE payments DROP COLUMN IF EXISTS payment_number;
ALTER TABLE payments DROP COLUMN IF EXISTS customer_id;
ALTER TABLE payments DROP COLUMN IF EXISTS sale_id;
ALTER TABLE payments DROP COLUMN IF EXISTS business_id;
ALTER TABLE sales DROP COLUMN IF EXISTS notes;
-- Manual rollback step required for Modify Column Type 'due_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'paid_amount' in 'sales'
-- Manual rollback step required for Modify Column Type 'total_amount' in 'sales'
ALTER TABLE sales DROP COLUMN IF EXISTS tax_amount;
ALTER TABLE sales DROP COLUMN IF EXISTS discount_amount;
ALTER TABLE sales DROP COLUMN IF EXISTS subtotal_amount;
ALTER TABLE sales DROP COLUMN IF EXISTS status;
```

### Finance & Analytics [SAFE]
*Reason:* All tasks in this stage are fully reversible without data loss.

**Rollback Steps:**
```sql
ALTER TABLE expenses DROP COLUMN IF EXISTS updated_by;
ALTER TABLE expenses DROP COLUMN IF EXISTS created_by;
ALTER TABLE expenses DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE expenses DROP COLUMN IF EXISTS updated_at;
ALTER TABLE expenses DROP COLUMN IF EXISTS incurred_at;
ALTER TABLE expenses DROP COLUMN IF EXISTS notes;
ALTER TABLE expenses DROP COLUMN IF EXISTS receipt_url;
ALTER TABLE expenses DROP COLUMN IF EXISTS vendor_name;
ALTER TABLE expenses DROP COLUMN IF EXISTS payment_method;
ALTER TABLE expenses DROP COLUMN IF EXISTS currency;
ALTER TABLE expenses DROP COLUMN IF EXISTS amount;
ALTER TABLE expenses DROP COLUMN IF EXISTS title;
ALTER TABLE expenses DROP COLUMN IF EXISTS expense_number;
ALTER TABLE expenses DROP COLUMN IF EXISTS category_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS business_id;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS updated_by;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS created_by;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS updated_at;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS is_active;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS description;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS code;
ALTER TABLE expense_categories DROP COLUMN IF EXISTS business_id;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS updated_at;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_stock_out_qty;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_stock_in_qty;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_net_profit;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_expenses_amount;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_gross_profit;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_cost_amount;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_sales_count;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS total_sales_amount;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS summary_date;
ALTER TABLE daily_summaries DROP COLUMN IF EXISTS business_id;
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
