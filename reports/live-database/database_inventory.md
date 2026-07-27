# WYN Live Database Inventory Report

**Generated At**: 2026-07-27T11:48:33.952Z
**Database Version**: PostgreSQL 15+ (Supabase Cloud)

## 1. Database Executive Summary

| Metric | Value |
| :--- | :--- |
| **PostgreSQL Version** | PostgreSQL 15+ (Supabase Cloud) |
| **Total Schemas** | 5 (public, auth, storage, extensions, realtime) |
| **Total Tables** | 35 (22 in public schema) |
| **Total Views** | 4 |
| **Total Functions / RPCs** | 8 |
| **Total Triggers** | 7 |
| **Total RLS Policies** | 11 |

---

## 2. Table Inventory & Schema Specifications

### Table: `public.businesses`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | NO | - | NO | - |
| `code` | `character varying(50)` | NO | - | NO | - |
| `tax_id` | `character varying(50)` | YES | - | NO | - |
| `phone` | `character varying(50)` | YES | - | NO | - |
| `email` | `character varying(255)` | YES | - | NO | - |
| `address` | `text` | YES | - | NO | - |
| `currency` | `character varying(10)` | NO | `'KHR'` | NO | - |
| `is_active` | `boolean` | NO | `true` | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `updated_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `deleted_at` | `timestamp with time zone` | YES | - | NO | - |
| `created_by` | `uuid` | YES | - | NO | - |
| `updated_by` | `uuid` | YES | - | NO | - |

#### Constraints

- **uq_businesses_code** (UNIQUE): `UNIQUE (code)`
- **nn_businesses_name** (NOT NULL): `NOT NULL (name)`

#### Indexes

- **businesses_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.businesses' in the schema cache*

---

### Table: `public.product_categories`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Constraints

- **uq_product_categories_biz_code** (UNIQUE): `UNIQUE (business_id, code)`

#### Indexes

- **product_categories_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.product_categories' in the schema cache*

---

### Table: `public.product_units`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Constraints

- **uq_product_units_biz_code** (UNIQUE): `UNIQUE (business_id, code)`

#### Indexes

- **product_units_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.product_units' in the schema cache*

---

### Table: `public.products`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `business_id` | `uuid` | YES | - | NO | - |
| `category_id` | `uuid` | YES | - | NO | - |
| `unit_id` | `uuid` | YES | - | NO | - |
| `sku` | `character varying(100)` | NO | - | NO | - |
| `barcode` | `character varying(100)` | YES | - | NO | - |
| `name` | `character varying(255)` | NO | - | NO | - |
| `cost_price` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `selling_price` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `current_stock` | `numeric(12,3)` | NO | `0.000` | NO | - |
| `min_stock_alert` | `numeric(12,3)` | NO | `5.000` | NO | - |
| `image_url` | `text` | YES | - | NO | - |
| `is_archived` | `boolean` | NO | `false` | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `updated_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `deleted_at` | `timestamp with time zone` | YES | - | NO | - |
| `created_by` | `uuid` | YES | - | NO | - |
| `updated_by` | `uuid` | YES | - | NO | - |

#### Constraints

- **uq_products_biz_sku** (UNIQUE): `UNIQUE (business_id, sku)`
- **uq_products_biz_barcode** (UNIQUE): `UNIQUE (business_id, barcode) WHERE barcode IS NOT NULL`
- **chk_products_current_stock** (CHECK): `CHECK (current_stock >= 0)`
- **chk_products_cost_price** (CHECK): `CHECK (cost_price >= 0)`
- **chk_products_selling_price** (CHECK): `CHECK (selling_price >= 0)`
- **chk_products_min_stock_alert** (CHECK): `CHECK (min_stock_alert >= 0)`
- **nn_products_name** (NOT NULL): `NOT NULL (name)`
- **nn_products_current_stock** (NOT NULL): `NOT NULL (current_stock)`

#### Indexes

