import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRfqs } from '../../api/productApi';
import RFQDetailsPage from './RFQDetailsPage'; // This will be the detail view component
import { FaPlus, FaEye } from 'react-icons/fa';

const MyRFQsPage = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        const data = await getMyRfqs();
        setRfqs(data);
      } catch (err) {
        setError('Failed to fetch your RFQs.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchRfqs();
  }, []);

  const handleSelectRfq = (rfq) => {
    setSelectedRfq(rfq);
  };

  const handleDeselect = () => {
    setSelectedRfq(null);
  }

  if (loading) {
    return <div className="text-center py-12">Loading your RFQs...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex gap-8">
      <div className={`w-full lg:w-1/3 ${selectedRfq ? 'hidden lg:block' : 'block'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Requests for Quotation</h1>
          <button onClick={() => navigate('/ecommerce/rfqs/new')} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <FaPlus /> Create RFQ
          </button>
        </div>
        
        {rfqs.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600">You haven't created any RFQs yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rfqs.map(rfq => (
              <div key={rfq._id} onClick={() => handleSelectRfq(rfq)} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{rfq.title}</h2>
                        <p className={`text-sm font-semibold capitalize ${rfq.status === 'open' ? 'text-green-600' : 'text-gray-500'}`}>{rfq.status}</p>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(rfq.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <span className="text-sm font-bold text-blue-600">{rfq.bids.length} Bids</span>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><FaEye/> View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`w-full lg:w-2/3 ${selectedRfq ? 'block' : 'hidden lg:block'}`}>
        {selectedRfq ? (
          <RFQDetailsPage rfq={selectedRfq} onBack={handleDeselect} />
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Select an RFQ to view its details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRFQsPage;
