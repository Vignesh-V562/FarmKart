import api from './axios';

// --- Product APIs ---

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const fetchAllProducts = async (keyword = '') => {
  const response = await api.get(`/products/all?keyword=${keyword}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const updateProductStatus = async (productId, status) => {
  const response = await api.patch(`/products/${productId}/status`, { status });
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const fetchProductTitles = async () => {
  const response = await api.get('/products/titles');
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.url;
};

// --- Business Requirement (RFQ) APIs ---

// Fetch all public RFQs for the marketplace
export const fetchBusinessRequirements = async (keyword = '') => {
  const response = await api.get(`/rfq/browse?keyword=${keyword}`);
  return response.data;
};

// Create a new RFQ
export const createRfq = async (rfqData) => {
    const response = await api.post('/rfq', rfqData);
    return response.data;
};

// Get RFQs for the logged-in business
export const getMyRfqs = async () => {
    const response = await api.get('/rfq');
    return response.data;
};

// Get bids for the logged-in farmer
export const getMyBids = async () => {
    const response = await api.get('/bids/mybids');
    return response.data;
};

// Get a single RFQ by ID
export const getRfqById = async (id) => {
    const response = await api.get(`/rfq/${id}`);
    return response.data;
};

// Submit a bid for an RFQ
export const submitBid = async (id, bidData) => {
    const response = await api.post(`/rfq/${id}/bid`, bidData);
    return response.data;
};

// Accept a bid for an RFQ
export const acceptBid = async (id, bidId) => {
    const response = await api.post(`/rfq/${id}/accept/${bidId}`);
    return response.data;
};