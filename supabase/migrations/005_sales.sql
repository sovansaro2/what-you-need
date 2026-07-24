-- 005_sales.sql

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_profit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    note TEXT,
    sale_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT sales_total_amount_check CHECK (total_amount >= 0)
);

DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT sale_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT sale_items_unit_cost_price_check CHECK (unit_cost_price >= 0),
    CONSTRAINT sale_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT sale_items_subtotal_check CHECK (subtotal >= 0)
);

DROP TRIGGER IF EXISTS update_sale_items_updated_at ON public.sale_items;
CREATE TRIGGER update_sale_items_updated_at
    BEFORE UPDATE ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
