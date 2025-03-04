import React, { useEffect, useState } from 'react';
import { Transaction, MonthlyTotal } from '../types';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { calculateMonthlyTotals, getTopSpendingCategories, calculateMonthlyTrend } from '../utils/calculations';
import { getCategories } from '../utils/storage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

interface ChartsProps {
  transactions: Transaction[];
}

const Charts: React.FC<ChartsProps> = ({ transactions }) => {
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal>({
    income: 0,
    expense: 0,
    balance: 0,
    categories: {},
  });
  
  const [topSpendingCategories, setTopSpendingCategories] = useState<{ category: string; amount: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; income: number; expense: number }[]>([]);
  
  const { month, year } = getCurrentMonthYear();
  const categories = getCategories();
  
  useEffect(() => {
    const totals = calculateMonthlyTotals(transactions, month, year);
    setMonthlyTotals(totals);
    
    const topCategories = getTopSpendingCategories(transactions, month, year, 5);
    setTopSpendingCategories(topCategories);
    
    const trend = calculateMonthlyTrend(transactions, month, year, 6);
    setMonthlyTrend(trend);
  }, [transactions, month, year]);
  
  // Prepare data for pie chart
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const pieData = {
    labels: topSpendingCategories.map(c => c.category),
    datasets: [
      {
        data: topSpendingCategories.map(c => c.amount),
        backgroundColor: topSpendingCategories.map(c => {
          const category = expenseCategories.find(cat => cat.name === c.category);
          return category ? category.color : '#ccc';
        }),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for bar chart
  const barData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [monthlyTotals.income, monthlyTotals.expense],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for line chart
  const lineData = {
    labels: monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map(m => m.income),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map(m => m.expense),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
    ],
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Spending Categories</h3>
        {topSpendingCategories.length > 0 ? (
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No expense data available
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
        <div className="h-64">
          <Bar
            data={barData}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trend</h3>
        <div className="h-64">
          <Line
            data={lineData}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Charts;