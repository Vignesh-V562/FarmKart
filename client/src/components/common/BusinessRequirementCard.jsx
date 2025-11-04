import React from 'react';
import { FaBuilding, FaBox, FaCalendarAlt } from 'react-icons/fa';

const BusinessRequirementCard = ({ requirement, onRequestQuote }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{requirement.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{requirement.description}</p>

        <div className="flex items-center text-gray-700 mb-2">
          <FaBuilding className="mr-2 text-green-600" />
          <span className="font-semibold">Business:</span> {requirement.business.companyName || requirement.business.fullName}
        </div>
        <div className="flex items-center text-gray-700 mb-2">
          <FaBox className="mr-2 text-green-600" />
          <span className="font-semibold">Quantity:</span> {requirement.quantity} {requirement.unit}
        </div>
        <div className="flex items-center text-gray-700 mb-2">
          <FaCalendarAlt className="mr-2 text-green-600" />
          <span className="font-semibold">Deadline:</span> {new Date(requirement.deadline).toLocaleDateString()}
        </div>
        {requirement.budget && (
          <div className="flex items-center text-gray-700 mb-2">
            <span className="font-semibold">Budget:</span> ${requirement.budget.toFixed(2)}
          </div>
        )}
      </div>
      <div className="mt-4">
        <button 
          onClick={() => onRequestQuote(requirement)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Request Quote
        </button>
      </div>
    </div>
  );
};

export default BusinessRequirementCard;
