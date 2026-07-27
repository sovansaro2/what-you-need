# WYN Database Schema Comparison Report
**Target Schema:** `database_v1.sql` | **Schema Hash:** `CC44B3AB4DAD69FA5634C218F5EA06266E8E6A008666F0B5621BCE65510C7F93` | **Generated:** `2026-07-27T16:37:17.745Z`

---

## 1. Executive Summary

| Metric | Value | Status |
| :--- | :---: | :---: |
| **Overall Database Health** | **51 / 100** | **🔴 CRITICAL** |
| **Schema Match Rate** | **50.6%** | ⚠️ ATTENTION |
| **Total Differences** | **133** | 🚨 DRIFT DETECTED |
| **Missing Tables** | 0 | ✅ |
| **Column Differences** | 49 | 🟡 |
| **FK Differences** | 7 | 🟡 |
| **Constraint Differences** | 52 | 🟡 |
| **Index Differences** | 25 | 🟡 |

## 2. Health Breakdown

| Dimension | Score | Status | Findings | Key Details |
| :--- | :---: | :---: | :---: | :--- |
| **Completeness** | 88/100 | GOOD | 3 | 3 target column(s) missing from existing tables. |
| **Integrity** | 0/100 | CRITICAL | 52 | 7 foreign key constraint(s) missing. |
| **Performance** | 0/100 | CRITICAL | 21 | 20 performance search or unique index(es) missing. |
| **Security** | 100/100 | EXCELLENT | 0 | Multi-tenant scoping columns and tenant security structures are verified. |
| **Maintainability** | 96/100 | EXCELLENT | 2 | 2 extra column(s) detected. |

## 3. Table Level Comparison

- ✅ All target tables exist in the current database.

## 4. Column Differences

