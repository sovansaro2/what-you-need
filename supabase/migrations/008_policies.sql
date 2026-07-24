-- 008_policies.sql

-- Profiles
DROP POLICY IF EXISTS "profiles_owner_access" ON public.profiles;
CREATE POLICY "profiles_owner_access" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories
DROP POLICY IF EXISTS "categories_owner_access" ON public.categories;
CREATE POLICY "categories_owner_access" ON public.categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "transactions_owner_access" ON public.transactions;
CREATE POLICY "transactions_owner_access" ON public.transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products
DROP POLICY IF EXISTS "products_owner_access" ON public.products;
CREATE POLICY "products_owner_access" ON public.products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sales
DROP POLICY IF EXISTS "sales_owner_access" ON public.sales;
CREATE POLICY "sales_owner_access" ON public.sales FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sale Items
DROP POLICY IF EXISTS "sale_items_owner_access" ON public.sale_items;
CREATE POLICY "sale_items_owner_access" ON public.sale_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
