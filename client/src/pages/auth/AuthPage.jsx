import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { loginUser, registerUser } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Login Submit
  const handleLogin = async (data) => {
    try {
      const { token, user } = await loginUser(data);
      login(user, token);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Handle Register Submit
  const handleRegister = async (data) => {
    // The RegistrationForm component now handles success/error UI.
    // This function just needs to pass the promise from the API call.
    return registerUser(data);
  };

  return (
    <div className="w-full auth-page-background flex items-center justify-center font-sans py-12 min-h-screen">
      <div className="w-full max-w-6xl mx-auto rounded-xl shadow-lg flex transparent-card overflow-hidden" style={{ minHeight: '80vh' }}>
        
        {/* Left Side: Form Panel */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            
            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-center font-medium transition-all duration-200 focus:outline-none ${
                  activeTab === 'login'
                    ? 'text-white bg-green-500 rounded-l-lg'
                    : 'text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-l-lg'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 text-center font-medium transition-all duration-200 focus:outline-none ${
                  activeTab === 'register'
                    ? 'text-white bg-green-500 rounded-r-lg'
                    : 'text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-r-lg'
                }`}
              >
                Register
              </button>
            </div>

            {/* Conditional Rendering of Forms */}
            {activeTab === 'login' ? (
              <LoginForm onSubmit={handleLogin} />
            ) : (
              <RegistrationForm onSubmit={handleRegister} />
            )}
          </div>
        </div>

        {/* Right Side: Hero Panel */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-end p-12 text-white rounded-r-xl relative"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Welcome to FarmCart</h1>
            <p className="text-lg text-gray-200">
              Connecting local farms directly to your table. Freshness guaranteed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