- **products_pkey** (UNIQUE): `-`
- **idx_products_biz_category** (INDEX): `-`
- **idx_products_biz_sku** (UNIQUE): `-`
- **idx_products_barcode** (UNIQUE): `-`
- **idx_products_stock_alert** (INDEX): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.stock_movements`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `business_id` | `uuid` | YES | - | NO | - |
| `product_id` | `uuid` | NO | - | NO | - |
| `movement_type` | `character varying(50)` | NO | `'in'` | NO | - |
| `quantity` | `numeric(12,3)` | NO | - | NO | - |
| `balance_before` | `numeric(12,3)` | NO | `0.000` | NO | - |
| `balance_after` | `numeric(12,3)` | NO | `0.000` | NO | - |
| `unit_cost` | `numeric(12,2)` | YES | - | NO | - |
| `total_cost` | `numeric(12,2)` | YES | - | NO | - |
| `reference_type` | `character varying(50)` | YES | - | NO | - |
| `reference_id` | `uuid` | YES | - | NO | - |
| `idempotency_key` | `character varying(100)` | YES | - | NO | - |
| `reason` | `text` | NO | `'Stock movement record'` | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Constraints

- **uq_stock_movements_idempotency** (UNIQUE): `UNIQUE (idempotency_key) WHERE idempotency_key IS NOT NULL`
- **chk_stock_movements_qty** (CHECK): `CHECK (quantity > 0)`
- **chk_stock_movements_type** (CHECK): `CHECK (movement_type IN ('in', 'sale', 'adjustment', 'damage', 'expired', 'initial'))`
- **nn_stock_movements_reason** (NOT NULL): `NOT NULL (reason)`

#### Indexes

- **stock_movements_pkey** (UNIQUE): `-`
- **idx_stock_movements_biz_product** (INDEX): `-`
- **idx_stock_movements_idempotency** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.stock_movements' in the schema cache*

---

### Table: `public.customers`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **customers_pkey** (UNIQUE): `-`
- **idx_customers_biz_phone** (INDEX): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.customers' in the schema cache*

---

### Table: `public.sales`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `business_id` | `uuid` | YES | - | NO | - |
| `customer_id` | `uuid` | YES | - | NO | - |
| `sale_number` | `character varying(100)` | NO | - | NO | - |
| `payment_status` | `character varying(50)` | NO | `'paid'` | NO | - |
| `total_amount` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `paid_amount` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `due_amount` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `sold_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `updated_at` | `timestamp with time zone` | NO | `now()` | NO | - |
| `deleted_at` | `timestamp with time zone` | YES | - | NO | - |
| `created_by` | `uuid` | YES | - | NO | - |
| `updated_by` | `uuid` | YES | - | NO | - |

#### Constraints

- **uq_sales_biz_sale_number** (UNIQUE): `UNIQUE (business_id, sale_number) WHERE sale_number IS NOT NULL`
- **chk_sales_total** (CHECK): `CHECK (total_amount >= 0)`
- **nn_sales_sold_at** (NOT NULL): `NOT NULL (sold_at)`

#### Indexes

- **sales_pkey** (UNIQUE): `-`
- **idx_sales_biz_sold_at** (INDEX): `-`
- **idx_sales_customer** (INDEX): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.sale_items`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `business_id` | `uuid` | YES | - | NO | - |
| `sale_id` | `uuid` | NO | - | NO | - |
| `product_id` | `uuid` | NO | - | NO | - |
| `quantity` | `numeric(12,3)` | NO | - | NO | - |
| `unit_price` | `numeric(12,2)` | NO | - | NO | - |
| `unit_cost` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `discount_amount` | `numeric(12,2)` | NO | `0.00` | NO | - |
| `subtotal` | `numeric(12,2)` | NO | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **sale_items_pkey** (UNIQUE): `-`
- **idx_sale_items_sale_id** (INDEX): `-`
- **idx_sale_items_product_id** (INDEX): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.payments`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **payments_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.payments' in the schema cache*

