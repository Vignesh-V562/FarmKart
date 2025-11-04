import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBids } from '../../../api/productApi';
import { FaClock, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';

const MyBidsPage = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMyBids = async () => {
      try {
        const data = await getMyBids();
        setBids(data);
      } catch (err) {
        setError('Failed to fetch your bids.');
        console.error(err);
      }
      setLoading(false);
    };
    loadMyBids();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'accepted':
        return { icon: <FaCheckCircle />, text: 'Accepted', color: 'text-green-600' };
      case 'rejected':
        return { icon: <FaTimesCircle />, text: 'Rejected', color: 'text-red-600' };
      default:
        return { icon: <FaClock />, text: 'Pending', color: 'text-yellow-600' };
    }
  };

  if (loading) {
    return <p>Loading your bids...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bids</h1>
      {bids.length === 0 ? (
        <p>You have not submitted any bids yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
                {bids.map(({ requirementId, requirementTitle, requirementStatus, bid }) => {
                    const { icon, text, color } = getStatusInfo(bid.status);
                    return (
                        <li key={bid._id} className="p-4 hover:bg-gray-50">
                            <div className="flex flex-wrap items-center justify-between">
                                <div className="w-full sm:w-2/3">
                                    <p className="text-sm text-gray-500">RFQ: {requirementTitle}</p>
                                    <p className="text-xl font-bold text-gray-800">Your Bid: ₹{bid.price.toFixed(2)}</p>
                                </div>
                                <div className={`w-full sm:w-auto mt-2 sm:mt-0 text-lg font-semibold flex items-center gap-2 ${color}`}>
                                    {icon} {text}
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-between items-end mt-2">
                                <p className="text-sm text-gray-500">Submitted: {new Date(bid.createdAt).toLocaleDateString()}</p>
                                <button 
                                    onClick={() => navigate(`/farmer/rfqs/${requirementId}`)} 
                                    className="inline-flex items-center gap-2 px-3 py-1 mt-2 sm:mt-0 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaEye /> View RFQ
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
