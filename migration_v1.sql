-- =============================================================================
-- WHAT YOU NEED? (WYN) - SAFE MIGRATION SCRIPT V1.0 (CORRECTED)
-- File: migration_v1.sql
-- Description: Non-destructive, idempotent migration script upgrading existing
--              Supabase schema to Production Database Schema V1.0.
-- Target: PostgreSQL 15+ / Supabase
-- =============================================================================

-- STEP 1: BEGIN TRANSACTION
BEGIN;

-- STEP 2: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP 3: CREATE NEW PRODUCTION TABLES (IF NOT EXISTS)

-- 1. Businesses (Tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  tax_id VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  currency VARCHAR(10) NOT NULL DEFAULT 'KHR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 2. Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(30),
  icon VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 3. Product Units
CREATE TABLE IF NOT EXISTS product_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 4. Stock Movements (Immutable Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  movement_type VARCHAR(50) NULL,
  quantity NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  balance_before NUMERIC(12,3) NULL,
  balance_after NUMERIC(12,3) NULL,
  unit_cost NUMERIC(12,2) NULL,
  total_cost NUMERIC(12,2) NULL,
  reference_type VARCHAR(50) NULL,
  reference_id UUID NULL,
  idempotency_key VARCHAR(100) NULL,
  reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- 5. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sale_id UUID NULL,
  customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
  payment_number VARCHAR(100) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'KHR',
  exchange_rate NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
  reference_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- 7. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_code VARCHAR(50),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 8. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  po_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  due_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  expected_delivery_date DATE NULL,
  received_at TIMESTAMPTZ NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 9. Purchase Items
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity_ordered NUMERIC(12,3) NOT NULL,
  quantity_received NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  unit_cost NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 11. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  expense_number VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'KHR',
  payment_method VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(255),
  receipt_url TEXT,
  notes TEXT,
  incurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 12. Daily Summaries
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_sales_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_sales_count INT NOT NULL DEFAULT 0,
  total_cost_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_gross_profit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_expenses_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_net_profit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_stock_in_qty NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  total_stock_out_qty NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- STEP 4: UPGRADE EXISTING TABLES (ADD MISSING COLUMNS NON-DESTRUCTIVELY)

-- Upgrade Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE RESTRICT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Upgrade Product Categories (Existing in schema.sql)
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS color VARCHAR(30);
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Upgrade Product Units (Existing in schema.sql)
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE product_units ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Upgrade Products (Existing in schema.sql)
ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12,2) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock NUMERIC(12,3) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_alert NUMERIC(12,3) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Upgrade Stock Movements (Existing in schema.sql)
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS movement_type VARCHAR(50) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS balance_before NUMERIC(12,3) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS balance_after NUMERIC(12,3) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,2) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12,2) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS reason TEXT NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS created_by UUID NULL;

-- Upgrade Sales (Existing in schema.sql)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_number VARCHAR(100) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'paid';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12,2) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2) NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS due_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE sales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by UUID NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_by UUID NULL;

-- Upgrade Sale Items (Existing in schema.sql)
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NULL;


-- STEP 5: SAFE DATA BACKFILL (CONDITIONAL VIA DYNAMIC SQL)

