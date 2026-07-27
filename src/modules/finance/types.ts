export type TransactionType = 'income' | 'expense';

export interface TransactionCategory {
  id: string;
  business_id: string;
  name: string;
  type: TransactionType;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date: string;
  created_at?: string;
  updated_at?: string;
  category?: TransactionCategory | null;
}

export interface CreateTransactionInput {
  business_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date: string;
}

export interface UpdateTransactionInput {
  business_id?: string;
  type?: TransactionType;
  amount?: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date?: string;
}

export interface CreateCategoryInput {
  business_id: string;
  name: string;
  type: TransactionType;
}

