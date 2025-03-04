import { Transaction, Category } from '../types';

// Local Storage Keys
const TRANSACTIONS_KEY = 'budget_tracker_transactions';
const CATEGORIES_KEY = 'budget_tracker_categories';

// Default Categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Salary', type: 'income', color: '#4CAF50' },
  { id: '2', name: 'Freelance', type: 'income', color: '#8BC34A' },
  { id: '3', name: 'Investments', type: 'income', color: '#CDDC39' },
  { id: '4', name: 'Other Income', type: 'income', color: '#FFC107' },
  { id: '5', name: 'Housing', type: 'expense', color: '#FF5722' },
  { id: '6', name: 'Utilities', type: 'expense', color: '#F44336' },
  { id: '7', name: 'Groceries', type: 'expense', color: '#E91E63' },
  { id: '8', name: 'Food & Drinks', type: 'expense', color: '#9C27B0' },
  { id: '9', name: 'Transportation', type: 'expense', color: '#673AB7' },
  { id: '10', name: 'Entertainment', type: 'expense', color: '#3F51B5' },
  { id: '11', name: 'Shopping', type: 'expense', color: '#2196F3' },
  { id: '12', name: 'Health', type: 'expense', color: '#03A9F4' },
  { id: '13', name: 'Subscriptions', type: 'expense', color: '#00BCD4' },
  { id: '14', name: 'Other Expenses', type: 'expense', color: '#009688' },
];

// Initialize local storage with default categories if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }
  
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
};

// Get all transactions
export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem(TRANSACTIONS_KEY);
  return transactions ? JSON.parse(transactions) : [];
};

// Add a transaction
export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// Update a transaction
export const updateTransaction = (updatedTransaction: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === updatedTransaction.id);
  
  if (index !== -1) {
    transactions[index] = updatedTransaction;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
};

// Delete a transaction
export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filteredTransactions));
};

// Get all categories
export const getCategories = (): Category[] => {
  const categories = localStorage.getItem(CATEGORIES_KEY);
  return categories ? JSON.parse(categories) : defaultCategories;
};

// Add a category
export const addCategory = (category: Category): void => {
  const categories = getCategories();
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// Update a category
export const updateCategory = (updatedCategory: Category): void => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === updatedCategory.id);
  
  if (index !== -1) {
    categories[index] = updatedCategory;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
};

// Delete a category
export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  const filteredCategories = categories.filter(c => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
};