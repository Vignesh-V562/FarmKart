import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById, updateOrderStatus, acceptOrder, rejectOrder } from '../../api/dashboardApi';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaBox, FaCreditCard, FaTruck } from 'react-icons/fa';
import Invoice from '../../components/farmer/Invoice';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await fetchOrderById(orderId);
        setOrder(orderData);
        setSelectedStatus(orderData.status);
      } catch (e) {
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    try {
      const updatedOrder = await updateOrderStatus(orderId, selectedStatus);
      setOrder(updatedOrder);
    } catch (e) {
      setError('Failed to update order status.');
    }
  };

  const handleAcceptOrder = async () => {
    try {
      const updatedOrder = await acceptOrder(orderId);
      setOrder(updatedOrder);
    } catch (e) {
      setError('Failed to accept order.');
    }
  };

  const handleRejectOrder = async () => {
    try {
      const updatedOrder = await rejectOrder(orderId);
      setOrder(updatedOrder);
    } catch (e) {
      setError('Failed to reject order.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-2xl font-semibold text-gray-600">Loading Order Details...</p></div>;
  if (error) return <div className="p-10 text-red-700 bg-red-100 rounded-2xl shadow-lg">{error}</div>;
  if (!order) return <div className="p-10 text-center text-xl font-semibold">Order not found.</div>;

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * 0.1; // Example tax rate
  const shipping = 15.00; // Example shipping cost

  if (showInvoice) {
    return <Invoice order={order} />;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link to="/farmer/orders" className="text-gray-500 hover:text-gray-800 transition-colors">
          <FaArrowLeft className="text-3xl" />
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Order #{order._id.substring(0, 8)}...</h1>
          <p className="text-gray-600 mt-1 text-lg">Placed on {new Date(order.placedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Order Items */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><FaBox /> Order Items</h2>
            <div className="space-y-5">
              {order.items.map(item => (
                <div key={item.product._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <img src={item.product.imageUrl || 'https://via.placeholder.com/80'} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg" />
                    <div>
                      <p className="font-bold text-lg text-gray-800">{item.product.title}</p>
                      <p className="text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-800">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax (10%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between border-t-2 pt-4 mt-4 border-gray-200"><span className="font-bold text-xl">Total</span><span className="font-bold text-xl">${order.totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          {/* Customer Details */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><FaUser /> Customer</h2>
            <div className="space-y-3 text-lg">
              <p className="font-semibold text-gray-800">{order.customer.name}</p>
              <p className="text-gray-600">{order.customer.email}</p>
              <div className="flex items-start gap-3 pt-2">
                <FaMapMarkerAlt className="text-gray-400 mt-1.5" />
                <p className="text-gray-600">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Actions</h2>
            <div className="flex gap-4">
              {order.status === 'pending' && (
                <>
                  <button onClick={handleAcceptOrder} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-lg">Accept Order</button>
                  <button onClick={handleRejectOrder} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all text-lg">Reject Order</button>
                </>
              )}
              <button onClick={() => setShowInvoice(true)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-lg">Download Invoice</button>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><FaTruck /> Order Status</h2>
            <div className="space-y-4">
              <p className="text-lg font-semibold">Current Status: 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </p>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button 
                onClick={handleStatusUpdate}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-lg">
                Update Status
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><FaCreditCard /> Payment</h2>
            <p className="text-lg font-semibold">Status: 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.paymentStatus}
              </span>
            </p>
            <p className="text-gray-600 mt-3 text-lg">Method: {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
