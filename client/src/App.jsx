import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import ProductManagement from './pages/farmer/ProductManagement';
import ProfilePage from './pages/farmer/ProfilePage';
import OrdersPage from './pages/farmer/OrdersPage';
import OrderDetailPage from './pages/farmer/OrderDetailPage';
import FarmerLayout from './components/farmer/FarmerLayout';
import EcommerceLayout from './components/common/EcommerceLayout';
import EcommercePage from './pages/EcommercePage';
import CartPage from './pages/CartPage';
import QuotesPage from './pages/QuotesPage';
import MessagesPage from './pages/MessagesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import BuyerProfilePage from './pages/BuyerProfilePage';
import UserManagementPage from './pages/admin/UserManagementPage';
import MyRFQsPage from './pages/business/MyRFQsPage';
import CreateRFQPage from './pages/business/CreateRFQPage';
import RFQDetailsPage from './pages/business/RFQDetailsPage.tsx';
import BrowseRFQsPage from './pages/farmer/rfq/BrowseRFQsPage.tsx';
import MyBidsPage from './pages/farmer/rfq/MyBidsPage';
import FarmerRFQDetailsPage from './pages/farmer/rfq/FarmerRFQDetailsPage';
import BusinessProfilePage from './pages/business/ProfilePage'; // Import the new page
import AnalyticsPage from './pages/business/GeneralAnalyticsPage';
import InvoiceManagementPage from './pages/business/InvoiceManagementPage';
import "./App.css"
import api from './api/axios';
import { useAuth } from './hooks/useAuth';

function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
        <Route path="/" element={<AuthPage />} />

        {/* Farmer Routes */}
        <Route path="/farmer" element={<PrivateRoute roles={['farmer']} />}>
          <Route element={<FarmerLayout />}>
            <Route index element={<FarmerDashboard />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="ecommerce" element={<EcommercePage />} />
            <Route path="browse-rfqs" element={<BrowseRFQsPage />} />
            <Route path="my-bids" element={<MyBidsPage />} />
            <Route path="rfqs/:id" element={<FarmerRFQDetailsPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
          <Route index element={<UserManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>

        {/* E-commerce/Marketplace Route for Business and Customer */}
        <Route path="/ecommerce" element={<PrivateRoute roles={['business', 'customer']} />}>
          <Route element={<EcommerceLayout />}>
            <Route index element={<EcommercePage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="product/:id" element={<ProductDetailsPage />} />
            <Route path="farmer/:id" element={<FarmerProfilePage />} />
            <Route path="buyer/:id" element={<BuyerProfilePage />} />
            <Route path="my-rfqs" element={<MyRFQsPage />} />
            <Route path="rfqs/new" element={<CreateRFQPage />} />
            <Route path="rfqs/:id" element={<RFQDetailsPage />} />
            <Route path="profile" element={<BusinessProfilePage />} /> {/* Add the new route here */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="invoices" element={<InvoiceManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
