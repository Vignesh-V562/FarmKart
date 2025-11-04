import api from './axios';

export const fetchDashboardSummary = () => api.get('/farmer/dashboard/summary').then(r => r.data);
export const fetchDashboardRecent = () => api.get('/farmer/dashboard/recent').then(r => r.data);
export const fetchDashboardAlerts = () => api.get('/farmer/dashboard/alerts').then(r => r.data);
export const togglePublishProduct = (id) => api.patch(`/farmer/dashboard/products/${id}/publish`).then(r => r.data);
export const fetchOrders = () => api.get('/farmer/dashboard/orders').then(r => r.data);
export const fetchOrderById = (orderId) => api.get(`/orders/${orderId}`).then(r => r.data);
export const updateOrderStatus = (orderId, status) => api.patch(`/farmer/dashboard/orders/${orderId}/status`, { status }).then(r => r.data);
export const acceptOrder = (orderId) => api.patch(`/farmer/dashboard/orders/${orderId}/accept`).then(r => r.data);
export const rejectOrder = (orderId) => api.patch(`/farmer/dashboard/orders/${orderId}/reject`).then(r => r.data);


