# What You Need (WYN) - Phase 13: Inventory Module
## Task 13.1 — Inventory Engineering Audit Report

**Audit Date**: July 27, 2026  
**Auditor**: Lead Software Architect & Senior React/Database Engineer  
**Database Target**: Live Supabase Cloud (`https://dpwtuzsspcxiebctjqyv.supabase.co`)  
**Scope**: Complete Inventory Module Codebase & Database Schema Audit  

---

## Executive Summary

A comprehensive, zero-assumption engineering audit was conducted on the WYN Inventory Module against the live Supabase PostgreSQL database. While the frontend presents a rich, polished Khmer user interface with offline-first localStorage caching, **severe architectural gaps exist between the live database schema and the frontend service layer**.

The live Supabase database uses a **normalized multi-tenant architecture with `business_id` (uuid)**, whereas all frontend services (`productService.ts`, `productCategoryService.ts`, `productUnitService.ts`, `stockMovementService.ts`) execute Supabase queries filtered on `user_id` and attempt to insert un-normalized columns that do not exist in PostgreSQL. As a result, direct Supabase network operations fail and silently fall back to client localStorage.

This report provides the definitive Feature Matrix, Gap Analysis, Broken Components/Services/Hooks breakdown, and a 3-Phase Implementation Plan to achieve full real-time database synchronicity.

---

## 1. Database Schema vs. Codebase Reality Summary

### 1.1 Live Database Inventory Schema

| Table Name | Live Columns | Foreign Keys / Constraints | Live Row Count |
| :--- | :--- | :--- | :---: |
| **`products`** | `id` (UUID PK), `business_id` (FK), `category_id` (FK), `unit_id` (FK), `sku` (VARCHAR NOT NULL), `barcode` (VARCHAR NULL), `name` (VARCHAR NOT NULL), `cost_price` (NUMERIC 12,2), `selling_price` (NUMERIC 12,2), `current_stock` (NUMERIC 12,3), `min_stock_alert` (NUMERIC 12,3), `image_url` (TEXT), `is_archived` (BOOL), `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by` | FK to `businesses(id)`, `product_categories(id)`, `product_units(id)`. RLS enabled. | **0** |
| **`product_categories`** | `id` (UUID PK), `name` (VARCHAR NULL), `created_at` (TIMESTAMPTZ) | RLS enabled. PK constraint. | **0** |
| **`product_units`** | `id` (UUID PK), `name` (VARCHAR NULL), `created_at` (TIMESTAMPTZ) | RLS enabled. PK constraint. | **0** |
| **`stock_movements`** | `id` (UUID PK), `business_id` (FK), `product_id` (FK NOT NULL), `movement_type` (VARCHAR NOT NULL DEFAULT 'in'), `quantity` (NUMERIC 12,3 NOT NULL), `balance_before` (NUMERIC 12,3), `balance_after` (NUMERIC 12,3), `unit_cost` (NUMERIC 12,2), `total_cost` (NUMERIC 12,2), `reference_type` (VARCHAR), `reference_id` (UUID), `idempotency_key` (VARCHAR), `notes` (TEXT), `created_by` (UUID), `created_at` (TIMESTAMPTZ) | FK to `businesses(id)`, `products(id)`. RLS enabled. | **0** |

---

## 2. Feature Matrix & Module Audit

