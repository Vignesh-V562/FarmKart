import React, { useState, useEffect } from 'react';
import { getCart, removeItemFromCart, addItemToCart } from '../api/cartApi';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        setError('Failed to fetch cart.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchCart();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      const updatedCart = await removeItemFromCart(productId);
      setCart(updatedCart);
    } catch (err) {
      setError('Failed to remove item from cart.');
      console.error(err);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const updatedCart = await addItemToCart(productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      setError('Failed to update item quantity.');
      console.error(err);
    }
  };

  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
        <Link to="/ecommerce" className="border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors duration-200">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {cart.items.map(item => (
            <div key={item.product._id} className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center">
                <img src={item.product.images[0]} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg mr-4" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{item.product.title}</h2>
                  <p className="text-gray-600">₹{item.product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                  <FaMinus />
                </button>
                <span className="px-4 font-bold">{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                  <FaPlus />
                </button>
                <button onClick={() => handleRemoveItem(item.product._id)} className="ml-6 text-red-500 hover:text-red-700">
                  <FaTrash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold">₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold">$0.00</span>
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
