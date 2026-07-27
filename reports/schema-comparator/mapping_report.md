# WYN Schema Intelligent Mapping Report
**Schema Hash:** `CC44B3AB4DAD69FA5634C218F5EA06266E8E6A008666F0B5621BCE65510C7F93` | **Generated:** `2026-07-27T16:37:17.761Z`

---

## 1. Executive Summary

| Dimension | Counts |
| :--- | :---: |
| **Table Mappings** | 16 |
| **Column Mappings** | 228 |
| **Relationship Mappings** | 27 |
| **Rename Candidates** | 0 |
| **Migration Hints** | 0 |

## 2. Confidence & Risk Matrix

### Confidence Distribution
- **Very High (95-100%)**: 265
- **High (80-94%)**: 6
- **Medium (60-79%)**: 0
- **Low (<60%)**: 0

### Risk Distribution
- **LOW**: 265
- **MEDIUM**: 4
- **HIGH**: 2
- **CRITICAL**: 0

## 3. Table Mappings

| Current Table | Target Table | Match Type | Confidence | Risk | Reason |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `businesses` | `businesses` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `customers` | `customers` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `daily_summaries` | `daily_summaries` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `expense_categories` | `expense_categories` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `expenses` | `expenses` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `payments` | `payments` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `product_categories` | `product_categories` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `product_units` | `product_units` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `products` | `products` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `profiles` | `profiles` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `purchase_items` | `purchase_items` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `purchase_orders` | `purchase_orders` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `sale_items` | `sale_items` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `sales` | `sales` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `stock_movements` | `stock_movements` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |
| `suppliers` | `suppliers` | `DIRECT_MATCH` | 100% (VERY_HIGH) | `LOW` | Exact table name match between current database and target DDL. |

## 4. Candidate Table Renames

- No candidate table renames identified.

## 5. Migration Hints

- No migration hints required.
