import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { registerUser } from '../../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    // Process comma-separated strings into arrays
    ['photos', 'crops', 'certifications', 'produceRequired', 'deliveryAddresses'].forEach((field) => {
      if (data[field]) {
        data[field] = data[field].split(',').map((v) => v.trim()).filter(Boolean);
      }
    });
    // The component calling this function will handle the try/catch block.
    // We just pass the promise along.
    return registerUser(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center auth-page-background px-4">
      <div className="w-full max-w-3xl transparent-card shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-center text-white mb-6">
          Register
        </h1>
        <RegistrationForm onSubmit={handleSubmit} />
        <p className="mt-6 text-center text-gray-300 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-400 font-medium hover:underline focus:outline-none"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;