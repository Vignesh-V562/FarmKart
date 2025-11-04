import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('/products', config);
      setProducts(data);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const addProduct = useCallback(async (productData) => {
    if (!user?.token) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('/products', productData, config);
      setProducts(prev => [...prev, data]);
      return data;
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const updateProduct = useCallback(async (productId, productData) => {
    if (!user?.token) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(`/products/${productId}`, productData, config);
      setProducts(prev => prev.map(product =>
        product._id === productId ? data : product
      ));
      return data;
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const updateProductStatus = useCallback(async (productId, status) => {
    if (!user?.token) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.patch(`/products/${productId}/status`, { status }, config);
      setProducts(prev => prev.map(product =>
        product._id === productId ? data : product
      ));
      return data;
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const deleteProduct = useCallback(async (productId) => {
    if (!user?.token) throw new Error("User not authenticated");
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/products/${productId}`, config);
      setProducts(prev => prev.filter(product => product._id !== productId));
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};