import api from './axios';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addItemToCart = async (productId, quantity) => {
  const response = await api.post('/cart', { productId, quantity });
  return response.data;
};

export const removeItemFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};
