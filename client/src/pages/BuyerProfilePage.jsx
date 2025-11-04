import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../api/profileApi';
import { fetchBusinessRequirements } from '../api/productApi';
import BusinessRequirementCard from '../components/common/BusinessRequirementCard';

const BuyerProfilePage = () => {
  const { id } = useParams();
  const [buyer, setBuyer] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const buyerData = await getProfile(id);
        setBuyer(buyerData);

        const allRequirements = await fetchBusinessRequirements();
        const buyerRequirements = allRequirements.filter(r => r.business._id === id);
        setRequirements(buyerRequirements);
      } catch (err) {
        setError('Failed to fetch buyer data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchBuyerData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading buyer profile...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!buyer) {
    return <div className="text-center py-8">Buyer not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{buyer.companyName || buyer.fullName}</h1>
        <p className="text-gray-700">{buyer.bio}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Requirements from {buyer.companyName || buyer.fullName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {requirements.map(requirement => (
          <BusinessRequirementCard key={requirement._id} requirement={requirement} />
        ))}
      </div>
    </div>
  );
};

export default BuyerProfilePage;
