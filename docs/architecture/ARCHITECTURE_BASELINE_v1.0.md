# Architecture Baseline v1.0

**Project:** Point-of-Sale & Inventory Management System  
**Version:** 1.0.0 (Phase 14 Stabilization Baseline)  
**Date:** July 2026  
**Status:** Approved & Verified Baseline

---

## 1. Executive Overview & Architectural Principles

This document establishes the architecture baseline for the application following the Phase 14 Stabilization Sprint. The application is built as a modular React + TypeScript application backed by Supabase PostgreSQL database operations, featuring real-time inventory management, Point-of-Sale (POS) transaction processing, customer management, and automated stock deduction.

### Core Architectural Principles
1. **Domain Isolation**: Each major domain (`inventory`, `sales`, `core`, etc.) resides in its own module under `src/modules/` or `src/core/`.
2. **Unified Core Protocols**: Cross-domain primitives—Error Handling, Event Bus, Data Seeding, and Supabase client bindings—are standard and located in `src/core/`.
3. **Event-Driven Decoupling**: Inter-module communication (e.g. Sales triggering stock updates or low-stock alerts) is performed asynchronously via a strongly typed event bus (`appEventBus`).
4. **Resilient Data Seeding**: Initial business defaults (categories, units, walk-in customer, sample catalog) are seeded automatically via idempotent strategy (`seedService`).
5. **Full Type Safety**: All inputs, outputs, domain models, and events are strictly typed with TypeScript.

---

## 2. Directory Layout & Module Structure

```
src/
├── core/                        # Application-wide primitives
│   ├── errors/                  # Standardized error hierarchy & error handlers
│   │   ├── AppError.ts          # Typed AppError, NotFoundError, InsufficientStockError, etc.
│   │   ├── errorHandler.ts      # safeAsync, logError, user-facing error formatting
│   │   └── index.ts
│   ├── events/                  # Decoupled application event bus
│   │   ├── types.ts             # AppEventMap, EventType, EventHandlers
│   │   ├── eventBus.ts          # TypedEventBus singleton (appEventBus)
│   │   └── index.ts
│   ├── seed/                    # Reusable database seed strategy
│   │   ├── defaultData.ts       # Khmer default categories, units, walk-in customer, samples
│   │   ├── seedService.ts       # Idempotent seed function for fresh business setup
│   │   └── index.ts
│   └── index.ts
├── modules/
│   ├── inventory/               # Inventory domain module
│   │   ├── categories/          # Product categories (components, services, types)
│   │   ├── products/            # Product catalog & stock levels
│   │   ├── stock-movements/     # Audit log of stock movements (sales, purchases, adjustments)
│   │   └── units/               # Product measurement units
│   └── sales/                   # Sales domain module
│       ├── components/          # POS interface, ProductCatalog, CartDrawer, Receipts
│       ├── foundation/          # Sales mapper & error handlers
│       ├── hooks/               # useCart, usePOS, useProducts
│       ├── services/            # salesService, customerService
│       └── types/               # Sale, ProcessSaleInput, Customer, CartItem
├── pages/                       # Page-level view wrappers (SalesPOS, etc.)
├── routes/                      # AppRoutes & protected router layout
├── lib/
│   └── supabase.ts              # Sanitized Supabase client initialization
└── types/                       # Global root interfaces
```

---

## 3. Core Error Handling Framework (`src/core/errors/`)

All exceptions and domain errors inherit from `AppError` and carry structured context, user-facing Khmer/English error messages, HTTP status codes, and error category codes.

### Error Class Hierarchy
* `AppError`: Base error class extending standard JS `Error`.
* `NotFoundError`: Thrown when requested entity (e.g. Product, Customer, Sale) is missing.
* `ValidationError`: Thrown when form input or API payloads fail domain rules.
* `InsufficientStockError`: Thrown during POS checkout when requested product quantity exceeds available stock.
* `DatabaseError`: Wraps underlying Supabase/PostgreSQL client exceptions.
* `UnauthorizedError`: Thrown when user context is missing or invalid.
* `ConflictError`: Thrown on unique constraint violations (e.g. duplicate SKU or barcode).

### Error Execution Safety
Service methods and async operations utilize `safeAsync` wrapper for consistent error tuple returns `[data, error]`:
```typescript
import { safeAsync } from '@/core/errors';

const [salesHistory, error] = await safeAsync(
  () => salesService.getSaleHistory(userId, filter),
  'LoadSalesHistory'
);
```

---

## 4. Unified Event Bus (`src/core/events/`)

Inter-module communication uses the singleton `appEventBus` to prevent tight coupling between Sales, Inventory, and future Purchase modules.

### Registered Domain Events
| Event Name | Trigger | Payload Summary |
| :--- | :--- | :--- |
| `sale:created` | On completed POS transaction | `saleId`, `saleNumber`, `totalAmount`, `paymentMethod`, `items`, `soldAt` |
| `stock:updated` | On stock decrease or increase | `productId`, `productName`, `oldStock`, `newStock`, `changeQty`, `type` |
| `stock:low_alert` | When stock <= `min_stock_alert` | `productId`, `productName`, `currentStock`, `minStockAlert` |
| `product:created` | On new product added | `productId`, `name`, `sku`, `category` |
| `product:updated` | On product detail/price update | `productId`, `name`, `changes` |
| `product:deleted` | On product removal | `productId` |
| `customer:created` | On new customer registered | `customerId`, `name`, `phone` |

---

## 5. Reusable Database Seed Strategy (`src/core/seed/`)

To guarantee immediate operational readiness for fresh deployments or new user signups, `seedService.seedDefaultBusinessData(userId)` automatically verifies and seeds:
1. **Default Categories**: ភេសជ្ជៈ (Beverages), អាហារ (Food), គ្រឿងទេស (Groceries), ទំនិញទូទៅ (General Items).
2. **Default Measurement Units**: កញ្ចប់, ដប, កំប៉ុង, ប្រអប់, គីឡូក្រាម.
3. **Walk-In Customer**: `អតិថិជនទូទៅ (Walk-in Customer)` for fast checkout.
4. **Sample Catalog**: Initial sample products with preconfigured SKUs, prices, and stock levels if the catalog is empty.

---

## 6. End-to-End Verification Matrix

| Domain | Action | Verification Standard | Status |
| :--- | :--- | :--- | :--- |
| **Inventory** | Product Management | Create, edit, list, search, filter products by category | Verified |
| **Inventory** | Stock Movements | Automatic audit entry generated on sales stock reduction | Verified |
| **Sales** | POS Catalog & Scan | Live search, category filtering, barcode scan match | Verified |
| **Sales** | Cart & Customer | Add to cart, item qty adjustments, walk-in or new customer selection | Verified |
| **Sales** | Checkout Transaction | Calculates tax, discount, due amount, creates invoice, deducts stock | Verified |
| **Sales** | Receipt & History | Modal invoice view, print-ready receipt format, filterable history table | Verified |
| **Core Framework** | Build & Linting | Zero TypeScript errors (`tsc --noEmit`), strict build validation | Verified |

---

## 7. Roadmap & Phase 15 Readiness

With Phase 14 stabilization completed, the core architecture is locked and stabilized. The system is fully prepared for **Phase 15: Purchase Module**, which will leverage the existing stock movement framework, supplier relations, and event bus (`stock:updated`).
