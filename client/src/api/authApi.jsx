import instance from './axios';

// registerUser expects `data` object from your form. It returns { token, user }
export const registerUser = async (data) => {
  // data may already have arrays (frontend splits comma-separated fields).
  // If any array fields are strings, leave it — server normalizes.
  const res = await instance.post('/auth/register', data);
  return res.data; // { token, user }
};

// loginUser expects { email, password }
export const loginUser = async (data) => {
  const res = await instance.post('/auth/login', data);
  return res.data; // { token, user }
};

// optional helper to get current user (requires token)
export const verifyEmail = async (token) => {
  const res = await instance.get(`/auth/verify/${token}`);
  return res.data;
};

// logout user
export const logoutUser = async () => {
  const res = await instance.post('/auth/logout');
  return res.data;
};

// Get current user
export const getCurrentUser = async () => {
  const res = await instance.get('/auth/me');
  return res.data;
};