import React from 'react';
import { DollarSign } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign size={28} className="text-white" />
          <h1 className="text-2xl font-bold">Budget Tracker</h1>
        </div>
        <div className="text-sm">
          <p>Your financial data is stored locally in your browser</p>
        </div>
      </div>
    </header>
  );
};

export default Header;