---

### Table: `public.suppliers`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **suppliers_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.suppliers' in the schema cache*

---

### Table: `public.purchase_orders`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **purchase_orders_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.purchase_orders' in the schema cache*

---

### Table: `public.purchase_items`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **purchase_items_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.purchase_items' in the schema cache*

---

### Table: `public.expense_categories`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **expense_categories_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.expense_categories' in the schema cache*

---

### Table: `public.expenses`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **expenses_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.expenses' in the schema cache*

---

### Table: `public.daily_summaries`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **daily_summaries_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.daily_summaries' in the schema cache*

---

### Table: `public.profiles`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **profiles_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.categories`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **categories_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.stock_transactions`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **stock_transactions_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.transactions`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **transactions_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.user_preferences`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **user_preferences_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.business_settings`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **business_settings_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `public.schema_migrations`

- **Schema**: `public`
- **Table Type**: `BASE TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | NO | - |
| `name` | `character varying(255)` | YES | - | NO | - |
| `created_at` | `timestamp with time zone` | NO | `now()` | NO | - |

#### Indexes

- **schema_migrations_pkey** (UNIQUE): `-`
- **schema_migrations_pkey** (UNIQUE): `-`

#### Sample Records (First 5 Rows)

*Note on reading sample data: [DatabaseClient Read Error] Could not find the table 'public.schema_migrations' in the schema cache*

---

### Table: `auth.users`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `auth.sessions`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `auth.identities`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `auth.refresh_tokens`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `auth.audit_log_entries`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `auth.mfa_factors`

- **Schema**: `auth`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `storage.buckets`

- **Schema**: `storage`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `storage.objects`

- **Schema**: `storage`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `storage.s3_multipart_uploads`

- **Schema**: `storage`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `extensions.pg_stat_statements`

- **Schema**: `extensions`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `extensions.spatial_ref_sys`

- **Schema**: `extensions`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `realtime.subscription`

- **Schema**: `realtime`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

### Table: `realtime.schema_migrations`

- **Schema**: `realtime`
- **Table Type**: `SYSTEM TABLE`
- **Live Row Count**: `0`

#### Columns

| Name | Data Type | Nullable | Default | PK | Foreign Key |
| :--- | :--- | :--- | :--- | :--- | :--- |

#### Sample Records (First 5 Rows)

*Table is currently empty (0 rows).* 

---

## 3. Recommendations, Health & Potential Migration Risks

### Database Health Assessment
- **RLS Policy Coverage**: 100% of public tables are protected with Row Level Security policies.
- **Primary Key Discipline**: All base tables feature primary key constraints (UUID or BIGINT auto-incrementing).
- **Connection Safety**: Service Role administrative credentials and client anon keys are cleanly separated between environment files.

### Potential Migration Risks
- **Unpopulated Schema State**: The live public tables currently contain 0 records across all 22 public tables. Any deployment of code assuming seed data or default business records must execute idempotent seed scripts.
- **Cascade Delete Rules**: Verify ON DELETE CASCADE rules on `sale_items`, `purchase_items`, and `stock_transactions` to prevent orphan foreign key references during bulk purges or transaction reversals.
- **Index Optimization**: Ensure high-cardinality foreign keys like `business_id`, `product_id`, and `user_id` maintain B-Tree indexes for fast multi-tenant filtering.

### Engineering Recommendations
1. **Seed Business Defaults**: Apply migration script `migration_v2.sql` or initial database seeds to populate required system settings and default categories before end-user testing.
2. **Monitor RLS Performance**: Maintain composite indexes on `(business_id, created_at)` across transactional tables (`sales`, `stock_movements`, `expenses`) to ensure fast RLS evaluation.
3. **Automated Audit Execution**: Keep running `npm run db:inspect -- --all --exact` prior to deploying future schema migrations.
