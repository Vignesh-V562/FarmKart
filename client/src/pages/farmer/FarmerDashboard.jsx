import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary, fetchDashboardRecent, fetchDashboardAlerts, togglePublishProduct } from '../../api/dashboardApi';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaPlus, FaUpload, FaBell, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaCreditCard, FaChartBar } from 'react-icons/fa';
import { buildAssetUrl } from '../../api/axios';

const KpiCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center">
    <div className="flex-shrink-0">
      {React.cloneElement(icon, { className: `text-${color}-600 text-4xl` })}
    </div>
    <div className="ml-4 flex-1 min-w-0">
      <p className="text-gray-500 font-medium text-lg truncate">{title}</p>
      <p className="text-3xl font-bold text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

const QuickActionButton = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
  >
    {icon}
    <span className="text-lg">{label}</span>
  </button>
);

const AlertItem = ({ icon, text, color }) => (
    <div className="flex items-center gap-4 text-lg"> {/* Simplified className */}
      {React.cloneElement(icon, { className: `text-${color}-500 text-2xl` })}
      <span className="font-medium">{text}</span>
    </div>
  );

const FarmerDashboard = () => {
  const [summary, setSummary] = useState({ todaysOrders: 0, pendingOrders: 0, revenueThisWeek: 0, revenueThisMonth: 0, availableStock: 0 });
  const [recent, setRecent] = useState({ products: [], messages: [] });
  const [alerts, setAlerts] = useState({ lowStock: [], pendingVerification: 0, paymentIssues: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [summaryData, recentData, alertsData] = await Promise.all([
          fetchDashboardSummary(),
          fetchDashboardRecent(),
          fetchDashboardAlerts(),
        ]);
        setSummary(summaryData);
        setRecent(recentData);
        setAlerts(alertsData);
      } catch (e) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleTogglePublish = async (product) => {
    try {
      const updatedProduct = await togglePublishProduct(product._id);
      setRecent(prev => ({ 
        ...prev, 
        products: prev.products.map(p => p._id === updatedProduct._id ? updatedProduct : p) 
      }));
    } catch (e) {
      console.error('Failed to toggle product status', e);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-2xl font-semibold text-gray-600">Loading Dashboard...</p></div>;
  if (error) return <div className="p-10 text-red-700 bg-red-100 rounded-2xl shadow-lg">{error}</div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Welcome Back, Farmer!</h1>
          <p className="text-gray-600 mt-2 text-xl">Here’s a snapshot of your farm’s performance.</p>
        </div>
        <div className="flex gap-5">
          <QuickActionButton label="Create Product" icon={<FaPlus />} onClick={() => navigate('/farmer/products?add=true')} />
          <QuickActionButton label="View Orders" icon={<FaArrowRight />} onClick={() => navigate('/farmer/orders')} />
          <QuickActionButton label="Upload Inventory CSV" icon={<FaUpload />} onClick={() => document.getElementById('csvInput').click()} />
          <input id="csvInput" type="file" accept=".csv" className="hidden" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <KpiCard title="Today's Orders" value={summary.todaysOrders} icon={<FaBox />} color="green" />
        <KpiCard title="Pending Orders" value={summary.pendingOrders} icon={<FaBox />} color="yellow" />
        <KpiCard title="Weekly Revenue" value={`$${summary.revenueThisWeek.toFixed(2)}`} icon={<FaChartBar />} color="blue" />
        <KpiCard title="Monthly Revenue" value={`$${summary.revenueThisMonth.toFixed(2)}`} icon={<FaChartBar />} color="indigo" />
        <KpiCard title="Available Stock" value={summary.availableStock} icon={<FaBox />} color="purple" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Recently Added Products</h2>
          <div className="space-y-5">
            {recent.products.length > 0 ? (
              recent.products.map(p => (
                <div key={p._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-200">
                  <div className="flex items-center gap-5">
                    {p.images && p.images[0] ? (
                      <img src={buildAssetUrl(p.images[0])} alt={p.title} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl shadow-sm bg-gray-200" />
                    )}
                    <div>
                      <p className="font-bold text-xl text-gray-800">{p.title}</p>
                      <p className="text-md text-gray-500">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="font-bold text-xl text-gray-800">${p.price}</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={!!p.published} onChange={() => handleTogglePublish(p)} className="form-checkbox h-6 w-6 text-green-600 rounded focus:ring-green-500" />
                      <span className="text-md font-semibold">{p.published ? 'Published' : 'Draft'}</span> {/* Simplified className */}
                    </label>
                    <button onClick={() => navigate(`/farmer/products?edit=${p._id}`)} className="text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors">Edit</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10 text-lg">No recent products. Add one to see it here!</p>
            )}
          </div>
        </div>

        {/* Alerts & Messages */}
        <div className="space-y-12">
          {/* Alerts */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-4"><FaBell className="text-yellow-500" />Alerts</h2>
            <div className="space-y-5">
              {alerts.lowStock.length > 0 && <AlertItem icon={<FaExclamationTriangle />} text={`${alerts.lowStock.length} products with low stock.`} color="yellow" />}
              {alerts.pendingVerification > 0 && <AlertItem icon={<FaCheckCircle />} text={`${alerts.pendingVerification} items pending verification.`} color="blue" />}
              {alerts.paymentIssues > 0 && <AlertItem icon={<FaCreditCard />} text={`${alerts.paymentIssues} payment issues.`} color="red" />}
              {alerts.lowStock.length === 0 && alerts.pendingVerification === 0 && alerts.paymentIssues === 0 && (
                <p className="text-gray-500 text-lg">All clear! No new alerts.</p>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Messages</h2>
            <div className="space-y-6">
              {recent.messages.length > 0 ? (
                recent.messages.map(m => (
                  <div key={m._id} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 cursor-pointer border border-gray-200">
                    <p className="font-bold text-gray-800 truncate text-lg">{m.subject}</p>
                    <p className="text-md text-gray-600 line-clamp-2 mt-2">{m.body}</p>
                    <button className="text-md text-green-600 hover:underline mt-3 font-semibold flex items-center gap-2">Read More <FaArrowRight /></button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-lg">You have no new messages.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;