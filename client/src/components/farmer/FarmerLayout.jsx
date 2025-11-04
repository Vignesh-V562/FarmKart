import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { buildAssetUrl } from '../../api/axios';
import { ProductProvider } from '../../context/ProductContext';
import { FaHome, FaBox, FaSignOutAlt, FaShoppingBag, FaQuoteLeft, FaEnvelope, FaUser, FaShoppingCart, FaSearch, FaGavel } from 'react-icons/fa';
import NotificationPanel from '../common/NotificationPanel';

const FarmerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-100 via-green-200 to-teal-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-700">Farmkart</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/farmer/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaHome className="mr-3 text-xl" />
            Dashboard
          </NavLink>
          <NavLink
            to="/farmer/products" // Updated route
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaBox className="mr-3 text-xl" />
            Product Management
          </NavLink>
          <NavLink
            to="/farmer/orders"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaShoppingBag className="mr-3 text-xl" />
            Orders
          </NavLink>
          <NavLink
            to="/farmer/quotes"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaQuoteLeft className="mr-3 text-xl" />
            Quotes
          </NavLink>
          <NavLink
            to="/farmer/browse-rfqs"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaSearch className="mr-3 text-xl" />
            Browse RFQs
          </NavLink>
          <NavLink
            to="/farmer/my-bids"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaGavel className="mr-3 text-xl" />
            My Bids
          </NavLink>
          <NavLink
            to="/farmer/messages"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaEnvelope className="mr-3 text-xl" />
            Messages
          </NavLink>
          <NavLink
            to="/farmer/ecommerce"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-100 ${isActive ? 'bg-green-100 text-green-700 font-semibold' : ''}`
            }
          >
            <FaShoppingCart className="mr-3 text-xl" />
            Ecommerce
          </NavLink>

        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-100 font-semibold"
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="px-6 h-16 flex items-center justify-end">
            <NotificationPanel /> {/* Add NotificationPanel here */}
            <button
              onClick={() => navigate('/farmer/profile')}
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
                <span className="w-10 h-10 rounded-full bg-gray-300 border inline-block" />
              )}
            </button>
          </div>
        </div>
        <div className="p-6">
          <ProductProvider>
            <Outlet />
          </ProductProvider>
        </div>
      </main>
    </div>
  );
};

export default FarmerLayout;
