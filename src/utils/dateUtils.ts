import { format, parse, addDays, addWeeks, addMonths, addYears, getDaysInMonth, isValid } from 'date-fns';
import { Transaction } from '../types';

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Parse date string to Date object
export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

// Get current month and year
export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear(),
  };
};

// Filter transactions for a specific month and year
export const filterTransactionsByMonth = (
  transactions: Transaction[],
  month: number,
  year: number
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = parseDate(transaction.date);
    return (
      transactionDate.getMonth() + 1 === month &&
      transactionDate.getFullYear() === year
    );
  });
};

// Calculate monthly occurrences for recurring transactions
export const calculateMonthlyOccurrences = (
  transaction: Transaction,
  month: number,
  year: number
): number => {
  if (!transaction.isRecurring) return 1;

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  
  switch (transaction.recurringFrequency) {
    case 'daily':
      return daysInMonth;
    case 'weekly':
      return Math.floor(daysInMonth / 7);
    case 'biweekly':
      return Math.floor(daysInMonth / 14) * 2;
    case 'monthly':
      return 1;
    case 'yearly':
      // Check if the recurring day falls in the current month
      const recurringMonth = parseDate(transaction.date).getMonth() + 1;
      return recurringMonth === month ? 1 : 0;
    default:
      return 1;
  }
};

// Get the next occurrence date for a recurring transaction
export const getNextOccurrenceDate = (
  transaction: Transaction
): string | null => {
  if (!transaction.isRecurring) return null;

  const baseDate = parseDate(transaction.date);
  let nextDate: Date;

  switch (transaction.recurringFrequency) {
    case 'daily':
      nextDate = addDays(baseDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(baseDate, 2);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, 1);
      break;
    case 'yearly':
      nextDate = addYears(baseDate, 1);
      break;
    default:
      return null;
  }

  return formatDate(nextDate);
};

// Extract date from natural language
export const extractDateFromText = (text: string): string | null => {
  // Try to match common date formats and expressions
  const today = new Date();
  
  // Check for "today"
  if (/\btoday\b/i.test(text)) {
    return formatDate(today);
  }
  
  // Check for "yesterday"
  if (/\byesterday\b/i.test(text)) {
    return formatDate(addDays(today, -1));
  }
  
  // Check for "tomorrow"
  if (/\btomorrow\b/i.test(text)) {
    return formatDate(addDays(today, 1));
  }
  
  // Check for "last [day of week]"
  const lastDayMatch = text.match(/\blast\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (lastDayMatch) {
    const dayOfWeek = lastDayMatch[1].toLowerCase();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
    const currentDayIndex = today.getDay();
    
    let daysToSubtract = currentDayIndex - targetDayIndex;
    if (daysToSubtract <= 0) daysToSubtract += 7;
    
    return formatDate(addDays(today, -daysToSubtract));
  }
  
  // Check for specific date formats
  // Format: MM/DD/YYYY or MM-DD-YYYY
  const dateRegex1 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
  const match1 = text.match(dateRegex1);
  if (match1) {
    const [_, month, day, year] = match1;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isValid(date)) {
      return formatDate(date);
    }
  }
  
  // Format: Month DD, YYYY
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthRegex = new RegExp(`(${months.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,\\s*(\\d{4}))?`, 'i');
  const match2 = text.match(monthRegex);
  
  if (match2) {
    const monthName = match2[1].toLowerCase();
    const day = parseInt(match2[2]);
    const year = match2[3] ? parseInt(match2[3]) : today.getFullYear();
    
    const monthIndex = months.indexOf(monthName);
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day);
      if (isValid(date)) {
        return formatDate(date);
      }
    }
  }
  
  // Format: DD Month YYYY
  const dateRegex3 = /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i;
  const match3 = text.match(dateRegex3);
  
  if (match3) {
    const day = parseInt(match3[1]);
    const monthName = match3[2].toLowerCase();
    const year = match3[3] ? parseInt(match3[3]) : today.getFullYear();
    
    const monthIndex = months.indexOf(monthName);
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day);
      if (isValid(date)) {
        return formatDate(date);
      }
    }
  }
  
  // If no date is found, return today's date
  return formatDate(today);
};