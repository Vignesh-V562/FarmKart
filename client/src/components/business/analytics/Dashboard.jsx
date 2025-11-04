import React, { useEffect, useState } from 'react';
import { getKeyMetrics } from '../../../api/analyticsApi';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    orderVolume: 0,
    priceTrend: { percentage: 0, direction: 'up' },
    topSupplier: 'N/A',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getKeyMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch key metrics', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Spend</h3>
        <p className="text-3xl font-bold text-gray-900">₹{metrics.totalSpend.toLocaleString()}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Order Volume</h3>
        <p className="text-3xl font-bold text-gray-900">{metrics.orderVolume}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Price Trend</h3>
        <p className={`text-3xl font-bold ${metrics.priceTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {metrics.priceTrend.direction === 'up' ? '↑' : '↓'} {metrics.priceTrend.percentage}%
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Top Supplier</h3>
        <p className="text-3xl font-bold text-gray-900">{metrics.topSupplier}</p>
      </div>
    </div>
  );
};

export default Dashboard;
