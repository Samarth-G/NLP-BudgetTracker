export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  recurringDay?: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface MonthlyTotal {
  income: number;
  expense: number;
  balance: number;
  categories: {
    [category: string]: number;
  };
}

export interface AIResponse {
  transaction?: Transaction;
  needsMoreInfo?: boolean;
  followUpQuestion?: string;
  error?: string;
}