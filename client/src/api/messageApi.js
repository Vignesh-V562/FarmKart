import api from './axios';

export const createMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getMessagesForConversation = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  return response.data;
};