-- 5.1 Default Business
INSERT INTO businesses (id, name, code, currency, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Business', 'DEFAULT', 'KHR', true)
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_default_biz_id UUID;
  v_col_exists BOOLEAN;
BEGIN
  SELECT id INTO v_default_biz_id FROM businesses WHERE code = 'DEFAULT' LIMIT 1;
  IF v_default_biz_id IS NULL THEN
    SELECT id INTO v_default_biz_id FROM businesses LIMIT 1;
  END IF;

  -- Backfill business_id across core tables
  UPDATE profiles SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE product_categories SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE product_units SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE products SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE stock_movements SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE sales SET business_id = v_default_biz_id WHERE business_id IS NULL;
  UPDATE sale_items SET business_id = v_default_biz_id WHERE business_id IS NULL;

  -- Backfill Products current_stock & min_stock_alert & selling_price dynamically
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE products SET current_stock = COALESCE(current_stock, stock_quantity, 0.000) WHERE current_stock IS NULL';
  ELSE
    EXECUTE 'UPDATE products SET current_stock = COALESCE(current_stock, 0.000) WHERE current_stock IS NULL';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'minimum_stock'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE products SET min_stock_alert = COALESCE(min_stock_alert, minimum_stock, 5.000) WHERE min_stock_alert IS NULL';
  ELSE
    EXECUTE 'UPDATE products SET min_stock_alert = COALESCE(min_stock_alert, 5.000) WHERE min_stock_alert IS NULL';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE products SET selling_price = COALESCE(selling_price, price, 0.00) WHERE selling_price IS NULL';
  ELSE
    EXECUTE 'UPDATE products SET selling_price = COALESCE(selling_price, 0.00) WHERE selling_price IS NULL';
  END IF;

  -- Backfill Stock Movements movement_type & reason dynamically
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_movements' AND column_name = 'type'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE stock_movements SET movement_type = COALESCE(movement_type, type, ''in'') WHERE movement_type IS NULL';
  ELSE
    EXECUTE 'UPDATE stock_movements SET movement_type = COALESCE(movement_type, ''in'') WHERE movement_type IS NULL';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_movements' AND column_name = 'notes'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE stock_movements SET reason = COALESCE(reason, notes, ''Stock movement record'') WHERE reason IS NULL';
  ELSE
    EXECUTE 'UPDATE stock_movements SET reason = COALESCE(reason, ''Stock movement record'') WHERE reason IS NULL';
  END IF;

  EXECUTE 'UPDATE stock_movements SET balance_before = COALESCE(balance_before, 0.000) WHERE balance_before IS NULL';
  EXECUTE 'UPDATE stock_movements SET balance_after = COALESCE(balance_after, quantity, 0.000) WHERE balance_after IS NULL';

  -- Backfill Sales sale_number & monetary fields dynamically
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'invoice_number'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE sales SET sale_number = COALESCE(sale_number, invoice_number, ''SALE-'' || SUBSTRING(id::text, 1, 8)) WHERE sale_number IS NULL';
  ELSE
    EXECUTE 'UPDATE sales SET sale_number = COALESCE(sale_number, ''SALE-'' || SUBSTRING(id::text, 1, 8)) WHERE sale_number IS NULL';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'subtotal'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    EXECUTE 'UPDATE sales SET subtotal_amount = COALESCE(subtotal_amount, subtotal, 0.00) WHERE subtotal_amount IS NULL';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'total'
  ) THEN
    EXECUTE 'UPDATE sales SET subtotal_amount = COALESCE(subtotal_amount, total, 0.00) WHERE subtotal_amount IS NULL';
  ELSE
    EXECUTE 'UPDATE sales SET subtotal_amount = COALESCE(subtotal_amount, 0.00) WHERE subtotal_amount IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'discount'
  ) THEN
    EXECUTE 'UPDATE sales SET discount_amount = COALESCE(discount_amount, discount, 0.00) WHERE discount_amount IS NULL';
  ELSE
    EXECUTE 'UPDATE sales SET discount_amount = COALESCE(discount_amount, 0.00) WHERE discount_amount IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'tax'
  ) THEN
    EXECUTE 'UPDATE sales SET tax_amount = COALESCE(tax_amount, tax, 0.00) WHERE tax_amount IS NULL';
  ELSE
    EXECUTE 'UPDATE sales SET tax_amount = COALESCE(tax_amount, 0.00) WHERE tax_amount IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'total'
  ) THEN
    EXECUTE 'UPDATE sales SET total_amount = COALESCE(total_amount, total, 0.00) WHERE total_amount IS NULL';
    EXECUTE 'UPDATE sales SET paid_amount = COALESCE(paid_amount, total, 0.00) WHERE paid_amount IS NULL';
  ELSE
    EXECUTE 'UPDATE sales SET total_amount = COALESCE(total_amount, 0.00) WHERE total_amount IS NULL';
    EXECUTE 'UPDATE sales SET paid_amount = COALESCE(paid_amount, 0.00) WHERE paid_amount IS NULL';
  END IF;

  EXECUTE 'UPDATE sales SET sold_at = COALESCE(sold_at, created_at) WHERE sold_at IS NULL';

  -- Backfill Sale Items subtotal dynamically
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'total_price'
  ) THEN
    EXECUTE 'UPDATE sale_items SET subtotal = COALESCE(subtotal, total_price, quantity * unit_price) WHERE subtotal IS NULL';
  ELSE
    EXECUTE 'UPDATE sale_items SET subtotal = COALESCE(subtotal, quantity * unit_price) WHERE subtotal IS NULL';
  END IF;
