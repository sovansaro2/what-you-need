-- =============================================================================
-- WHAT YOU NEED? (WYN) - STOCK MOVEMENT ENGINE RPC MIGRATION 009
-- File: supabase/migrations/009_process_stock_movement_rpc.sql
-- Description: Transactional PostgreSQL RPC for atomic stock movements & inventory quantity updates
-- =============================================================================

-- 1. Ensure stock_movements table check constraint allows supported movement types
ALTER TABLE public.stock_movements DROP CONSTRAINT IF EXISTS chk_stock_movements_type;
ALTER TABLE public.stock_movements ADD CONSTRAINT chk_stock_movements_type
  CHECK (movement_type IN ('in', 'out', 'sale', 'adjustment', 'damage', 'expired', 'initial', 'stock_in', 'stock_out'));

-- 2. Create transactional RPC function: process_stock_movement
CREATE OR REPLACE FUNCTION public.process_stock_movement(
    p_business_id UUID,
    p_product_id UUID,
    p_movement_type VARCHAR(50),
    p_quantity NUMERIC(12,3),
    p_reason TEXT DEFAULT 'Stock movement record',
    p_reference_type VARCHAR(50) DEFAULT 'manual',
    p_reference_id UUID DEFAULT NULL,
    p_idempotency_key VARCHAR(100) DEFAULT NULL,
    p_unit_cost NUMERIC(12,2) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_movement_id UUID;
    v_clean_type TEXT;
    v_db_type TEXT;
    v_balance_before NUMERIC(12,3);
    v_balance_after NUMERIC(12,3);
    v_delta NUMERIC(12,3);
    v_qty NUMERIC(12,3);
    v_existing_movement RECORD;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Step 1: Idempotency Protection Check
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
        SELECT * INTO v_existing_movement
        FROM public.stock_movements
        WHERE idempotency_key = TRIM(p_idempotency_key)
        LIMIT 1;

        IF FOUND THEN
            SELECT * INTO v_product
            FROM public.products
            WHERE id = v_existing_movement.product_id;

            RETURN jsonb_build_object(
                'success', true,
                'is_duplicate', true,
                'movement_id', v_existing_movement.id,
                'product_id', v_existing_movement.product_id,
                'movement_type', v_existing_movement.movement_type,
                'quantity', v_existing_movement.quantity,
                'balance_before', v_existing_movement.balance_before,
                'balance_after', v_existing_movement.balance_after,
                'current_stock', COALESCE(v_product.current_stock, 0),
                'product_name', COALESCE(v_product.name, ''),
                'created_at', v_existing_movement.created_at
            );
        END IF;
    END IF;

    -- Step 2: Validate Quantity
    IF p_quantity IS NULL OR p_quantity = 0 THEN
        RAISE EXCEPTION 'បរិមាណត្រូវតែធំជាង ០ (Quantity must be greater than zero)';
    END IF;

    -- Step 3: Normalize & Validate Movement Type
    v_clean_type := LOWER(TRIM(p_movement_type));

    IF v_clean_type IN ('in', 'stock_in') THEN
        v_db_type := 'in';
        v_qty := ABS(p_quantity);
        v_delta := v_qty;
    ELSIF v_clean_type IN ('out', 'stock_out', 'sale', 'damage', 'expired') THEN
        v_db_type := COALESCE(NULLIF(v_clean_type, 'stock_out'), 'out');
        v_qty := ABS(p_quantity);
        v_delta := -v_qty;
    ELSIF v_clean_type IN ('adjustment') THEN
        v_db_type := 'adjustment';
        v_delta := p_quantity; -- delta direct
        v_qty := ABS(p_quantity);
    ELSE
        RAISE EXCEPTION 'ប្រភេទបំរាស់ប្តូរមិនត្រឹមត្រូវ: % (Invalid movement type)', p_movement_type;
    END IF;

    -- Step 4: Validate Business Ownership & Product Existence (Lock row with FOR UPDATE)
    SELECT * INTO v_product
    FROM public.products
    WHERE id = p_product_id
      AND (p_business_id IS NULL OR business_id IS NULL OR business_id = p_business_id)
      AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'រកមិនឃើញទំនិញ ឬគ្មានសិទ្ធិ (Product not found or access denied)';
    END IF;

    IF v_product.is_archived THEN
        RAISE EXCEPTION 'ទំនិញត្រូវបានប័ណ្ណសាររួចហើយ (Product is archived)';
    END IF;

    -- Step 5: Read Current Stock & Calculate Balances
    v_balance_before := COALESCE(v_product.current_stock, 0);
    v_balance_after := v_balance_before + v_delta;

    -- Step 6: Negative Stock Prevention
    IF v_balance_after < 0 THEN
        RAISE EXCEPTION 'ស្តុកមិនគ្រប់គ្រាន់ទេ (Insufficient stock: current stock is %, change requested is %)', v_balance_before, v_delta;
    END IF;

    v_created_at := NOW();

    -- Step 7: Insert into stock_movements ledger
    INSERT INTO public.stock_movements (
        business_id,
        product_id,
        movement_type,
        quantity,
        balance_before,
        balance_after,
        unit_cost,
        total_cost,
        reference_type,
        reference_id,
        idempotency_key,
        reason,
        created_at
    ) VALUES (
        p_business_id,
        p_product_id,
        v_db_type,
        v_qty,
        v_balance_before,
        v_balance_after,
        p_unit_cost,
        CASE WHEN p_unit_cost IS NOT NULL THEN (p_unit_cost * v_qty) ELSE NULL END,
        COALESCE(p_reference_type, 'manual'),
        p_reference_id,
        p_idempotency_key,
        COALESCE(p_reason, 'Stock movement record'),
        v_created_at
    )
    RETURNING id INTO v_movement_id;

    -- Step 8: Update products.current_stock
    UPDATE public.products
    SET current_stock = v_balance_after,
        updated_at = v_created_at
    WHERE id = p_product_id;

    -- Step 9: Return structured result
    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'movement_id', v_movement_id,
        'product_id', p_product_id,
        'product_name', v_product.name,
        'movement_type', v_db_type,
        'quantity', v_qty,
        'delta', v_delta,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'current_stock', v_balance_after,
        'created_at', v_created_at
    );
END;
$$;
