# WYN Database Migration Execution Plan
**Target File:** `database_v1.sql` | **Schema Hash:** `CC44B3AB4DAD69FA5634C218F5EA06266E8E6A008666F0B5621BCE65510C7F93` | **Generated:** `2026-07-27T16:37:17.769Z`

---

## 1. Executive Summary

| Metric | Value |
| :--- | :---: |
| **Total Migration Stages** | **6** |
| **Total Execution Tasks** | **97** |
| **Estimated Total Duration** | **28s** |
| **Overall Migration Risk** | **`HIGH`** |
| **Rollback Strategy** | **`MANUAL`** |

## 2. Migration Stages

| Stage | Name | Description | Tasks | Duration | Risk |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Stage 1** | Foundation & Schemas | PostgreSQL extensions, schemas, base system settings, and core foundation tables. | 1 | 2s | `LOW` |
| **Stage 2** | Lookup & Reference Tables | Product categories, units of measure, statuses, and reference domain models. | 0 | 3s | `LOW` |
| **Stage 3** | Core Entities & Inventory | Products, customers, suppliers, stores, and primary business entity tables. | 16 | 5s | `MEDIUM` |
| **Stage 4** | Ledger & Transactions | Stock movements, sales orders, line items, payments, and transaction ledgers. | 18 | 8s | `HIGH` |
| **Stage 5** | Finance & Analytics | Expenses, daily financial summaries, audit logs, and reporting structures. | 8 | 4s | `MEDIUM` |
| **Stage 6** | Constraints & Indexes | Foreign key referential integrity constraints, unique/check constraints, and performance btree indexes. | 54 | 6s | `MEDIUM` |

## 3. Dependency Graph & Creation Order

**Required Table Creation Sequence:**
```
businesses ➔ customers ➔ daily_summaries ➔ expense_categories ➔ expenses ➔ product_categories ➔ product_units ➔ products ➔ profiles ➔ sales ➔ payments ➔ sale_items ➔ stock_movements ➔ suppliers ➔ purchase_orders ➔ purchase_items
```

## 4. Execution Tasks

