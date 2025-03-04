import React, { useState, useEffect } from 'react';
import { Transaction, MonthlyTotal } from '../types';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { calculateMonthlyTotals } from '../utils/calculations';
import { getTransactions } from '../utils/storage';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  refreshData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, refreshData }) => {
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal>({
    income: 0,
    expense: 0,
    balance: 0,
    categories: {},
  });
  
  const { month, year } = getCurrentMonthYear();
  
  useEffect(() => {
    const totals = calculateMonthlyTotals(transactions, month, year);
    setMonthlyTotals(totals);
  }, [transactions, month, year]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
          <DollarSign className="text-indigo-500" size={20} />
        </div>
        <p className={`text-3xl font-bold ${monthlyTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${monthlyTotals.balance.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Monthly Net ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Income</h3>
          <ArrowUpCircle className="text-green-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-green-600">
          ${monthlyTotals.income.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Monthly Income ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Expenses</h3>
          <ArrowDownCircle className="text-red-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-red-600">
          ${monthlyTotals.expense.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Monthly Expenses ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
        </p>
      </div>
    </div>
  );
};

export default Dashboard;