import React from 'react';
import { FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BuyerProfileCard = ({ buyer, onContact }) => {
  return (
    <Link to={`/ecommerce/buyer/${buyer._id}`} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{buyer.companyName || buyer.fullName}</h3>
        <div className="flex items-center text-gray-700 mb-2">
          <FaUserTie className="mr-2 text-green-600" />
          <span className="font-semibold">{buyer.role}</span>
        </div>
        {buyer.farmAddress && (
          <div className="flex items-center text-gray-700 mb-2">
            <FaMapMarkerAlt className="mr-2 text-green-600" />
            <span>{buyer.farmAddress.city}, {buyer.farmAddress.state}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <button 
          onClick={(e) => { e.preventDefault(); onContact(buyer); }}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Contact
        </button>
      </div>
    </Link>
  );
};

export default BuyerProfileCard;
