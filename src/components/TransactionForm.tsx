import React, { useState } from 'react';
import { Transaction, AIResponse } from '../types';
import { processNaturalLanguageInput } from '../utils/nlpUtils';
import { addTransaction } from '../utils/storage';
import { Send, Loader } from 'lucide-react';

interface TransactionFormProps {
  refreshData: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ refreshData }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<Partial<Transaction> | null>(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && !followUpQuestion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (followUpQuestion) {
        // Handle follow-up response
        if (followUpQuestion.includes('category')) {
          // User is providing a category
          if (pendingTransaction) {
            const transaction: Transaction = {
              ...pendingTransaction,
              category: followUpInput,
            } as Transaction;
            
            addTransaction(transaction);
            refreshData();
            
            // Reset form
            setInput('');
            setFollowUpQuestion(null);
            setPendingTransaction(null);
            setFollowUpInput('');
          }
        } else {
          // Handle other follow-up questions as needed
          setError('Unable to process follow-up response');
        }
      } else {
        // Process new input
        const response: AIResponse = await processNaturalLanguageInput(input);
        
        if (response.error) {
          setError(response.error);
        } else if (response.needsMoreInfo) {
          setFollowUpQuestion(response.followUpQuestion || null);
          setPendingTransaction(response.transaction || null);
        } else if (response.transaction) {
          addTransaction(response.transaction);
          refreshData();
          setInput('');
        }
      }
    } catch (err) {
      setError('An error occurred while processing your request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFollowUpQuestion(null);
    setPendingTransaction(null);
    setFollowUpInput('');
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {followUpQuestion ? 'Additional Information Needed' : 'Add Transaction'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {followUpQuestion ? (
          <div>
            <p className="mb-2 text-gray-700">{followUpQuestion}</p>
            <div className="flex">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your response..."
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter transaction (e.g., 'Spent $50 on groceries today')"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        )}
      </form>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Try saying things like:
        </p>
        <ul className="text-sm text-gray-600 mt-1 space-y-1">
          <li>• "Spent $50 on groceries today"</li>
          <li>• "Received $2,500 salary on the 1st"</li>
          <li>• "Netflix subscription $15 monthly"</li>
          <li>• "Paid $40 for gas yesterday"</li>
          <li>• "Income $1000 biweekly"</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionForm;