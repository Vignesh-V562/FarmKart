import api from './axios';

export const getProfile = () => api.get('/profile').then(r => r.data);

export const updateProfile = (data) => api.put('/profile', data).then(r => r.data);

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(r => r.data.url);
};

export const changePassword = (passwords) => api.put('/profile/change-password', passwords).then(r => r.data);

// Get all buyer profiles for the e-commerce page
export const fetchBuyerProfiles = async (keyword = '') => {
  const response = await api.get(`/profile/buyers?keyword=${keyword}`);
  return response.data;
};

export const fetchFarmers = async (keyword = '') => {
  const response = await api.get(`/profile/farmers?keyword=${keyword}`);
  return response.data;
};
