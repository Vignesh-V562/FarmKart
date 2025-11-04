import React from 'react';
import Dashboard from '../../components/business/analytics/Dashboard';
import SpendAnalysis from '../../components/business/analytics/SpendAnalysis';

const AnalyticsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <Dashboard />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Spend Analysis</h2>
        <SpendAnalysis />
      </div>
    </div>
  );
};

export default AnalyticsPage;
