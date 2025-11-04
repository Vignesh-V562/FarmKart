import React from 'react';
import { FaEdit, FaTrash, FaBox } from 'react-icons/fa';

const ProductCard = ({ product, onEdit, onDelete, isEcommerce, onViewDetails }) => {

  const getStatusPill = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Published</span>;
      case 'draft':
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Draft</span>;
      case 'unlisted':
        return <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Unlisted</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const cardProps = {
    className: "bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col",
    ...(isEcommerce && { onClick: () => onViewDetails(product), style: { cursor: 'pointer' } })
  };

  return (
    <div {...cardProps}>
      <div className="relative h-48 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FaBox className="text-5xl" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          {getStatusPill(product.status)}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-2xl font-extrabold text-green-600 mb-4">
            ₹{product.price} <span className="text-sm font-medium text-gray-500">/ {product.unit}</span>
          </p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          <span>Stock: <span className="font-bold text-gray-800">{product.quantity}</span></span>
          <span>Grade: <span className="font-bold text-gray-800">{product.grade}</span></span>
        </div>
      </div>

      {!isEcommerce && (
        <div className="bg-gray-50 p-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaEdit />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