| ID | Stage | Title | Target Entity | Duration | Risk | Rollback |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: |
| `TASK-101` | Stage 1 | Enable Extension 'pgcrypto' | `pgcrypto` | 200ms | `LOW` | `SAFE` |
| `TASK-104` | Stage 3 | Modify Column Type 'credit_limit' in 'customers' | `customers.credit_limit` | 500ms | `HIGH` | `MANUAL` |
| `TASK-105` | Stage 3 | Modify Column Type 'outstanding_balance' in 'customers' | `customers.outstanding_balance` | 500ms | `HIGH` | `MANUAL` |
| `TASK-107` | Stage 5 | Modify Column Type 'total_sales_amount' in 'daily_summaries' | `daily_summaries.total_sales_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-108` | Stage 5 | Modify Column Type 'total_cost_amount' in 'daily_summaries' | `daily_summaries.total_cost_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-109` | Stage 5 | Modify Column Type 'total_gross_profit' in 'daily_summaries' | `daily_summaries.total_gross_profit` | 500ms | `HIGH` | `MANUAL` |
| `TASK-110` | Stage 5 | Modify Column Type 'total_expenses_amount' in 'daily_summaries' | `daily_summaries.total_expenses_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-111` | Stage 5 | Modify Column Type 'total_net_profit' in 'daily_summaries' | `daily_summaries.total_net_profit` | 500ms | `HIGH` | `MANUAL` |
| `TASK-112` | Stage 5 | Modify Column Type 'total_stock_in_qty' in 'daily_summaries' | `daily_summaries.total_stock_in_qty` | 500ms | `HIGH` | `MANUAL` |
| `TASK-113` | Stage 5 | Modify Column Type 'total_stock_out_qty' in 'daily_summaries' | `daily_summaries.total_stock_out_qty` | 500ms | `HIGH` | `MANUAL` |
| `TASK-116` | Stage 5 | Modify Column Type 'amount' in 'expenses' | `expenses.amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-120` | Stage 3 | Modify Column Type 'cost_price' in 'products' | `products.cost_price` | 500ms | `HIGH` | `MANUAL` |
| `TASK-121` | Stage 3 | Modify Column Type 'selling_price' in 'products' | `products.selling_price` | 500ms | `HIGH` | `MANUAL` |
| `TASK-122` | Stage 3 | Modify Column Type 'current_stock' in 'products' | `products.current_stock` | 500ms | `HIGH` | `MANUAL` |
| `TASK-123` | Stage 3 | Modify Column Type 'min_stock_alert' in 'products' | `products.min_stock_alert` | 500ms | `HIGH` | `MANUAL` |
| `TASK-126` | Stage 4 | Add Column 'subtotal_amount' to 'sales' | `sales.subtotal_amount` | 250ms | `LOW` | `SAFE` |
| `TASK-127` | Stage 4 | Modify Column Type 'discount_amount' in 'sales' | `sales.discount_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-128` | Stage 4 | Modify Column Type 'tax_amount' in 'sales' | `sales.tax_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-129` | Stage 4 | Modify Column Type 'total_amount' in 'sales' | `sales.total_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-130` | Stage 4 | Modify Column Type 'paid_amount' in 'sales' | `sales.paid_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-131` | Stage 4 | Modify Column Type 'due_amount' in 'sales' | `sales.due_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-133` | Stage 4 | Modify Column Type 'amount' in 'payments' | `payments.amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-134` | Stage 4 | Modify Column Type 'exchange_rate' in 'payments' | `payments.exchange_rate` | 500ms | `HIGH` | `MANUAL` |
| `TASK-136` | Stage 3 | Modify Column Type 'quantity' in 'sale_items' | `sale_items.quantity` | 500ms | `HIGH` | `MANUAL` |
| `TASK-137` | Stage 3 | Modify Column Type 'unit_price' in 'sale_items' | `sale_items.unit_price` | 500ms | `HIGH` | `MANUAL` |
| `TASK-138` | Stage 3 | Modify Column Type 'unit_cost' in 'sale_items' | `sale_items.unit_cost` | 500ms | `HIGH` | `MANUAL` |
| `TASK-139` | Stage 3 | Modify Column Type 'discount_amount' in 'sale_items' | `sale_items.discount_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-140` | Stage 3 | Modify Column Type 'subtotal' in 'sale_items' | `sale_items.subtotal` | 500ms | `HIGH` | `MANUAL` |
| `TASK-142` | Stage 4 | Modify Column Type 'quantity' in 'stock_movements' | `stock_movements.quantity` | 500ms | `HIGH` | `MANUAL` |
| `TASK-143` | Stage 4 | Modify Column Type 'balance_before' in 'stock_movements' | `stock_movements.balance_before` | 500ms | `HIGH` | `MANUAL` |
| `TASK-144` | Stage 4 | Modify Column Type 'balance_after' in 'stock_movements' | `stock_movements.balance_after` | 500ms | `HIGH` | `MANUAL` |
| `TASK-145` | Stage 4 | Modify Column Type 'unit_cost' in 'stock_movements' | `stock_movements.unit_cost` | 500ms | `HIGH` | `MANUAL` |
| `TASK-146` | Stage 4 | Modify Column Type 'total_cost' in 'stock_movements' | `stock_movements.total_cost` | 500ms | `HIGH` | `MANUAL` |
| `TASK-147` | Stage 4 | Add Column 'notes' to 'stock_movements' | `stock_movements.notes` | 250ms | `LOW` | `SAFE` |
| `TASK-148` | Stage 4 | Add Column 'created_by' to 'stock_movements' | `stock_movements.created_by` | 250ms | `LOW` | `SAFE` |
| `TASK-150` | Stage 3 | Modify Column Type 'outstanding_balance' in 'suppliers' | `suppliers.outstanding_balance` | 500ms | `HIGH` | `MANUAL` |
| `TASK-152` | Stage 4 | Modify Column Type 'total_amount' in 'purchase_orders' | `purchase_orders.total_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-153` | Stage 4 | Modify Column Type 'paid_amount' in 'purchase_orders' | `purchase_orders.paid_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-154` | Stage 4 | Modify Column Type 'due_amount' in 'purchase_orders' | `purchase_orders.due_amount` | 500ms | `HIGH` | `MANUAL` |
| `TASK-156` | Stage 3 | Modify Column Type 'quantity_ordered' in 'purchase_items' | `purchase_items.quantity_ordered` | 500ms | `HIGH` | `MANUAL` |
| `TASK-157` | Stage 3 | Modify Column Type 'quantity_received' in 'purchase_items' | `purchase_items.quantity_received` | 500ms | `HIGH` | `MANUAL` |
| `TASK-158` | Stage 3 | Modify Column Type 'unit_cost' in 'purchase_items' | `purchase_items.unit_cost` | 500ms | `HIGH` | `MANUAL` |
| `TASK-159` | Stage 3 | Modify Column Type 'subtotal' in 'purchase_items' | `purchase_items.subtotal` | 500ms | `HIGH` | `MANUAL` |
| `TASK-160` | Stage 6 | Add Foreign Key 'fk_profiles_business_id' on 'profiles' | `profiles.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-161` | Stage 6 | Create Index 'idx_profiles_business_id' on 'profiles' | `profiles.idx_profiles_business_id` | 400ms | `LOW` | `SAFE` |
| `TASK-162` | Stage 6 | Create Index 'idx_profiles_role' on 'profiles' | `profiles.idx_profiles_role` | 400ms | `LOW` | `SAFE` |
| `TASK-163` | Stage 6 | Add Foreign Key 'fk_product_categories_business_id' on 'product_categories' | `product_categories.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-164` | Stage 6 | Add Foreign Key 'fk_product_units_business_id' on 'product_units' | `product_units.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-165` | Stage 6 | Add Foreign Key 'fk_products_business_id' on 'products' | `products.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-166` | Stage 6 | Add Foreign Key 'fk_products_category_id' on 'products' | `products.category_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-167` | Stage 6 | Add Foreign Key 'fk_products_unit_id' on 'products' | `products.unit_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-168` | Stage 6 | Create Index 'uq_products_biz_barcode' on 'products' | `products.uq_products_biz_barcode` | 400ms | `LOW` | `SAFE` |
| `TASK-169` | Stage 6 | Create Index 'idx_products_business_id' on 'products' | `products.idx_products_business_id` | 400ms | `LOW` | `SAFE` |
| `TASK-170` | Stage 6 | Create Index 'idx_products_category_id' on 'products' | `products.idx_products_category_id` | 400ms | `LOW` | `SAFE` |
| `TASK-171` | Stage 6 | Create Index 'idx_products_unit_id' on 'products' | `products.idx_products_unit_id` | 400ms | `LOW` | `SAFE` |
| `TASK-172` | Stage 6 | Create Index 'idx_products_search' on 'products' | `products.idx_products_search` | 400ms | `LOW` | `SAFE` |
| `TASK-173` | Stage 6 | Create Index 'idx_products_low_stock' on 'products' | `products.idx_products_low_stock` | 400ms | `LOW` | `SAFE` |
| `TASK-174` | Stage 6 | Add Foreign Key 'fk_stock_movements_business_id' on 'stock_movements' | `stock_movements.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-175` | Stage 6 | Add Foreign Key 'fk_stock_movements_product_id' on 'stock_movements' | `stock_movements.product_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-176` | Stage 6 | Create Index 'uq_stock_movements_idempotency' on 'stock_movements' | `stock_movements.uq_stock_movements_idempotency` | 400ms | `LOW` | `SAFE` |
| `TASK-177` | Stage 6 | Create Index 'idx_stock_movements_biz_product' on 'stock_movements' | `stock_movements.idx_stock_movements_biz_product` | 400ms | `LOW` | `SAFE` |
| `TASK-178` | Stage 6 | Create Index 'idx_stock_movements_type' on 'stock_movements' | `stock_movements.idx_stock_movements_type` | 400ms | `LOW` | `SAFE` |
| `TASK-179` | Stage 6 | Create Index 'idx_stock_movements_ref' on 'stock_movements' | `stock_movements.idx_stock_movements_ref` | 400ms | `LOW` | `SAFE` |
| `TASK-180` | Stage 6 | Add Foreign Key 'fk_customers_business_id' on 'customers' | `customers.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-181` | Stage 6 | Add Foreign Key 'fk_sales_business_id' on 'sales' | `sales.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-182` | Stage 6 | Add Foreign Key 'fk_sales_customer_id' on 'sales' | `sales.customer_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-183` | Stage 6 | Create Index 'idx_sales_biz_created' on 'sales' | `sales.idx_sales_biz_created` | 400ms | `LOW` | `SAFE` |
| `TASK-184` | Stage 6 | Create Index 'idx_sales_customer' on 'sales' | `sales.idx_sales_customer` | 400ms | `LOW` | `SAFE` |
| `TASK-185` | Stage 6 | Create Index 'idx_sales_status' on 'sales' | `sales.idx_sales_status` | 400ms | `LOW` | `SAFE` |
| `TASK-186` | Stage 6 | Add Foreign Key 'fk_sale_items_business_id' on 'sale_items' | `sale_items.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-187` | Stage 6 | Add Foreign Key 'fk_sale_items_sale_id' on 'sale_items' | `sale_items.sale_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-188` | Stage 6 | Add Foreign Key 'fk_sale_items_product_id' on 'sale_items' | `sale_items.product_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-189` | Stage 6 | Create Index 'idx_sale_items_sale' on 'sale_items' | `sale_items.idx_sale_items_sale` | 400ms | `LOW` | `SAFE` |
| `TASK-190` | Stage 6 | Create Index 'idx_sale_items_product' on 'sale_items' | `sale_items.idx_sale_items_product` | 400ms | `LOW` | `SAFE` |
| `TASK-191` | Stage 6 | Add Foreign Key 'fk_payments_business_id' on 'payments' | `payments.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-192` | Stage 6 | Add Foreign Key 'fk_payments_sale_id' on 'payments' | `payments.sale_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-193` | Stage 6 | Add Foreign Key 'fk_payments_customer_id' on 'payments' | `payments.customer_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-194` | Stage 6 | Create Index 'idx_payments_biz_created' on 'payments' | `payments.idx_payments_biz_created` | 400ms | `LOW` | `SAFE` |
| `TASK-195` | Stage 6 | Create Index 'idx_payments_sale' on 'payments' | `payments.idx_payments_sale` | 400ms | `LOW` | `SAFE` |
| `TASK-196` | Stage 6 | Create Index 'idx_payments_customer' on 'payments' | `payments.idx_payments_customer` | 400ms | `LOW` | `SAFE` |
| `TASK-197` | Stage 6 | Add Foreign Key 'fk_suppliers_business_id' on 'suppliers' | `suppliers.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-198` | Stage 6 | Create Index 'idx_suppliers_biz' on 'suppliers' | `suppliers.idx_suppliers_biz` | 400ms | `LOW` | `SAFE` |
| `TASK-199` | Stage 6 | Add Foreign Key 'fk_purchase_orders_business_id' on 'purchase_orders' | `purchase_orders.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-200` | Stage 6 | Add Foreign Key 'fk_purchase_orders_supplier_id' on 'purchase_orders' | `purchase_orders.supplier_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-201` | Stage 6 | Create Index 'idx_purchase_orders_biz_status' on 'purchase_orders' | `purchase_orders.idx_purchase_orders_biz_status` | 400ms | `LOW` | `SAFE` |
| `TASK-202` | Stage 6 | Create Index 'idx_purchase_orders_supplier' on 'purchase_orders' | `purchase_orders.idx_purchase_orders_supplier` | 400ms | `LOW` | `SAFE` |
| `TASK-203` | Stage 6 | Add Foreign Key 'fk_purchase_items_business_id' on 'purchase_items' | `purchase_items.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-204` | Stage 6 | Add Foreign Key 'fk_purchase_items_purchase_order_id' on 'purchase_items' | `purchase_items.purchase_order_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-205` | Stage 6 | Add Foreign Key 'fk_purchase_items_product_id' on 'purchase_items' | `purchase_items.product_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-206` | Stage 6 | Create Index 'idx_purchase_items_po' on 'purchase_items' | `purchase_items.idx_purchase_items_po` | 400ms | `LOW` | `SAFE` |
| `TASK-207` | Stage 6 | Add Foreign Key 'fk_expense_categories_business_id' on 'expense_categories' | `expense_categories.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-208` | Stage 6 | Add Foreign Key 'fk_expenses_business_id' on 'expenses' | `expenses.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-209` | Stage 6 | Add Foreign Key 'fk_expenses_category_id' on 'expenses' | `expenses.category_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-210` | Stage 6 | Create Index 'idx_expenses_biz_date' on 'expenses' | `expenses.idx_expenses_biz_date` | 400ms | `LOW` | `SAFE` |
| `TASK-211` | Stage 6 | Create Index 'idx_expenses_category' on 'expenses' | `expenses.idx_expenses_category` | 400ms | `LOW` | `SAFE` |
| `TASK-212` | Stage 6 | Add Foreign Key 'fk_daily_summaries_business_id' on 'daily_summaries' | `daily_summaries.business_id` | 300ms | `MEDIUM` | `SAFE` |
| `TASK-213` | Stage 6 | Create Index 'idx_daily_summaries_biz_date' on 'daily_summaries' | `daily_summaries.idx_daily_summaries_biz_date` | 400ms | `LOW` | `SAFE` |

