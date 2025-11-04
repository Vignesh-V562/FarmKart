import api from './axios';

export const getQuotesForFarmer = async () => {
  const { data } = await api.get('/bids/mybids');
  return data;
};

export const getQuotesForRequirement = async (requirementId) => {
  const { data } = await api.get(`/rfq/${requirementId}/bids`);
  return data;
};

export const updateQuoteStatus = async (rfqId, bidId) => {
  const { data } = await api.post(`/rfq/${rfqId}/accept/${bidId}`);
  return data;
};
