import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import { Transaction } from './types';
import { initializeStorage, getTransactions } from './utils/storage';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const refreshData = () => {
    setTransactions(getTransactions());
  };
  
  useEffect(() => {
    // Initialize local storage with default data if needed
    initializeStorage();
    
    // Load transactions from local storage
    refreshData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Dashboard transactions={transactions} refreshData={refreshData} />
        
        <TransactionForm refreshData={refreshData} />
        
        <Charts transactions={transactions} />
        
        <TransactionList transactions={transactions} refreshData={refreshData} />
      </main>
      
      <footer className="bg-white py-4 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>Budget Tracker App - Your data is stored locally in your browser</p>
        </div>
      </footer>
    </div>
  );
}

export default App;