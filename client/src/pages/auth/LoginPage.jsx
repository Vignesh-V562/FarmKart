import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      const { token, user } = await loginUser(data);
      login(user, token);
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.role === 'business' || user.role === 'customer') {
        navigate('/ecommerce');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center auth-page-background px-4">
      <div className="w-full max-w-md">
        <div className="transparent-card shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-semibold text-center text-white mb-6">
            Login
          </h1>

          {/* Login Form */}
          <LoginForm onSubmit={handleSubmit} />

          {/* Redirect to register */}
          <p className="mt-6 text-center text-gray-300 text-sm">
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-green-400 font-medium hover:underline focus:outline-none"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;