## 5. Risk Matrix & Mitigations

### [HIGH] Column Data Type Modifications (DATA_LOSS)
39 column data type modifications detected. Potential data truncation or conversion failure if unhandled.
- **Mitigation:** Use explicit SQL USING clauses with type casting functions and verify staging data before applying to production.

### [MEDIUM] Foreign Key Referential Integrity Validation (CONSTRAINT_FAILURE)
7 foreign key constraints need creation or verification. Existing orphan records could cause constraint creation failures.
- **Mitigation:** Execute orphan record detection queries prior to applying ALTER TABLE ADD CONSTRAINT FOREIGN KEY.

### [MEDIUM] Index Creation Overhead (PERFORMANCE)
Creating 27 indexes concurrently may consume I/O resources during peak traffic.
- **Mitigation:** Execute CREATE INDEX CONCURRENTLY outside peak business hours to prevent table write blocking.

### [HIGH] Access Exclusive Table Locking (LOCKING)
ALTER TABLE operations acquire ACCESS EXCLUSIVE locks on 42 tables, temporarily blocking concurrent queries.
- **Mitigation:** Set statement_timeout = "5s" and lock_timeout = "2s" in PostgreSQL session to prevent lock queue blockage.

### [LOW] Application Backward Compatibility (APPLICATION_COMPATIBILITY)
Zero destructive renames. New tables and columns added incrementally.
- **Mitigation:** Deploy database migration prior to backend code release.

