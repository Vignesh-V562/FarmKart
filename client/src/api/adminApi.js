import api from './axios';

export const getAllUsers = async () => {
  const { data } = await api.get('/api/admin/users');
  return data;
};

export const verifyUser = async (id) => {
    const { data } = await api.put(`/api/admin/users/${id}/verify`);
    return data;
};

export const updateUser = async (id, userData) => {
    const { data } = await api.put(`/api/admin/users/${id}`, userData);
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/api/admin/users/${id}`);
    return data;
};