END $$;


-- STEP 6: GENERATE INITIAL LEDGER FOR EXISTING PRODUCTS (IDEMPOTENT)
INSERT INTO stock_movements (
  business_id,
  product_id,
  movement_type,
  quantity,
  balance_before,
  balance_after,
  unit_cost,
  total_cost,
  reference_type,
  idempotency_key,
  reason,
  created_at
)
SELECT 
  p.business_id,
  p.id AS product_id,
  'initial' AS movement_type,
  GREATEST(COALESCE(p.current_stock, 0), 0) AS quantity,
  0.000 AS balance_before,
  GREATEST(COALESCE(p.current_stock, 0), 0) AS balance_after,
  COALESCE(p.cost_price, 0.00) AS unit_cost,
  GREATEST(COALESCE(p.current_stock, 0), 0) * COALESCE(p.cost_price, 0.00) AS total_cost,
  'migration' AS reference_type,
  'init_prod_' || p.id::text AS idempotency_key,
  'Initial migration stock balance adjustment' AS reason,
  p.created_at
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM stock_movements sm WHERE sm.product_id = p.id AND sm.movement_type = 'initial'
)
ON CONFLICT DO NOTHING;


-- STEP 7: SET DEFAULT NOT NULL CONSTRAINTS FOR MANDATORY MIGRATED COLUMNS
ALTER TABLE products ALTER COLUMN current_stock SET DEFAULT 0.000;
ALTER TABLE products ALTER COLUMN current_stock SET NOT NULL;
ALTER TABLE products ALTER COLUMN min_stock_alert SET DEFAULT 5.000;
ALTER TABLE products ALTER COLUMN min_stock_alert SET NOT NULL;
ALTER TABLE products ALTER COLUMN selling_price SET DEFAULT 0.00;
ALTER TABLE products ALTER COLUMN selling_price SET NOT NULL;

ALTER TABLE stock_movements ALTER COLUMN movement_type SET DEFAULT 'in';
ALTER TABLE stock_movements ALTER COLUMN movement_type SET NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN balance_before SET DEFAULT 0.000;
ALTER TABLE stock_movements ALTER COLUMN balance_before SET NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN balance_after SET DEFAULT 0.000;
ALTER TABLE stock_movements ALTER COLUMN balance_after SET NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN reason SET DEFAULT 'Stock movement record';
ALTER TABLE stock_movements ALTER COLUMN reason SET NOT NULL;

