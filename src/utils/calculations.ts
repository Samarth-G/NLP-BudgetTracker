import { Transaction, MonthlyTotal } from '../types';
import { filterTransactionsByMonth, calculateMonthlyOccurrences } from './dateUtils';
import { getCategories } from './storage';

// Calculate monthly totals
export const calculateMonthlyTotals = (
  transactions: Transaction[],
  month: number,
  year: number
): MonthlyTotal => {
  const monthlyTransactions = filterTransactionsByMonth(transactions, month, year);
  const categories = getCategories();
  
  let income = 0;
  let expense = 0;
  const categoryTotals: { [category: string]: number } = {};
  
  // Initialize category totals
  categories.forEach(category => {
    categoryTotals[category.name] = 0;
  });
  
  // Calculate totals
  monthlyTransactions.forEach(transaction => {
    const occurrences = calculateMonthlyOccurrences(transaction, month, year);
    const totalAmount = transaction.amount * occurrences;
    
    if (transaction.type === 'income') {
      income += totalAmount;
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + totalAmount;
    } else {
      expense += totalAmount;
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + totalAmount;
    }
  });
  
  return {
    income,
    expense,
    balance: income - expense,
    categories: categoryTotals,
  };
};

// Get top spending categories
export const getTopSpendingCategories = (
  transactions: Transaction[],
  month: number,
  year: number,
  limit: number = 5
): { category: string; amount: number }[] => {
  const monthlyTransactions = filterTransactionsByMonth(transactions, month, year);
  const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense');
  
  const categoryTotals: { [category: string]: number } = {};
  
  // Calculate totals by category
  expenseTransactions.forEach(transaction => {
    const occurrences = calculateMonthlyOccurrences(transaction, month, year);
    const totalAmount = transaction.amount * occurrences;
    
    categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + totalAmount;
  });
  
  // Convert to array and sort
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
  
  return sortedCategories;
};

// Calculate monthly trend data for the last 6 months
export const calculateMonthlyTrend = (
  transactions: Transaction[],
  currentMonth: number,
  currentYear: number,
  months: number = 6
): { month: string; income: number; expense: number }[] => {
  const trend: { month: string; income: number; expense: number }[] = [];
  
  for (let i = 0; i < months; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    
    // Adjust for previous year
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    
    const { income, expense } = calculateMonthlyTotals(transactions, month, year);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    trend.unshift({
      month: `${monthNames[month - 1]} ${year}`,
      income,
      expense,
    });
  }
  
  return trend;
};