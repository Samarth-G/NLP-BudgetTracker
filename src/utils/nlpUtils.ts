import { Transaction, AIResponse, Category } from '../types';
import { extractDateFromText } from './dateUtils';
import { getCategories } from './storage';
import { v4 as uuidv4 } from 'uuid';

// Mock GPT-4-mini API response for development
// In a real application, this would call the OpenAI API
export const processNaturalLanguageInput = async (input: string): Promise<AIResponse> => {
  try {
    // Basic NLP processing logic
    const lowerInput = input.toLowerCase();
    
    // Extract amount
    const amountMatch = lowerInput.match(/\$?(\d+(?:\.\d{1,2})?)/);
    if (!amountMatch) {
      return {
        needsMoreInfo: true,
        followUpQuestion: "I couldn't detect an amount. How much was the transaction?",
      };
    }
    
    const amount = parseFloat(amountMatch[1]);
    
    // Determine transaction type (income or expense)
    let type: 'income' | 'expense' = 'expense';
    if (
      lowerInput.includes('earned') ||
      lowerInput.includes('received') ||
      lowerInput.includes('income') ||
      lowerInput.includes('salary') ||
      lowerInput.includes('deposit') ||
      lowerInput.includes('paycheck')
    ) {
      type = 'income';
    }
    
    // Extract date
    const date = extractDateFromText(lowerInput) || new Date().toISOString().split('T')[0];
    
    // Check for recurring transactions
    let isRecurring = false;
    let recurringFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | undefined;
    
    if (
      lowerInput.includes('every day') ||
      lowerInput.includes('everyday') ||
      lowerInput.includes('daily')
    ) {
      isRecurring = true;
      recurringFrequency = 'daily';
    } else if (
      lowerInput.includes('every week') ||
      lowerInput.includes('weekly')
    ) {
      isRecurring = true;
      recurringFrequency = 'weekly';
    } else if (
      lowerInput.includes('every two weeks') ||
      lowerInput.includes('biweekly') ||
      lowerInput.includes('bi-weekly') ||
      lowerInput.includes('every other week')
    ) {
      isRecurring = true;
      recurringFrequency = 'biweekly';
    } else if (
      lowerInput.includes('every month') ||
      lowerInput.includes('monthly') ||
      lowerInput.match(/(\d+)(st|nd|rd|th) of (each|every) month/)
    ) {
      isRecurring = true;
      recurringFrequency = 'monthly';
    } else if (
      lowerInput.includes('every year') ||
      lowerInput.includes('yearly') ||
      lowerInput.includes('annually')
    ) {
      isRecurring = true;
      recurringFrequency = 'yearly';
    }
    
    // Extract recurring day if applicable
    let recurringDay: number | undefined;
    if (isRecurring && recurringFrequency === 'monthly') {
      const dayMatch = lowerInput.match(/(\d+)(st|nd|rd|th) of (each|every) month/);
      if (dayMatch) {
        recurringDay = parseInt(dayMatch[1]);
      }
    }
    
    // Determine category based on keywords
    const categories = getCategories();
    let category = determineCategory(lowerInput, type, categories);
    
    if (!category) {
      return {
        needsMoreInfo: true,
        followUpQuestion: `What category would you like to assign to this ${type}?`,
      };
    }
    
    // Create transaction object
    const transaction: Transaction = {
      id: uuidv4(),
      type,
      amount,
      category,
      description: input,
      date,
      isRecurring,
      recurringFrequency,
      recurringDay,
    };
    
    return { transaction };
  } catch (error) {
    console.error('Error processing natural language input:', error);
    return {
      error: 'Sorry, I had trouble understanding that. Please try again with a clearer description.',
    };
  }
};

// Helper function to determine category based on keywords
const determineCategory = (
  input: string,
  type: 'income' | 'expense',
  categories: Category[]
): string => {
  const lowerInput = input.toLowerCase();
  const typeCategories = categories.filter(c => c.type === type);
  
  // Check for exact category mentions
  for (const category of typeCategories) {
    if (lowerInput.includes(category.name.toLowerCase())) {
      return category.name;
    }
  }
  
  // Income categories
  if (type === 'income') {
    if (
      lowerInput.includes('salary') ||
      lowerInput.includes('paycheck') ||
      lowerInput.includes('wage')
    ) {
      return 'Salary';
    }
    
    if (
      lowerInput.includes('freelance') ||
      lowerInput.includes('contract') ||
      lowerInput.includes('gig')
    ) {
      return 'Freelance';
    }
    
    if (
      lowerInput.includes('dividend') ||
      lowerInput.includes('stock') ||
      lowerInput.includes('interest') ||
      lowerInput.includes('investment')
    ) {
      return 'Investments';
    }
    
    // Default income category
    return 'Other Income';
  }
  
  // Expense categories
  if (
    lowerInput.includes('rent') ||
    lowerInput.includes('mortgage') ||
    lowerInput.includes('housing')
  ) {
    return 'Housing';
  }
  
  if (
    lowerInput.includes('electricity') ||
    lowerInput.includes('water') ||
    lowerInput.includes('gas') ||
    lowerInput.includes('internet') ||
    lowerInput.includes('phone') ||
    lowerInput.includes('utility') ||
    lowerInput.includes('bill')
  ) {
    return 'Utilities';
  }
  
  if (
    lowerInput.includes('grocery') ||
    lowerInput.includes('groceries') ||
    lowerInput.includes('supermarket')
  ) {
    return 'Groceries';
  }
  
  if (
    lowerInput.includes('restaurant') ||
    lowerInput.includes('dinner') ||
    lowerInput.includes('lunch') ||
    lowerInput.includes('breakfast') ||
    lowerInput.includes('coffee') ||
    lowerInput.includes('food') ||
    lowerInput.includes('drink') ||
    lowerInput.includes('meal')
  ) {
    return 'Food & Drinks';
  }
  
  if (
    lowerInput.includes('gas') ||
    lowerInput.includes('fuel') ||
    lowerInput.includes('car') ||
    lowerInput.includes('bus') ||
    lowerInput.includes('train') ||
    lowerInput.includes('taxi') ||
    lowerInput.includes('uber') ||
    lowerInput.includes('lyft') ||
    lowerInput.includes('transport')
  ) {
    return 'Transportation';
  }
  
  if (
    lowerInput.includes('movie') ||
    lowerInput.includes('concert') ||
    lowerInput.includes('entertainment') ||
    lowerInput.includes('game') ||
    lowerInput.includes('fun')
  ) {
    return 'Entertainment';
  }
  
  if (
    lowerInput.includes('clothes') ||
    lowerInput.includes('clothing') ||
    lowerInput.includes('shopping') ||
    lowerInput.includes('amazon') ||
    lowerInput.includes('store') ||
    lowerInput.includes('mall')
  ) {
    return 'Shopping';
  }
  
  if (
    lowerInput.includes('doctor') ||
    lowerInput.includes('medical') ||
    lowerInput.includes('health') ||
    lowerInput.includes('medicine') ||
    lowerInput.includes('pharmacy') ||
    lowerInput.includes('hospital')
  ) {
    return 'Health';
  }
  
  if (
    lowerInput.includes('netflix') ||
    lowerInput.includes('spotify') ||
    lowerInput.includes('subscription') ||
    lowerInput.includes('membership')
  ) {
    return 'Subscriptions';
  }
  
  // Default expense category
  return 'Other Expenses';
};