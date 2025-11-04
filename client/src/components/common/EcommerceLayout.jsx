import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { buildAssetUrl } from '../../api/axios';
import { FaShoppingCart, FaSignOutAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import NotificationPanel from './NotificationPanel';

const EcommerceLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto w-full">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="px-6 h-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-700">Farmkart</h1>
            <div className="flex items-center gap-6">
              <NavLink
                to="/ecommerce"
                className={({ isActive }) => isActive ? "text-green-700 font-semibold" : "text-gray-700 hover:text-green-700"}
              >
                <span>Marketplace</span>
              </NavLink>
              <NavLink
                to="/ecommerce/my-rfqs"
                className={({ isActive }) => isActive ? "text-green-700 font-semibold" : "text-gray-700 hover:text-green-700"}
              >
                <span>My RFQs</span>
              </NavLink>
              <NavLink
                to="/ecommerce/analytics"
                className={({ isActive }) => isActive ? "text-green-700 font-semibold" : "text-gray-700 hover:text-green-700"}
              >
                <span>Analytics</span>
              </NavLink>
              <NavLink
                to="/ecommerce/invoices"
                className={({ isActive }) => isActive ? "text-green-700 font-semibold" : "text-gray-700 hover:text-green-700"}
              >
                <span>Invoices</span>
              </NavLink>
              <NavLink
                to="/ecommerce/cart"
                className={({ isActive }) => `flex items-center gap-2 font-medium ${isActive ? "text-green-700" : "text-gray-600 hover:text-gray-800"}`}
              >
                <FaShoppingCart />
                <span>Cart</span>
              </NavLink>
              <NotificationPanel /> {/* Add NotificationPanel here */}
              <button
                onClick={() => navigate(user?.role === 'business' ? '/ecommerce/profile' : `/buyer/${user._id}`)}
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span className="hidden sm:block text-sm text-gray-700 font-medium">
                  {user?.fullName || 'Profile'}
                </span>
                {user?.profilePicture ? (
                  <img
                    src={buildAssetUrl(user.profilePicture)}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <FaUser className="w-8 h-8 rounded-full bg-gray-300 border p-1" />
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-100 font-semibold px-3 py-2 rounded-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EcommerceLayout;
