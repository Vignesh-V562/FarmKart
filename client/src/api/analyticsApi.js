import api from './axios';

export const getKeyMetrics = async () => {
  try {
    const response = await api.get('/analytics/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching key metrics', error);
    throw error;
  }
};

export const getSpendByCategory = async () => {
  try {
    const response = await api.get('/analytics/spend-by-category');
    return response.data;
  } catch (error) {
    console.error('Error fetching spend by category', error);
    throw error;
  }
};

export const getSpendOverTime = async () => {
  try {
    const response = await api.get('/analytics/spend-over-time');
    return response.data;
  } catch (error) {
    console.error('Error fetching spend over time', error);
    throw error;
  }
};

export const getDetailedReport = async () => {
  try {
    const response = await api.get('/analytics/detailed-report');
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed report', error);
    throw error;
  }
};

export const exportCsv = async () => {
  try {
    const response = await api.get('/analytics/export-csv', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Error exporting CSV', error);
    throw error;
  }
};
