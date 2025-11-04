import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../../api/dashboardApi';
import { FaEye } from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await fetchOrders();
        setOrders(ordersData);
      } catch (e) {
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const orderStatuses = ['All', 'Pending', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

  if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-2xl font-semibold text-gray-600">Loading Orders...</p></div>;
  if (error) return <div className="p-10 text-red-700 bg-red-100 rounded-2xl shadow-lg">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600 mt-2 text-lg">View and manage your customer orders.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-md">
        <div className="flex border-b border-gray-200 mb-6">
          {orderStatuses.map(status => (
            <button 
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-6 py-3 text-lg font-semibold transition-colors duration-300 ${
                activeTab === status 
                  ? 'border-b-4 border-green-600 text-green-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}>
              {status}
            </button>
          ))}
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-4 text-lg font-semibold text-gray-600">Order ID</th>
              <th className="pb-4 text-lg font-semibold text-gray-600">Customer</th>
              <th className="pb-4 text-lg font-semibold text-gray-600">Date</th>
              <th className="pb-4 text-lg font-semibold text-gray-600">Total</th>
              <th className="pb-4 text-lg font-semibold text-gray-600">Status</th>
              <th className="pb-4 text-lg font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-5 text-gray-800 font-medium">
                  <Link to={`/farmer/orders/${order._id}`} className="text-blue-600 hover:underline">
                    #{order._id.substring(0, 8)}...
                  </Link>
                </td>
                <td className="py-5 text-gray-800">{order.customer?.name || 'N/A'}</td>
                <td className="py-5 text-gray-600">{new Date(order.placedAt).toLocaleDateString()}</td>
                <td className="py-5 font-bold text-gray-800">${order.totalAmount.toFixed(2)}</td>
                <td className="py-5">
                  <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-5 flex items-center gap-4">
                  <Link to={`/farmer/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 transition-colors"><FaEye className="text-xl" /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <p className="text-center py-16 text-gray-500 text-lg">No orders found for this status.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
