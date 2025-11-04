import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa'; // Add FaGoogle here

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-green-400 mb-2">Welcome Back</h2>
      <p className="text-gray-300 mb-6">Please enter your details to sign in.</p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label="Email Address / Mobile"
          placeholder="you@example.com"
          icon={<FaEnvelope />}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="login-password"
          type="password"
          label="Password"
          placeholder="••••••••"
          icon={<FaLock />}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-500 focus:ring-green-400 border-gray-600 rounded bg-gray-700 bg-opacity-50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm font-medium text-green-400 hover:text-green-500">
            Forgot Password?
          </a>
        </div>

        <Button type="submit" className={submitting ? 'opacity-70 cursor-not-allowed' : ''}>
          {submitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-300 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <Button variant="google">
        <FaGoogle />
        <span>Sign in with Google</span>
      </Button>
    </div>
  );
};

export default LoginForm;