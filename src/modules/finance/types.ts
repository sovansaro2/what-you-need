export type TransactionType = 'income' | 'expense';

export interface TransactionCategory {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
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
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date?: string;
}

export interface CreateCategoryInput {
  user_id: string;
  name: string;
  type: TransactionType;
}
