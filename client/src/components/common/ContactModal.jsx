import React, { useState } from 'react';
import { createMessage } from '../../api/messageApi';

const ContactModal = ({ recipient, onClose, onMessageSent }) => {
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createMessage({ recipientId: recipient._id, body });
      onMessageSent();
      onClose();
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Contact {recipient.fullName || recipient.companyName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="body" className="block text-gray-700 font-bold mb-2">Message</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows="4"
              required
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-2">Cancel</button>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white py-2 px-4 rounded-lg">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
