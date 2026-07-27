-- =============================================================================
-- WHAT YOU NEED? (WYN) - PRODUCTION DATABASE SCHEMA V1.0
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- Package: Complete Consolidated Production DDL Package (DB-2 + DB-3)
-- Architecture: Multi-tenant, UUID PKs, Soft Delete, Append-only Ledger
-- =============================================================================

-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SECTION 2: TABLES & CORE STRUCTURES (IN DEPENDENCY ORDER)
-- =============================================================================

-- 1. BUSINESSES (TENANTS)
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

-- 2. PROFILES (USER ACCOUNTS)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 3. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 4. PRODUCT UNITS
CREATE TABLE IF NOT EXISTS product_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NULL REFERENCES product_categories(id) ON DELETE SET NULL,
  unit_id UUID NULL REFERENCES product_units(id) ON DELETE SET NULL,
  sku VARCHAR(100) NOT NULL,
  barcode VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  current_stock NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  min_stock_alert NUMERIC(12,3) NOT NULL DEFAULT 5.000,
  image_url TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 6. STOCK MOVEMENTS (IMMUTABLE LEDGER)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type VARCHAR(50) NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  balance_before NUMERIC(12,3) NOT NULL,
  balance_after NUMERIC(12,3) NOT NULL,
  unit_cost NUMERIC(12,2) NULL,
  total_cost NUMERIC(12,2) NULL,
  reference_type VARCHAR(50) NULL,
  reference_id UUID NULL,
  idempotency_key VARCHAR(100) NULL,
  reason TEXT NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- 7. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 8. SALES
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
  sale_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  due_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- 9. SALE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sale_id UUID NULL REFERENCES sales(id) ON DELETE SET NULL,
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

-- 11. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 12. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 13. PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_ordered NUMERIC(12,3) NOT NULL,
  quantity_received NUMERIC(12,3) NOT NULL DEFAULT 0.000,
  unit_cost NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. EXPENSE CATEGORIES
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 15. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- 16. DAILY SUMMARIES
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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

-- =============================================================================
-- SECTION 3: CHECK CONSTRAINTS
-- =============================================================================

-- Businesses
ALTER TABLE businesses ADD CONSTRAINT chk_businesses_currency 
  CHECK (currency IN ('KHR', 'USD'));

-- Profiles
ALTER TABLE profiles ADD CONSTRAINT chk_profiles_role 
  CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'staff'));

