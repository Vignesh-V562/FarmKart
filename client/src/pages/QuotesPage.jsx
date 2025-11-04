import React, { useState, useEffect } from 'react';
import { getQuotesForFarmer, getQuotesForRequirement, updateQuoteStatus } from '../api/quoteApi.js';
import { useAuth } from '../hooks/useAuth';

const QuotesPage = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user.role === 'farmer') {
          const farmerQuotes = await getQuotesForFarmer();
          setQuotes(farmerQuotes);
        } else if (user.role === 'business') {
          // This is a simplified approach. A real app might fetch requirements first.
          // For now, we assume we have a way to get requirements with quotes.
          // This part will be improved later.
        }
      } catch (err) {
        setError('Failed to fetch quotes.');
        console.error(err);
      }
      setLoading(false);
    };

    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const handleUpdateStatus = async (quoteId, status) => {
    try {
      const updatedQuote = await updateQuoteStatus(quoteId, status);
      // Update the local state to reflect the change
      setQuotes(quotes.map(q => q._id === quoteId ? updatedQuote : q));
    } catch (err) {
      setError('Failed to update quote status.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading quotes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Quotes</h1>
      {user.role === 'farmer' && (
        <div>
          {quotes.map(quote => (
            <div key={quote._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h2 className="text-xl font-bold">{quote.rfqId.product}</h2>
              <p>Price: ${quote.pricePerUnit}</p>
              <p>Status: {quote.status}</p>
            </div>
          ))}
        </div>
      )}
      {user.role === 'business' && (
        <div>
          {/* This part needs to be implemented properly */}
          <p>Business quote management coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
