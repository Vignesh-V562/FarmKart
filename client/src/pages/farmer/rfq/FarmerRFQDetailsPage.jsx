import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRFQDetails } from '../../../api/rfqApi.js'; // Corrected import
import { useAuth } from '../../../hooks/useAuth';
import BidModal from '../../../components/rfq/BidModal'; // Import BidModal
import { FaArrowLeft, FaGavel, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const FarmerRFQDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const fetchRfq = async () => {
    try {
      const rfq = await getRFQDetails(id); // Assuming getRfqById returns { data: rfq }
      setRfq(data);
    } catch (err) {
      setError('Failed to fetch RFQ details.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRfq();
  }, [id]);

  // Assuming rfq.bids is an array of bids and each bid has a farmer._id
  // This part needs to be adjusted based on how bids are structured in the RFQ details response
  const existingBid = rfq?.bids?.find(bid => bid.farmerId === user._id); // Assuming farmerId is directly on bid

  const getStatusBadge = (status) => {
    switch (status) {
        case 'accepted':
            return <span className="flex items-center gap-2 text-green-600"><FaCheckCircle /> Accepted</span>;
        case 'rejected':
            return <span className="flex items-center gap-2 text-red-600"><FaTimesCircle /> Rejected</span>;
        default:
            return <span className="flex items-center gap-2 text-yellow-600"><FaClock /> Pending</span>;
    }
  }

  if (loading) {
    return <p>Loading RFQ details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!rfq) {
    return <p>RFQ not found.</p>;
  }

  return (
    <div>
        <button onClick={() => navigate('/farmer/browse-rfqs')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <FaArrowLeft />
          Back to RFQs
        </button>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="border-b pb-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{rfq.product}</h1>
                <p className="text-sm text-gray-500 mt-1">Posted by: {rfq.buyerId?.companyName || 'A Business'}</p>
            </div>
            
            <div className="prose max-w-none mb-6">
                <p>{rfq.additionalNotes}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="bg-gray-100 p-3 rounded-lg"> 
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-bold text-lg">{rfq.quantity} {rfq.unit}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-bold text-lg capitalize">{rfq.category}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Delivery Deadline</p>
                    <p className="font-bold text-lg">{new Date(rfq.deliveryDeadline).toLocaleDateString()}</p>
                </div>
            </div>

            {existingBid ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your Bid</h3>
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-blue-600">₹{existingBid.pricePerUnit.toFixed(2)}</p>
                        <div className="font-semibold text-lg">{getStatusBadge(existingBid.status)}</div>
                    </div>
                    {existingBid.remarks && <p className="text-gray-700 mt-2">Your message: {existingBid.remarks}</p>}
                </div>
            ) : (
                rfq.status === 'open' && (
                    <div className="text-center mt-6">
                        <button 
                            onClick={() => setIsBidModalOpen(true)} 
                            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            <FaGavel />
                            Submit a Bid
                        </button>
                    </div>
                )
            )}

            {rfq.status !== 'open' && !existingBid && (
                <p className="text-center text-red-600 font-semibold">Bidding for this RFQ is now closed.</p>
            )}
        </div>

        <BidModal 
            open={isBidModalOpen}
            onClose={() => setIsBidModalOpen(false)}
            rfqId={rfq._id}
            rfqDeliveryDeadline={rfq.deliveryDeadline}
            onBidSubmitted={() => {
                alert('Bid submitted successfully!');
                fetchRfq(); // Refresh data
            }}
        />
    </div>
  );
};

export default FarmerRFQDetailsPage;
