import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleCard from '../common/RoleCard';
import Input from '../common/Input';
import Button from '../common/Button';
import FarmerFields from './FarmerFields';
import BusinessFields from './BusinessFields';
import { FaUser, FaEnvelope, FaMobileAlt, FaLock, FaTractor, FaBuilding, FaShoppingCart } from 'react-icons/fa';

const RegistrationForm = ({ onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ role });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await onSubmit(formData);
      setMessage('Registered successfully. Please check your email to verify your account.');
      setError('');
    } catch (err) {
      setError('Account creation failed. Please try again.');
      setMessage('');
      console.error(err); 
    }
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case 'farmer':
        return <FarmerFields onChange={handleChange} />;
      case 'business':
        return <BusinessFields onChange={handleChange} />;
      default:
        return null;
    }
  };

  if (!selectedRole) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-green-400 mb-2">Join Us Today</h2>
        <p className="text-gray-300 mb-6">First, tell us who you are.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RoleCard icon={<FaTractor />} title="Farmer" description="Sell your fresh produce directly."
            isSelected={selectedRole === 'farmer'} onClick={() => handleRoleSelect('farmer')} />
          <RoleCard icon={<FaBuilding />} title="Business" description="Source produce for your company."
            isSelected={selectedRole === 'business'} onClick={() => handleRoleSelect('business')} />
          <RoleCard icon={<FaShoppingCart />} title="Customer" description="Buy fresh from local farms."
            isSelected={selectedRole === 'customer'} onClick={() => handleRoleSelect('customer')} />
        </div>
      </div>
    );
  }

  return (
    <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
      {message && <div className="mb-4 text-center text-green-400 font-semibold bg-green-900 bg-opacity-50 p-3 rounded-md">{message}</div>}
      {error && <div className="mb-4 text-center text-red-400 font-semibold bg-red-900 bg-opacity-50 p-3 rounded-md">{error}</div>}
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-green-400">
          Create a {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account
        </h2>
        <button
          onClick={() => setSelectedRole(null)}
          type="button"
          className="ml-auto text-sm font-medium text-green-400 hover:underline"
        >
          Change Role
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto pr-4" onChange={handleChange}>
        {/* Common Fields */}
        <h3 className="text-base font-semibold text-gray-300 mb-4 border-b border-gray-500 pb-2">
          Basic Information
        </h3>
        <Input id="fullName" label="Full Name" placeholder="John Doe" icon={<FaUser />} required />
        <Input id="email" type="email" label="Email Address" placeholder="you@example.com" icon={<FaEnvelope />} required />
        <Input id="mobile" label="Mobile Number" placeholder="9876543210" icon={<FaMobileAlt />} required />
        <Input id="password" type="password" label="Password" placeholder="••••••••" icon={<FaLock />} required />

        {/* Role Specific Fields */}
        {renderRoleSpecificFields()}

        {/* Customer Specific Fields */}
        {selectedRole === 'customer' && (
          <>
            <h3 className="text-base font-semibold text-gray-300 mt-6 mb-4 border-b border-gray-500 pb-2">
              Delivery Information
            </h3>
            <Input id="deliveryAddress" label="Default Delivery Address" placeholder="123 Main St, Anytown" />
          </>
        )}
      </div>

      <div className="mt-8">
        <Button type="submit">Create Account</Button>
      </div>
    </form>
  );
};

export default RegistrationForm;