-- Products
ALTER TABLE products ADD CONSTRAINT chk_products_current_stock CHECK (current_stock >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_cost_price CHECK (cost_price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_selling_price CHECK (selling_price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_min_stock_alert CHECK (min_stock_alert >= 0);

-- Stock Movements
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_qty CHECK (quantity > 0);
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_balance_before CHECK (balance_before >= 0);
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_balance_after CHECK (balance_after >= 0);
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_type 
  CHECK (movement_type IN ('in', 'sale', 'adjustment', 'damage', 'expired', 'initial'));

-- Customers
ALTER TABLE customers ADD CONSTRAINT chk_customers_credit_limit CHECK (credit_limit >= 0);

-- Sales
ALTER TABLE sales ADD CONSTRAINT chk_sales_subtotal CHECK (subtotal_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_discount CHECK (discount_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_tax CHECK (tax_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_total CHECK (total_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_paid CHECK (paid_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_due CHECK (due_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT chk_sales_status 
  CHECK (status IN ('draft', 'completed', 'cancelled', 'refunded'));
ALTER TABLE sales ADD CONSTRAINT chk_sales_payment_status 
  CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue'));

-- Sale Items
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_qty CHECK (quantity > 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_unit_price CHECK (unit_price >= 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_unit_cost CHECK (unit_cost >= 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_discount CHECK (discount_amount >= 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_subtotal CHECK (subtotal >= 0);

-- Payments
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount > 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_exchange_rate CHECK (exchange_rate > 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_currency CHECK (currency IN ('KHR', 'USD'));
ALTER TABLE payments ADD CONSTRAINT chk_payments_method 
  CHECK (payment_method IN ('cash', 'khqr', 'bank_transfer', 'card', 'credit'));
ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
  CHECK (status IN ('completed', 'voided', 'refunded'));

-- Purchase Orders
ALTER TABLE purchase_orders ADD CONSTRAINT chk_purchase_orders_total CHECK (total_amount >= 0);
ALTER TABLE purchase_orders ADD CONSTRAINT chk_purchase_orders_paid CHECK (paid_amount >= 0);
ALTER TABLE purchase_orders ADD CONSTRAINT chk_purchase_orders_due CHECK (due_amount >= 0);
ALTER TABLE purchase_orders ADD CONSTRAINT chk_purchase_orders_status 
  CHECK (status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled'));
ALTER TABLE purchase_orders ADD CONSTRAINT chk_purchase_orders_payment_status 
  CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Purchase Items
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_qty_ordered CHECK (quantity_ordered > 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_qty_received CHECK (quantity_received >= 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_unit_cost CHECK (unit_cost >= 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_subtotal CHECK (subtotal >= 0);

-- Expenses
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_amount CHECK (amount > 0);
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_currency CHECK (currency IN ('KHR', 'USD'));
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_method 
  CHECK (payment_method IN ('cash', 'khqr', 'bank_transfer', 'card', 'credit'));

-- Daily Summaries
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_sales_amt CHECK (total_sales_amount >= 0);
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_sales_cnt CHECK (total_sales_count >= 0);
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_cost_amt CHECK (total_cost_amount >= 0);
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_expenses_amt CHECK (total_expenses_amount >= 0);
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_stock_in CHECK (total_stock_in_qty >= 0);
ALTER TABLE daily_summaries ADD CONSTRAINT chk_daily_summaries_stock_out CHECK (total_stock_out_qty >= 0);

-- =============================================================================
-- SECTION 4: UNIQUE CONSTRAINTS
-- =============================================================================

ALTER TABLE businesses ADD CONSTRAINT uq_businesses_code UNIQUE (code);
ALTER TABLE product_categories ADD CONSTRAINT uq_product_categories_biz_code UNIQUE (business_id, code);
ALTER TABLE product_units ADD CONSTRAINT uq_product_units_biz_code UNIQUE (business_id, code);
ALTER TABLE products ADD CONSTRAINT uq_products_biz_sku UNIQUE (business_id, sku);

CREATE UNIQUE INDEX uq_products_biz_barcode ON products (business_id, barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX uq_stock_movements_idempotency ON stock_movements (idempotency_key) WHERE idempotency_key IS NOT NULL;

ALTER TABLE sales ADD CONSTRAINT uq_sales_biz_sale_number UNIQUE (business_id, sale_number);
ALTER TABLE payments ADD CONSTRAINT uq_payments_biz_payment_number UNIQUE (business_id, payment_number);
ALTER TABLE purchase_orders ADD CONSTRAINT uq_purchase_orders_biz_po_number UNIQUE (business_id, po_number);
ALTER TABLE expense_categories ADD CONSTRAINT uq_expense_categories_biz_code UNIQUE (business_id, code);
ALTER TABLE expenses ADD CONSTRAINT uq_expenses_biz_expense_number UNIQUE (business_id, expense_number);
ALTER TABLE daily_summaries ADD CONSTRAINT uq_daily_summaries_biz_date UNIQUE (business_id, summary_date);

-- =============================================================================
-- SECTION 5: PERFORMANCE & SEARCH INDEXES
-- =============================================================================

-- Businesses & Profiles
CREATE INDEX idx_profiles_business_id ON profiles(business_id);
CREATE INDEX idx_profiles_role ON profiles(business_id, role);

-- Product Catalog
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_unit_id ON products(unit_id);
CREATE INDEX idx_products_search ON products(business_id, name, sku);
CREATE INDEX idx_products_low_stock ON products(business_id, current_stock, min_stock_alert) 
  WHERE is_archived = false AND deleted_at IS NULL;

-- Stock Movements Ledger
CREATE INDEX idx_stock_movements_biz_product ON stock_movements(business_id, product_id, created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(business_id, movement_type, created_at DESC);
CREATE INDEX idx_stock_movements_ref ON stock_movements(reference_type, reference_id);

-- Sales & Items
CREATE INDEX idx_sales_biz_created ON sales(business_id, created_at DESC);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_status ON sales(business_id, status, payment_status);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- Payments
CREATE INDEX idx_payments_biz_created ON payments(business_id, paid_at DESC);
CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);

-- Purchasing
CREATE INDEX idx_suppliers_biz ON suppliers(business_id);
CREATE INDEX idx_purchase_orders_biz_status ON purchase_orders(business_id, status, created_at DESC);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_items_po ON purchase_items(purchase_order_id);

-- Expenses
CREATE INDEX idx_expenses_biz_date ON expenses(business_id, incurred_at DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);

-- Reporting
CREATE INDEX idx_daily_summaries_biz_date ON daily_summaries(business_id, summary_date DESC);

-- =============================================================================
-- END OF FILE
-- =============================================================================