| Feature | Database Support | Frontend UI Support | Backend / Query Support | Business Logic | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Product CRUD** | ✅ Full | ✅ Full (`ProductListPage`, `ProductFormPage`, `ProductDetailPage`) | ❌ Broken (`.eq('user_id')` query mismatch) | ⚠️ Partial (relies on localStorage fallback) | **Broken Integration** |
| **Category CRUD** | ✅ Partial (no `user_id` / `business_id` column) | ✅ Full (`ProductCategoriesPage`) | ❌ Broken (`user_id` query mismatch) | ⚠️ Partial (localStorage fallback) | **Schema Mismatch** |
| **Unit CRUD** | ✅ Partial (no `user_id` / `business_id` column) | ✅ Full (`ProductUnitsPage`) | ❌ Broken (`user_id` query mismatch) | ⚠️ Partial (localStorage fallback) | **Schema Mismatch** |
| **Stock Receiving (Stock In)** | ✅ Full (`movement_type = 'in'`) | ✅ Full (`StockMovementPage`) | ❌ Broken (un-normalized payload payload error) | ✅ Full (Local calculations) | **Broken Integration** |
| **Stock Adjustment** | ✅ Full (`movement_type = 'adjustment'`) | ✅ Full (`StockMovementPage`) | ❌ Broken (un-normalized payload) | ✅ Full (Idempotency & negative stock logic) | **Broken Integration** |
| **Stock Transfer** | ❌ Missing (`transfer` movement type / warehouse table missing) | ⚠️ Partial (Mock transfer option in UI) | ❌ Missing (No backend API/query) | ❌ Missing (No multi-warehouse logic) | **Not Supported** |
| **Stock Reduction (Sale/Damage/Expired)** | ✅ Full (`movement_type = 'out'`) | ✅ Full (`StockMovementPage`) | ❌ Broken (un-normalized payload) | ✅ Full (Local validation rules) | **Broken Integration** |
| **Low Stock Alerts** | ✅ Full (`min_stock_alert` & `current_stock`) | ✅ Full (Badges & filter chips) | ⚠️ Partial (Computed client-side) | ✅ Full | **Functional (Client)** |
| **Inventory History** | ✅ Full (`stock_movements` table) | ✅ Full (`StockMovementHistoryPage`) | ❌ Broken (`user_id` filter mismatch) | ✅ Full | **Broken Integration** |
| **Barcode Support** | ✅ Full (`barcode` column) | ✅ Full (Scanner simulation & input field) | ⚠️ Partial (Query by barcode fails) | ✅ Full | **UI Only / Network Failure** |
| **SKU Support** | ✅ Full (`sku` column NOT NULL) | ✅ Full (Auto-generation & validation) | ❌ Broken (`isSkuDuplicate` uses `user_id`) | ✅ Full | **Broken Integration** |
| **Search & Filters** | N/A (Index supported) | ✅ Full (Khmer search, category filter, stock level filter) | ⚠️ Partial (Client-side filtering over localStorage) | ✅ Full | **Functional (Client)** |

---

## 3. Comprehensive Gap Analysis

### 3.1 Missing Tables & Schema Mismatches
1. **`user_id` vs `business_id` Mismatch**:
   - **Database Reality**: `products` and `stock_movements` tables use `business_id` (UUID foreign key to `businesses`) to isolate multi-tenant records.
   - **Service Misalignment**: `productService.ts` and `stockMovementService.ts` query `.eq('user_id', userId)`. Because `user_id` column does not exist on `products` or `stock_movements`, Supabase rejects all SELECT, INSERT, UPDATE, and DELETE operations.
2. **Missing Metadata Columns in `product_categories` & `product_units`**:
   - **Database Reality**: `product_categories` only has `(id, name, created_at)`. `product_units` only has `(id, name, created_at)`.
   - **Service Misalignment**: `productCategoryService.ts` and `productUnitService.ts` attempt to insert `user_id`, `description`, `color`, `is_default`, `is_archived`. Supabase rejects insertions with `column "user_id" of relation "product_categories" does not exist`.
3. **Denormalized Columns in `stock_movements` Service**:
   - **Database Reality**: `stock_movements` table only stores normalized references (`product_id`, `business_id`, `movement_type`, `quantity`, `balance_before`, `balance_after`, `unit_cost`, `total_cost`, `reference_type`, `reference_id`, `idempotency_key`, `notes`, `created_by`, `created_at`).
   - **Service Misalignment**: `stockMovementService.ts` attempts to insert `product_name`, `product_sku`, `delta`, `reference_code`, `movement_source`, `status`, `user_id`. Supabase rejects insertions with unknown column errors.
