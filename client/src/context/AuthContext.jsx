import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        if (Object.prototype.hasOwnProperty.call(parsed, 'profilePicture') && !parsed.profilePicture) {
          parsed.profilePicture = null;
        }
        setUser(parsed);
      } catch (err) {
        // if parsing fails, just clear stored user
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setLoading(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('Logged in user data:', userData);
    switch (userData.role) {
      case 'farmer':
        navigate('/farmer/dashboard');
        break;
      case 'business':
        navigate('/ecommerce');
        break;
      case 'customer':
        navigate('/ecommerce');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
    setLoading(false);
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    setLoading(false);
  };

  const updateUser = useCallback((newUserData) => {
    setUser(currentUser => {
      // Normalize profilePicture: treat empty string as null to avoid stale image srcs
      const normalized = { ...newUserData };
      if (Object.prototype.hasOwnProperty.call(normalized, 'profilePicture') && !normalized.profilePicture) {
        // If explicitly set to empty string or falsy, remove it so UI shows placeholder
        normalized.profilePicture = null;
      }

      const updatedUser = { ...currentUser, ...normalized };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
