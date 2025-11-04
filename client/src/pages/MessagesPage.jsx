import React, { useState, useEffect } from 'react';
import { getConversations, getMessagesForConversation, createMessage } from '../api/messageApi';
import { useAuth } from '../hooks/useAuth';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const convos = await getConversations();
        setConversations(convos);
      } catch (err) {
        setError('Failed to fetch conversations.');
        console.error(err);
      }
      setLoading(false);
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        try {
          const msgs = await getMessagesForConversation(selectedConversation._id);
          setMessages(msgs);
        } catch (err) {
          setError('Failed to fetch messages.');
          console.error(err);
        }
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const recipient = selectedConversation.participants.find(p => p._id !== user._id);
      const msg = await createMessage({ recipientId: recipient._id, body: newMessage });
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex">
      <div className="w-full sm:w-96 bg-white rounded-lg shadow-md p-6 mr-4 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-4">Conversations</h1>
        <ul>
          {conversations.map(convo => (
            <li key={convo._id} onClick={() => setSelectedConversation(convo)} className="p-2 hover:bg-gray-200 cursor-pointer rounded-lg">
              {convo.participants.find(p => p._id !== user._id)?.fullName || convo.participants.find(p => p._id !== user._id)?.companyName}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 bg-white rounded-lg shadow-md p-6 flex flex-col">
        {selectedConversation ? (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {selectedConversation.participants.find(p => p._id !== user._id)?.fullName || selectedConversation.participants.find(p => p._id !== user._id)?.companyName}
            </h1>
            <div className="flex-grow overflow-y-auto mb-4">
              {messages.map(msg => (
                <div key={msg._id} className={`p-2 my-2 rounded-lg ${msg.sender === user._id ? 'bg-green-200 ml-auto' : 'bg-gray-200'}`}>
                  <p>{msg.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage}>
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow border rounded-l-lg p-2"
                  placeholder="Type a message..."
                />
                <button type="submit" className="bg-green-600 text-white px-4 rounded-r-lg">Send</button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
