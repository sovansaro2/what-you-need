# WYN Schema Intelligent Mapping Report
**Schema Hash:** `9CE49D71A0FEFF711A44EE7533CFF6B9810FC4ABF8B854A8D637D98CFCA29E26` | **Generated:** `2026-07-27T10:50:37.766Z`

---

## 1. Executive Summary

| Dimension | Counts |
| :--- | :---: |
| **Table Mappings** | 22 |
| **Column Mappings** | 233 |
| **Relationship Mappings** | 27 |
| **Rename Candidates** | 0 |
| **Migration Hints** | 0 |

## 2. Confidence & Risk Matrix

### Confidence Distribution
- **Very High (95-100%)**: 261
- **High (80-94%)**: 21
- **Medium (60-79%)**: 0
- **Low (<60%)**: 0

### Risk Distribution
- **LOW**: 261
- **MEDIUM**: 8
- **HIGH**: 13
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
| `business_settings` | `business_settings` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |
| `categories` | `categories` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |
| `schema_migrations` | `schema_migrations` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |
| `stock_transactions` | `stock_transactions` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |
| `transactions` | `transactions` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |
| `user_preferences` | `user_preferences` | `DEPRECATED_TABLE` | 90% (HIGH) | `HIGH` | Table exists in current database but is not defined in target DDL. |

## 4. Candidate Table Renames

- No candidate table renames identified.

## 5. Migration Hints

- No migration hints required.
