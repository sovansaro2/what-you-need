# Foundation Standards & Constants

This directory centralizes standard constants used across all modules:

## 1. Khmer Terminology (`khmerTerms.ts`)
- Standardized Khmer vocabulary for actions, finance, sales, inventory, statuses, and validation.
- Prevents inconsistent wording across components and modules.

## 2. Global Theme (`theme.ts`)
- Design system tokens for typography, touch target min dimensions (44px / 48px), brand colors (Indigo primary, Emerald income, Rose expense, Amber warnings), border radii, and shadows.

## 3. Centralized Icons (`icons.ts`)
- Standardized `lucide-react` icon mappings.
- Strictly no emojis in UI components or labels.

## Naming Standards

- **Components**: PascalCase (e.g., `ProductCard.tsx`, `Button.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useProducts.ts`)
- **Services**: camelCase ending with `Service` (e.g., `salesService.ts`)
- **Constants**: UPPER_SNAKE_CASE for constant values, camelCase for dictionaries (e.g., `KHMER_COMMON_ACTIONS`, `APP_THEME`)
- **Types**: PascalCase interfaces and types (e.g., `Product`, `CreateSaleInput`)