ALTER TABLE sales ALTER COLUMN sale_number SET NOT NULL;
ALTER TABLE sales ALTER COLUMN subtotal_amount SET DEFAULT 0.00;
ALTER TABLE sales ALTER COLUMN subtotal_amount SET NOT NULL;
ALTER TABLE sales ALTER COLUMN discount_amount SET DEFAULT 0.00;
ALTER TABLE sales ALTER COLUMN discount_amount SET NOT NULL;
ALTER TABLE sales ALTER COLUMN tax_amount SET DEFAULT 0.00;
ALTER TABLE sales ALTER COLUMN tax_amount SET NOT NULL;
ALTER TABLE sales ALTER COLUMN total_amount SET DEFAULT 0.00;
ALTER TABLE sales ALTER COLUMN total_amount SET NOT NULL;
ALTER TABLE sales ALTER COLUMN paid_amount SET DEFAULT 0.00;
ALTER TABLE sales ALTER COLUMN paid_amount SET NOT NULL;
ALTER TABLE sales ALTER COLUMN sold_at SET DEFAULT now();
ALTER TABLE sales ALTER COLUMN sold_at SET NOT NULL;

ALTER TABLE sale_items ALTER COLUMN subtotal SET NOT NULL;


-- STEP 8: FOREIGN KEYS (PRODUCT & SALE ITEM REFERENCES)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_stock_movements_product'
  ) THEN
    ALTER TABLE stock_movements 
      ADD CONSTRAINT fk_stock_movements_product 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_payments_sale'
  ) THEN
    ALTER TABLE payments 
      ADD CONSTRAINT fk_payments_sale 
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_purchase_items_product'
  ) THEN
    ALTER TABLE purchase_items 
      ADD CONSTRAINT fk_purchase_items_product 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
  END IF;
END $$;


-- STEP 9: CHECK CONSTRAINTS (SAFE CREATION VIA DO BLOCKS)

DO $$
BEGIN
  -- Products
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_current_stock') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_current_stock CHECK (current_stock >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_cost_price') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_cost_price CHECK (cost_price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_selling_price') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_selling_price CHECK (selling_price >= 0);
  END IF;

  -- Stock Movements
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_movements_qty') THEN
    ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_qty CHECK (quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_movements_type') THEN
    ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_type 
      CHECK (movement_type IN ('in', 'sale', 'adjustment', 'damage', 'expired', 'initial'));
  END IF;

  -- Sales
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_sales_total') THEN
    ALTER TABLE sales ADD CONSTRAINT chk_sales_total CHECK (total_amount >= 0);
  END IF;
END $$;


-- STEP 10: UNIQUE CONSTRAINTS

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_businesses_code') THEN
    ALTER TABLE businesses ADD CONSTRAINT uq_businesses_code UNIQUE (code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_product_categories_biz_code') THEN
    ALTER TABLE product_categories ADD CONSTRAINT uq_product_categories_biz_code UNIQUE (business_id, code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_product_units_biz_code') THEN
    ALTER TABLE product_units ADD CONSTRAINT uq_product_units_biz_code UNIQUE (business_id, code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_products_biz_sku') THEN
    ALTER TABLE products ADD CONSTRAINT uq_products_biz_sku UNIQUE (business_id, sku);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_products_biz_barcode ON products (business_id, barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_stock_movements_idempotency ON stock_movements (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_sales_biz_sale_number ON sales (business_id, sale_number) WHERE sale_number IS NOT NULL;


-- STEP 11: INDEXES FOR PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_unit_id ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_products_search ON products(business_id, name, sku);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(business_id, current_stock, min_stock_alert) 
  WHERE is_archived = false AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stock_movements_biz_product ON stock_movements(business_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(business_id, movement_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ref ON stock_movements(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_sales_biz_created ON sales(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_biz_created ON payments(business_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_biz ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_biz_status ON purchase_orders(business_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_biz_date ON expenses(business_id, incurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_biz_date ON daily_summaries(business_id, summary_date DESC);


-- STEP 12: MIGRATION METADATA LOGGING

CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  version VARCHAR(50) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_migrations (migration_name, version)
VALUES ('migration_v1', '1.0.0')
ON CONFLICT (migration_name) DO NOTHING;


-- STEP 13: COMMIT TRANSACTION
COMMIT;

-- =============================================================================
-- END OF CORRECTED MIGRATION SCRIPT
-- =============================================================================
