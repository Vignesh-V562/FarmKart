import api from './axios';

export const createRFQ = async (rfqData) => {
  const { data } = await api.post('/rfq', rfqData);
  return data;
};

export const getMyRFQs = async () => {
  const { data } = await api.get('/rfq');
  return data;
};

export const getRFQDetails = async (rfqId) => {
  const { data } = await api.get(`/rfq/${rfqId}`);
  return data;
};

export const browseRFQs = async () => {
  const { data } = await api.get('/rfq/browse');
  return data;
};

export const submitBid = async (rfqId, bidData) => {
  const { data } = await api.post(`/rfq/${rfqId}/bid`, bidData);
  return data;
};

export const getBidsForRFQ = async (rfqId) => {
  const { data } = await api.get(`/rfq/${rfqId}/bids`);
  return data;
};

export const acceptBid = async (rfqId, bidId) => {
  const { data } = await api.post(`/rfq/${rfqId}/accept/${bidId}`);
  return data;
};

export const fetchUniqueRegions = async () => {
  const { data } = await api.get('/rfq/regions');
  return data;
};

export const fetchTransportMethods = async () => {
  const { data } = await api.get('/rfq/transport-methods');
  return data;
};