| Table | Column | Issue Type | Current | Target | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `products` | `business_id` | `NULLABILITY` | `NULL` | `NOT NULL` | Nullability mismatch for "products.business_id": current is NULL, target expects NOT NULL. |
| `products` | `cost_price` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "products.cost_price": current "numeric(12,2)" vs target "numeric(12". |
| `products` | `selling_price` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "products.selling_price": current "numeric(12,2)" vs target "numeric(12". |
| `products` | `current_stock` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "products.current_stock": current "numeric(12,3)" vs target "numeric(12". |
| `products` | `min_stock_alert` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "products.min_stock_alert": current "numeric(12,3)" vs target "numeric(12". |
| `stock_movements` | `business_id` | `NULLABILITY` | `NULL` | `NOT NULL` | Nullability mismatch for "stock_movements.business_id": current is NULL, target expects NOT NULL. |
| `stock_movements` | `quantity` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "stock_movements.quantity": current "numeric(12,3)" vs target "numeric(12". |
| `stock_movements` | `balance_before` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "stock_movements.balance_before": current "numeric(12,3)" vs target "numeric(12". |
| `stock_movements` | `balance_after` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "stock_movements.balance_after": current "numeric(12,3)" vs target "numeric(12". |
| `stock_movements` | `unit_cost` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "stock_movements.unit_cost": current "numeric(12,2)" vs target "numeric(12". |
| `stock_movements` | `total_cost` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "stock_movements.total_cost": current "numeric(12,2)" vs target "numeric(12". |
| `stock_movements` | `notes` | `MISSING` | — | `text` | Column "notes" is missing in table "stock_movements". |
| `stock_movements` | `created_by` | `MISSING` | — | `uuid` | Column "created_by" is missing in table "stock_movements". |
| `customers` | `credit_limit` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "customers.credit_limit": current "numeric(12,2)" vs target "numeric(12". |
| `customers` | `outstanding_balance` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "customers.outstanding_balance": current "numeric(12,2)" vs target "numeric(12". |
| `sales` | `business_id` | `NULLABILITY` | `NULL` | `NOT NULL` | Nullability mismatch for "sales.business_id": current is NULL, target expects NOT NULL. |
| `sales` | `payment_status` | `DEFAULT_VALUE` | `'paid'` | `unpaid` | Default value mismatch for "sales.payment_status": current "'paid'" vs target "unpaid". |
| `sales` | `subtotal_amount` | `MISSING` | — | `numeric(12 NOT NULL DEFAULT 0.00` | Column "subtotal_amount" is missing in table "sales". |
| `sales` | `discount_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sales.discount_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sales` | `tax_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sales.tax_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sales` | `total_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sales.total_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sales` | `paid_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sales.paid_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sales` | `due_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sales.due_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sale_items` | `business_id` | `NULLABILITY` | `NULL` | `NOT NULL` | Nullability mismatch for "sale_items.business_id": current is NULL, target expects NOT NULL. |
| `sale_items` | `quantity` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "sale_items.quantity": current "numeric(12,3)" vs target "numeric(12". |
| `sale_items` | `unit_price` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sale_items.unit_price": current "numeric(12,2)" vs target "numeric(12". |
| `sale_items` | `unit_cost` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sale_items.unit_cost": current "numeric(12,2)" vs target "numeric(12". |
| `sale_items` | `discount_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sale_items.discount_amount": current "numeric(12,2)" vs target "numeric(12". |
| `sale_items` | `subtotal` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "sale_items.subtotal": current "numeric(12,2)" vs target "numeric(12". |
| `payments` | `amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "payments.amount": current "numeric(12,2)" vs target "numeric(12". |
| `payments` | `exchange_rate` | `DATA_TYPE` | `numeric(10,4)` | `numeric(10` | Data type mismatch for "payments.exchange_rate": current "numeric(10,4)" vs target "numeric(10". |
| `suppliers` | `outstanding_balance` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "suppliers.outstanding_balance": current "numeric(12,2)" vs target "numeric(12". |
| `purchase_orders` | `total_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "purchase_orders.total_amount": current "numeric(12,2)" vs target "numeric(12". |
| `purchase_orders` | `paid_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "purchase_orders.paid_amount": current "numeric(12,2)" vs target "numeric(12". |
| `purchase_orders` | `due_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "purchase_orders.due_amount": current "numeric(12,2)" vs target "numeric(12". |
| `purchase_items` | `quantity_ordered` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "purchase_items.quantity_ordered": current "numeric(12,3)" vs target "numeric(12". |
| `purchase_items` | `quantity_received` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "purchase_items.quantity_received": current "numeric(12,3)" vs target "numeric(12". |
| `purchase_items` | `unit_cost` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "purchase_items.unit_cost": current "numeric(12,2)" vs target "numeric(12". |
| `purchase_items` | `subtotal` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "purchase_items.subtotal": current "numeric(12,2)" vs target "numeric(12". |
| `expenses` | `amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "expenses.amount": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_sales_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "daily_summaries.total_sales_amount": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_cost_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "daily_summaries.total_cost_amount": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_gross_profit` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "daily_summaries.total_gross_profit": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_expenses_amount` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "daily_summaries.total_expenses_amount": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_net_profit` | `DATA_TYPE` | `numeric(12,2)` | `numeric(12` | Data type mismatch for "daily_summaries.total_net_profit": current "numeric(12,2)" vs target "numeric(12". |
| `daily_summaries` | `total_stock_in_qty` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "daily_summaries.total_stock_in_qty": current "numeric(12,3)" vs target "numeric(12". |
| `daily_summaries` | `total_stock_out_qty` | `DATA_TYPE` | `numeric(12,3)` | `numeric(12` | Data type mismatch for "daily_summaries.total_stock_out_qty": current "numeric(12,3)" vs target "numeric(12". |
| `products` | `is_active` | `EXTRA` | `boolean NOT NULL` | — | Extra column "is_active" found in current table "products" that is not defined in target SQL schema. |
| `sales` | `subtotal` | `EXTRA` | `numeric(12,2) NOT NULL` | — | Extra column "subtotal" found in current table "sales" that is not defined in target SQL schema. |

## 5. Primary & Foreign Key Differences

### Foreign Keys
- **sale_items** (`business_id` -> `businesses`): Foreign key on "sale_items.business_id" referencing "businesses(id)" is missing.
- **payments** (`business_id` -> `businesses`): Foreign key on "payments.business_id" referencing "businesses(id)" is missing.
- **purchase_orders** (`business_id` -> `businesses`): Foreign key on "purchase_orders.business_id" referencing "businesses(id)" is missing.
- **purchase_items** (`business_id` -> `businesses`): Foreign key on "purchase_items.business_id" referencing "businesses(id)" is missing.
- **expense_categories** (`business_id` -> `businesses`): Foreign key on "expense_categories.business_id" referencing "businesses(id)" is missing.
- **expenses** (`business_id` -> `businesses`): Foreign key on "expenses.business_id" referencing "businesses(id)" is missing.
- **daily_summaries** (`business_id` -> `businesses`): Foreign key on "daily_summaries.business_id" referencing "businesses(id)" is missing.

## 6. Constraints & Index Differences

### Constraints
- **businesses** [`chk_businesses_currency`]: Missing CHECK constraint "chk_businesses_currency" on table "businesses". Target definition: CHECK (currency IN ('KHR', 'USD'))
- **profiles** [`chk_profiles_role`]: Missing CHECK constraint "chk_profiles_role" on table "profiles". Target definition: CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'staff'))
- **stock_movements** [`chk_stock_movements_balance_before`]: Missing CHECK constraint "chk_stock_movements_balance_before" on table "stock_movements". Target definition: CHECK (balance_before >= 0)
- **stock_movements** [`chk_stock_movements_balance_after`]: Missing CHECK constraint "chk_stock_movements_balance_after" on table "stock_movements". Target definition: CHECK (balance_after >= 0)
- **customers** [`chk_customers_credit_limit`]: Missing CHECK constraint "chk_customers_credit_limit" on table "customers". Target definition: CHECK (credit_limit >= 0)
- **sales** [`chk_sales_subtotal`]: Missing CHECK constraint "chk_sales_subtotal" on table "sales". Target definition: CHECK (subtotal_amount >= 0)
- **sales** [`chk_sales_discount`]: Missing CHECK constraint "chk_sales_discount" on table "sales". Target definition: CHECK (discount_amount >= 0)
- **sales** [`chk_sales_tax`]: Missing CHECK constraint "chk_sales_tax" on table "sales". Target definition: CHECK (tax_amount >= 0)
- **sales** [`chk_sales_paid`]: Missing CHECK constraint "chk_sales_paid" on table "sales". Target definition: CHECK (paid_amount >= 0)
- **sales** [`chk_sales_due`]: Missing CHECK constraint "chk_sales_due" on table "sales". Target definition: CHECK (due_amount >= 0)
- **sales** [`chk_sales_status`]: Missing CHECK constraint "chk_sales_status" on table "sales". Target definition: CHECK (status IN ('draft', 'completed', 'cancelled', 'refunded'))
- **sales** [`chk_sales_payment_status`]: Missing CHECK constraint "chk_sales_payment_status" on table "sales". Target definition: CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue'))
- **sale_items** [`chk_sale_items_qty`]: Missing CHECK constraint "chk_sale_items_qty" on table "sale_items". Target definition: CHECK (quantity > 0)
- **sale_items** [`chk_sale_items_unit_price`]: Missing CHECK constraint "chk_sale_items_unit_price" on table "sale_items". Target definition: CHECK (unit_price >= 0)
- **sale_items** [`chk_sale_items_unit_cost`]: Missing CHECK constraint "chk_sale_items_unit_cost" on table "sale_items". Target definition: CHECK (unit_cost >= 0)
- **sale_items** [`chk_sale_items_discount`]: Missing CHECK constraint "chk_sale_items_discount" on table "sale_items". Target definition: CHECK (discount_amount >= 0)
- **sale_items** [`chk_sale_items_subtotal`]: Missing CHECK constraint "chk_sale_items_subtotal" on table "sale_items". Target definition: CHECK (subtotal >= 0)
- **payments** [`chk_payments_amount`]: Missing CHECK constraint "chk_payments_amount" on table "payments". Target definition: CHECK (amount > 0)
- **payments** [`chk_payments_exchange_rate`]: Missing CHECK constraint "chk_payments_exchange_rate" on table "payments". Target definition: CHECK (exchange_rate > 0)
- **payments** [`chk_payments_currency`]: Missing CHECK constraint "chk_payments_currency" on table "payments". Target definition: CHECK (currency IN ('KHR', 'USD'))
- **payments** [`chk_payments_method`]: Missing CHECK constraint "chk_payments_method" on table "payments". Target definition: CHECK (payment_method IN ('cash', 'khqr', 'bank_transfer', 'card', 'credit'))
- **payments** [`chk_payments_status`]: Missing CHECK constraint "chk_payments_status" on table "payments". Target definition: CHECK (status IN ('completed', 'voided', 'refunded'))
- **payments** [`uq_payments_biz_payment_number`]: Missing UNIQUE constraint "uq_payments_biz_payment_number" on table "payments". Target definition: UNIQUE (business_id, payment_number)
- **purchase_orders** [`chk_purchase_orders_total`]: Missing CHECK constraint "chk_purchase_orders_total" on table "purchase_orders". Target definition: CHECK (total_amount >= 0)
- **purchase_orders** [`chk_purchase_orders_paid`]: Missing CHECK constraint "chk_purchase_orders_paid" on table "purchase_orders". Target definition: CHECK (paid_amount >= 0)
- **purchase_orders** [`chk_purchase_orders_due`]: Missing CHECK constraint "chk_purchase_orders_due" on table "purchase_orders". Target definition: CHECK (due_amount >= 0)
- **purchase_orders** [`chk_purchase_orders_status`]: Missing CHECK constraint "chk_purchase_orders_status" on table "purchase_orders". Target definition: CHECK (status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled'))
- **purchase_orders** [`chk_purchase_orders_payment_status`]: Missing CHECK constraint "chk_purchase_orders_payment_status" on table "purchase_orders". Target definition: CHECK (payment_status IN ('unpaid', 'partial', 'paid'))
- **purchase_orders** [`uq_purchase_orders_biz_po_number`]: Missing UNIQUE constraint "uq_purchase_orders_biz_po_number" on table "purchase_orders". Target definition: UNIQUE (business_id, po_number)
- **purchase_items** [`chk_purchase_items_qty_ordered`]: Missing CHECK constraint "chk_purchase_items_qty_ordered" on table "purchase_items". Target definition: CHECK (quantity_ordered > 0)
- **purchase_items** [`chk_purchase_items_qty_received`]: Missing CHECK constraint "chk_purchase_items_qty_received" on table "purchase_items". Target definition: CHECK (quantity_received >= 0)
- **purchase_items** [`chk_purchase_items_unit_cost`]: Missing CHECK constraint "chk_purchase_items_unit_cost" on table "purchase_items". Target definition: CHECK (unit_cost >= 0)
- **purchase_items** [`chk_purchase_items_subtotal`]: Missing CHECK constraint "chk_purchase_items_subtotal" on table "purchase_items". Target definition: CHECK (subtotal >= 0)
- **expense_categories** [`uq_expense_categories_biz_code`]: Missing UNIQUE constraint "uq_expense_categories_biz_code" on table "expense_categories". Target definition: UNIQUE (business_id, code)
- **expenses** [`chk_expenses_amount`]: Missing CHECK constraint "chk_expenses_amount" on table "expenses". Target definition: CHECK (amount > 0)
- **expenses** [`chk_expenses_currency`]: Missing CHECK constraint "chk_expenses_currency" on table "expenses". Target definition: CHECK (currency IN ('KHR', 'USD'))
- **expenses** [`chk_expenses_method`]: Missing CHECK constraint "chk_expenses_method" on table "expenses". Target definition: CHECK (payment_method IN ('cash', 'khqr', 'bank_transfer', 'card', 'credit'))
- **expenses** [`uq_expenses_biz_expense_number`]: Missing UNIQUE constraint "uq_expenses_biz_expense_number" on table "expenses". Target definition: UNIQUE (business_id, expense_number)
- **daily_summaries** [`chk_daily_summaries_sales_amt`]: Missing CHECK constraint "chk_daily_summaries_sales_amt" on table "daily_summaries". Target definition: CHECK (total_sales_amount >= 0)
- **daily_summaries** [`chk_daily_summaries_sales_cnt`]: Missing CHECK constraint "chk_daily_summaries_sales_cnt" on table "daily_summaries". Target definition: CHECK (total_sales_count >= 0)
- **daily_summaries** [`chk_daily_summaries_cost_amt`]: Missing CHECK constraint "chk_daily_summaries_cost_amt" on table "daily_summaries". Target definition: CHECK (total_cost_amount >= 0)
- **daily_summaries** [`chk_daily_summaries_expenses_amt`]: Missing CHECK constraint "chk_daily_summaries_expenses_amt" on table "daily_summaries". Target definition: CHECK (total_expenses_amount >= 0)
- **daily_summaries** [`chk_daily_summaries_stock_in`]: Missing CHECK constraint "chk_daily_summaries_stock_in" on table "daily_summaries". Target definition: CHECK (total_stock_in_qty >= 0)
- **daily_summaries** [`chk_daily_summaries_stock_out`]: Missing CHECK constraint "chk_daily_summaries_stock_out" on table "daily_summaries". Target definition: CHECK (total_stock_out_qty >= 0)
- **daily_summaries** [`uq_daily_summaries_biz_date`]: Missing UNIQUE constraint "uq_daily_summaries_biz_date" on table "daily_summaries". Target definition: UNIQUE (business_id, summary_date)
- **businesses** [`nn_businesses_name`]: Extra NOT NULL constraint "nn_businesses_name" found on table "businesses" in current database.
- **products** [`uq_products_biz_barcode`]: Extra UNIQUE constraint "uq_products_biz_barcode" found on table "products" in current database.
- **products** [`nn_products_name`]: Extra NOT NULL constraint "nn_products_name" found on table "products" in current database.
- **products** [`nn_products_current_stock`]: Extra NOT NULL constraint "nn_products_current_stock" found on table "products" in current database.
- **stock_movements** [`uq_stock_movements_idempotency`]: Extra UNIQUE constraint "uq_stock_movements_idempotency" found on table "stock_movements" in current database.
- **stock_movements** [`nn_stock_movements_reason`]: Extra NOT NULL constraint "nn_stock_movements_reason" found on table "stock_movements" in current database.
- **sales** [`nn_sales_sold_at`]: Extra NOT NULL constraint "nn_sales_sold_at" found on table "sales" in current database.

### Indexes
- **profiles** [`idx_profiles_business_id`]: Missing index "idx_profiles_business_id" on table "profiles" (business_id).
- **profiles** [`idx_profiles_role`]: Missing index "idx_profiles_role" on table "profiles" (business_id, role).
- **products** [`idx_products_business_id`]: Missing index "idx_products_business_id" on table "products" (business_id).
- **products** [`idx_products_category_id`]: Missing index "idx_products_category_id" on table "products" (category_id).
- **products** [`idx_products_unit_id`]: Missing index "idx_products_unit_id" on table "products" (unit_id).
- **products** [`idx_products_search`]: Missing index "idx_products_search" on table "products" (business_id, name, sku).
- **products** [`idx_products_stock_alert`]: Index definition mismatch for "idx_products_stock_alert" on "products": uniqueness current false vs target false, partial current false vs target true.
- **stock_movements** [`idx_stock_movements_type`]: Missing index "idx_stock_movements_type" on table "stock_movements" (business_id, movement_type, created_at DESC).
- **stock_movements** [`idx_stock_movements_ref`]: Missing index "idx_stock_movements_ref" on table "stock_movements" (reference_type, reference_id).
- **sales** [`idx_sales_biz_created`]: Missing index "idx_sales_biz_created" on table "sales" (business_id, created_at DESC).
- **sales** [`idx_sales_status`]: Missing index "idx_sales_status" on table "sales" (business_id, status, payment_status).
- **payments** [`idx_payments_biz_created`]: Missing index "idx_payments_biz_created" on table "payments" (business_id, paid_at DESC).
- **payments** [`idx_payments_sale`]: Missing index "idx_payments_sale" on table "payments" (sale_id).
- **payments** [`idx_payments_customer`]: Missing index "idx_payments_customer" on table "payments" (customer_id).
- **suppliers** [`idx_suppliers_biz`]: Missing index "idx_suppliers_biz" on table "suppliers" (business_id).
- **purchase_orders** [`idx_purchase_orders_biz_status`]: Missing index "idx_purchase_orders_biz_status" on table "purchase_orders" (business_id, status, created_at DESC).
- **purchase_orders** [`idx_purchase_orders_supplier`]: Missing index "idx_purchase_orders_supplier" on table "purchase_orders" (supplier_id).
- **purchase_items** [`idx_purchase_items_po`]: Missing index "idx_purchase_items_po" on table "purchase_items" (purchase_order_id).
- **expenses** [`idx_expenses_biz_date`]: Missing index "idx_expenses_biz_date" on table "expenses" (business_id, incurred_at DESC).
- **expenses** [`idx_expenses_category`]: Missing index "idx_expenses_category" on table "expenses" (category_id).
- **daily_summaries** [`idx_daily_summaries_biz_date`]: Missing index "idx_daily_summaries_biz_date" on table "daily_summaries" (business_id, summary_date DESC).
- **products** [`idx_products_biz_category`]: Extra index "idx_products_biz_category" found on table "products" in current database.
- **products** [`idx_products_biz_sku`]: Extra index "idx_products_biz_sku" found on table "products" in current database.
- **customers** [`idx_customers_biz_phone`]: Extra index "idx_customers_biz_phone" found on table "customers" in current database.
- **sales** [`idx_sales_biz_sold_at`]: Extra index "idx_sales_biz_sold_at" found on table "sales" in current database.

## 7. Engineering Recommendations

1. **[HIGH] Add Missing Columns:** Add 3 missing columns across existing tables to support full application capabilities.
2. **[MEDIUM] Restore Missing Foreign Keys:** Ensure referential integrity constraints are properly declared across tenant models.
3. **[MEDIUM] Build Search & Foreign Key Indexes:** Create missing search and btree indexes to ensure query performance and prevent full-table scans.
