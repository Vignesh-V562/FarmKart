import React from 'react';

export const AddProductModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-auto max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="m-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
