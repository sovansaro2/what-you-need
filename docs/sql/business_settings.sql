-- ====================================================================
-- WYN Business System - Step 10.2: Business Settings & Preferences Schema
-- ====================================================================
-- Note: Do NOT execute directly. This SQL proposal defines the database structure
-- for Version 1.0 Business Settings and User Preferences.

-- 1. Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    primary_currency VARCHAR(10) DEFAULT 'KHR' CHECK (primary_currency IN ('KHR', 'USD')),
    language VARCHAR(10) DEFAULT 'km' CHECK (language IN ('km')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_business UNIQUE (user_id)
);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light')),
    low_stock_alert BOOLEAN DEFAULT TRUE,
    sales_notifications BOOLEAN DEFAULT TRUE,
    report_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Business Settings RLS Policies
CREATE POLICY "Users can view their own business settings"
    ON public.business_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business settings"
    ON public.business_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings"
    ON public.business_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- User Preferences RLS Policies
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);
