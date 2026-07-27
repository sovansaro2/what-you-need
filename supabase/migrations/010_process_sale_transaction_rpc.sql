-- =============================================================================
-- WHAT YOU NEED? (WYN) - SALES ENGINE RPC MIGRATION 010
-- File: supabase/migrations/010_process_sale_transaction_rpc.sql
-- Description: Transactional PostgreSQL RPC for atomic sale execution, stock reduction, & payment accounting metadata
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_sale_transaction(
    p_business_id UUID,
    p_customer_id UUID DEFAULT NULL,
    p_customer_name VARCHAR(255) DEFAULT 'អតិថិជនទូទៅ (Walk-in)',
    p_payment_method VARCHAR(50) DEFAULT 'cash',
    p_payment_status VARCHAR(50) DEFAULT 'paid',
    p_subtotal NUMERIC(12,2) DEFAULT 0,
    p_discount_amount NUMERIC(12,2) DEFAULT 0,
    p_tax_amount NUMERIC(12,2) DEFAULT 0,
    p_total_amount NUMERIC(12,2) DEFAULT 0,
    p_paid_amount NUMERIC(12,2) DEFAULT 0,
    p_due_amount NUMERIC(12,2) DEFAULT 0,
    p_change_amount NUMERIC(12,2) DEFAULT 0,
    p_notes TEXT DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_idempotency_key VARCHAR(100) DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id UUID;
    v_sale_number TEXT;
    v_item JSONB;
    v_product_id UUID;
    v_qty NUMERIC(12,3);
    v_unit_price NUMERIC(12,2);
    v_item_discount NUMERIC(12,2);
    v_item_subtotal NUMERIC(12,2);
    v_item_total NUMERIC(12,2);
    v_product RECORD;
    v_balance_before NUMERIC(12,3);
    v_balance_after NUMERIC(12,3);
    v_sold_at TIMESTAMPTZ := NOW();
    v_seq_num INT;
BEGIN
    -- Step 1: Validate items array
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'កន្ត្រកទំនិញទទេ សូមជ្រើសរើសទំនិញជាមុនសិន (Cart is empty)';
    END IF;

    -- Step 2: Generate unique sale_number per business
    v_seq_num := FLOOR(100000 + random() * 900000)::INT;
    v_sale_number := 'INV-' || TO_CHAR(v_sold_at, 'YYYYMMDD') || '-' || v_seq_num;

    -- Step 3: Insert master sale record
    INSERT INTO public.sales (
        business_id,
        customer_id,
        sale_number,
        status,
        payment_status,
        payment_method,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        paid_amount,
        due_amount,
        change_amount,
        notes,
        sold_at,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        p_business_id,
        p_customer_id,
        v_sale_number,
        'completed',
        COALESCE(p_payment_status, 'paid'),
        COALESCE(p_payment_method, 'cash'),
        COALESCE(p_subtotal, 0),
        COALESCE(p_discount_amount, 0),
        COALESCE(p_tax_amount, 0),
        COALESCE(p_total_amount, 0),
        COALESCE(p_paid_amount, 0),
        COALESCE(p_due_amount, 0),
        COALESCE(p_change_amount, 0),
        p_notes,
        v_sold_at,
        p_created_by,
        v_sold_at,
        v_sold_at
    )
    RETURNING id INTO v_sale_id;

    -- Step 4: Process line items & stock movements atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := ABS((v_item->>'quantity')::NUMERIC);
        v_unit_price := (v_item->>'unit_price')::NUMERIC;
        v_item_discount := COALESCE((v_item->>'discount_amount')::NUMERIC, 0);

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'បរិមាណទំនិញត្រូវតែធំជាង ០ (Quantity must be greater than 0)';
        END IF;

        -- Lock product row with FOR UPDATE
        SELECT * INTO v_product
        FROM public.products
        WHERE id = v_product_id
          AND (p_business_id IS NULL OR business_id IS NULL OR business_id = p_business_id)
          AND deleted_at IS NULL
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'រកមិនឃើញទំនិញ ID: % (Product not found)', v_product_id;
        END IF;

        v_balance_before := COALESCE(v_product.current_stock, 0);
        v_balance_after := v_balance_before - v_qty;

        IF v_balance_after < 0 THEN
            RAISE EXCEPTION 'ស្តុកមិនគ្រប់គ្រាន់ទេសម្រាប់ទំនិញ % (Current stock: %, requested: %)', v_product.name, v_balance_before, v_qty;
        END IF;

        v_item_subtotal := v_qty * v_unit_price;
        v_item_total := GREATEST(0, v_item_subtotal - v_item_discount);

        -- Insert sale item line
        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount_amount,
            subtotal,
            total,
            created_at
        ) VALUES (
            v_sale_id,
            v_product_id,
            v_product.name,
            v_qty,
            v_unit_price,
            v_item_discount,
            v_item_subtotal,
            v_item_total,
            v_sold_at
        );

        -- Record stock movement ledger
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
            v_product_id,
            'sale',
            v_qty,
            v_balance_before,
            v_balance_after,
            v_product.cost_price,
            CASE WHEN v_product.cost_price IS NOT NULL THEN (v_product.cost_price * v_qty) ELSE NULL END,
            'sale',
            v_sale_id,
            p_idempotency_key,
            'លក់ចេញ (POS Sale: ' || v_sale_number || ')',
            v_sold_at
        );

        -- Update product inventory stock
        UPDATE public.products
        SET current_stock = v_balance_after,
            updated_at = v_sold_at
        WHERE id = v_product_id;
    END LOOP;

    -- Step 5: Insert accounting metadata payment record if paid_amount > 0
    IF COALESCE(p_paid_amount, 0) > 0 THEN
        INSERT INTO public.payments (
            business_id,
            sale_id,
            amount,
            payment_method,
            payment_date,
            reference_number,
            notes,
            created_at
        ) VALUES (
            p_business_id,
            v_sale_id,
            p_paid_amount,
            COALESCE(p_payment_method, 'cash'),
            v_sold_at,
            v_sale_number,
            'ការទូទាត់ប្រាក់ដើមគ្រា (POS Sale Payment)',
            v_sold_at
        );
    END IF;

    -- Step 6: Return structured response
    RETURN jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'sale_number', v_sale_number,
        'subtotal', p_subtotal,
        'discount_amount', p_discount_amount,
        'tax_amount', p_tax_amount,
        'total_amount', p_total_amount,
        'paid_amount', p_paid_amount,
        'due_amount', p_due_amount,
        'change_amount', p_change_amount,
        'payment_status', p_payment_status,
        'sold_at', v_sold_at
    );
END;
$$;
