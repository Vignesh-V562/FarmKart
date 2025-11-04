import React from 'react';

const RoleCard = ({ icon, title, description, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 border rounded-lg text-center cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-green-500 bg-green-900 bg-opacity-50 shadow-lg'
          : 'border-gray-600 hover:border-green-400 bg-gray-800 bg-opacity-50'
      }`}
    >
      <div className="text-4xl mb-3 mx-auto text-green-400">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-300 mt-2 text-sm">{description}</p>
    </div>
  );
};

export default RoleCard;