-- 004_inventory.sql

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    selling_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    minimum_stock INTEGER DEFAULT 0 NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT products_cost_price_check CHECK (cost_price >= 0),
    CONSTRAINT products_selling_price_check CHECK (selling_price >= 0),
    CONSTRAINT products_stock_quantity_check CHECK (stock_quantity >= 0),
    CONSTRAINT products_minimum_stock_check CHECK (minimum_stock >= 0)
);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