## 6. Rollback Strategy

**Overall Strategy:** `MANUAL`
Rollback requires manual data verification and structured SQL scripts for column modifications.
*For detailed step-by-step SQL rollback scripts, refer to `rollback_plan.md`.*

## 7. Validation Checklist

### Pre-Migration Checklist
- [ ] **Verify Full Database Backup** (`VAL-PRE-001`): Ensure point-in-time snapshot or pg_dump backup is successfully generated and verified.
- [ ] **Validate Schema Hash** (`VAL-PRE-002`): Confirm the current database schema hash matches the expected target hash in reports.
- [ ] **Inspect Active Database Connections** (`VAL-PRE-003`): Ensure no active long-running write transactions exist on target tables.
- [ ] **Set Session Lock Timeouts** (`VAL-PRE-004`): Configure lock_timeout = "2s" and statement_timeout = "10s" for the migration session.

### In-Flight Migration Checklist
- [ ] **Stage-by-Stage Atomic Transactions** (`VAL-DUR-001`): Execute each migration stage within an explicit BEGIN ... COMMIT transaction block.
- [ ] **Monitor Exclusive Table Lock Duration** (`VAL-DUR-002`): Track ACCESS EXCLUSIVE lock hold times during DDL execution.
- [ ] **Error Log Trap** (`VAL-DUR-003`): Immediately rollback active transaction on any SQL execution error or constraint failure.

### Post-Migration Checklist
- [ ] **Re-run Database Inspector & Schema Comparator** (`VAL-POST-001`): Verify schema match rate reaches 100% and zero differences remain.
- [ ] **Validate Foreign Key Referential Integrity** (`VAL-POST-002`): Execute orphan record check across newly introduced foreign keys.
- [ ] **Verify Index Usability and Status** (`VAL-POST-003`): Confirm all created btree indexes are marked as valid and ready for query optimizer.
- [ ] **Validate Record Counts** (`VAL-POST-004`): Compare table row counts before and after migration to guarantee zero inadvertent data loss.

## 8. Engineering Recommendations

1. Execute full database snapshot backup prior to starting Stage 1.
2. Set lock_timeout = "2s" in migration session to protect production read queries.
3. Run migration stages in sequential order within explicit BEGIN ... COMMIT blocks.
5. Re-run Database Inspector post-migration to verify 100% schema match rate.