4. **Invalid Non-UUID Primary Keys**:
   - **Database Reality**: `stock_movements.id` is defined as `uuid NOT NULL DEFAULT gen_random_uuid()`.
   - **Service Misalignment**: `stockMovementService.ts` generates client IDs like `mvt_17850731...`, causing PostgreSQL invalid UUID syntax errors (`22P02`).

---

## 4. Broken Components, Services, and Hooks

### 4.1 Broken Services
- **`productService.ts`**:
  - `getProducts`: `.eq('user_id', userId)` fails on PostgreSQL query.
  - `isSkuDuplicate`: `.eq('user_id', userId)` fails.
  - `createProduct`: Inserts `user_id`, maps `unit` string instead of referencing `unit_id` UUID correctly.
- **`productCategoryService.ts`**:
  - `ensureDefaultCategories`: Upserts `user_id`, `color`, `description`, `is_default` which do not exist in DB schema.
  - `getCategories`: `.eq('user_id', userId)` fails.
- **`productUnitService.ts`**:
  - `ensureDefaultUnits`: Upserts `user_id`, `symbol`, `description`, `is_default` which do not exist in DB schema.
- **`stockMovementService.ts`**:
  - `processStockMovement`: Insert query fails due to missing `user_id`, `product_name`, `product_sku`, `delta`, and non-UUID string primary key.

### 4.2 Broken Hooks
- **`useProducts.ts`**: Relies on `productService` which falls back silently to empty local storage when Supabase queries fail.
- **`useCategories.ts`**: Fails remote sync, falling back to static defaults.
- **`useUnits.ts`**: Fails remote sync, falling back to static defaults.
- **`useStockMovements.ts`**: Cannot fetch or persist audit trails in Supabase.

### 4.3 Affected UI Components
- `ProductListPage.tsx`
- `ProductFormPage.tsx`
- `ProductDetailPage.tsx`
- `ProductCategoriesPage.tsx`
- `ProductUnitsPage.tsx`
- `StockMovementPage.tsx`
- `StockMovementHistoryPage.tsx`

---

## 5. Priority List & Implementation Plan

### Phase 1: Critical (Database Alignment & Core Persistence)
1. **Business ID Resolution**:
   - Update `productService`, `stockMovementService`, and related hooks to query using `business_id` (obtained from active business profile or user metadata) instead of `user_id`.
2. **Payload Normalization**:
   - Strip non-existent columns (`product_name`, `product_sku`, `delta`, `movement_source`, `status`) from `stock_movements` database insertion logic.
   - Use standard UUID generation or allow PostgreSQL `gen_random_uuid()` default for `stock_movements.id`.
3. **Category & Unit Service Repair**:
   - Align `productCategoryService` and `productUnitService` insert/update payloads to match live database columns `(name)`.

### Phase 2: Important (Data Integrity & Foreign Key Alignment)
1. **Foreign Key Mapping**:
   - Ensure `category_id` and `unit_id` UUIDs are consistently captured and stored during product creation/editing rather than loose string labels.
2. **Stock Movement Types Standardization**:
   - Map frontend stock movement actions (`stock_in` -> `'in'`, `sale`/`damage`/`expired` -> `'out'`, `adjustment` -> `'adjustment'`) to match PostgreSQL table check constraints.
3. **Transactional Atomic RPC or Query Pipeline**:
   - Ensure product `current_stock` updates and `stock_movements` inserts are executed reliably in sequence or via Supabase RPC function.

### Phase 3: Nice-to-Have (Enhanced Features & Multi-Warehouse)
1. **Stock Transfer Feature**:
   - If multi-warehouse/location stock transfer is required in the future, create a `warehouses` table and `transfers` table schema migration.
2. **Realtime Subscriptions**:
   - Enable Supabase Realtime channel listeners on `products` and `stock_movements` to update client state instantly across multiple user sessions.

---
*Report compiled by Lead Systems Architect for WYN Phase 13 Inventory Audit.*
