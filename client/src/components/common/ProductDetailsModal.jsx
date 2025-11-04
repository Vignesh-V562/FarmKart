import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaLeaf, FaBoxOpen, FaCertificate, FaShippingFast } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProductDetailsModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Set initial quantity to Minimum Order Quantity if it exists
    if (product.moq > 1) {
      setQuantity(product.moq);
    }
    // Reset scroll and image on product change
    setActiveImage(0);
  }, [product]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(product.moq || 1, prev + amount));
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
    onClose(); // Close modal after adding to cart
  };

  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
          aria-label="Close product details"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={product.images && product.images.length > 0 ? product.images[activeImage] : '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${activeImage === index ? 'border-green-600 scale-105' : 'border-transparent'}`}
                    >
                      <img src={img} alt={`${product.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-gray-500 mb-4 text-sm">
                Sold by: <Link to={`/ecommerce/farmer/${product.farmer._id}`} className="text-green-600 hover:underline" onClick={onClose}>{product.farmer.fullName || 'Anonymous Farmer'}</Link>
              </p>

              <div className="text-4xl font-extrabold text-green-600 mb-5">
                ₹{product.price.toFixed(2)} <span className="text-lg font-medium text-gray-500">/ {product.unit}</span>
              </div>

              <div className="prose prose-sm max-w-none text-gray-600 mb-5">
                <p>{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><FaLeaf className="text-green-500"/><span>Category: <span className="font-semibold">{product.category}</span></span></div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><FaBoxOpen className="text-yellow-500"/><span>Stock: <span className="font-semibold">{product.quantity} {product.unit}</span></span></div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><FaCertificate className="text-blue-500"/><span>Grade: <span className="font-semibold">{product.grade}</span></span></div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><FaShippingFast className="text-purple-500"/><span>Packaging: <span className="font-semibold">{product.packaging}</span></span></div>
              </div>

              {product.moq > 1 && <p className="text-xs text-red-600 mb-4">Minimum order quantity: {product.moq} {product.unit}</p>}

              {/* Actions */}
              <div className="flex items-center gap-4 mb-5">
                <label htmlFor="quantity-modal" className="font-semibold text-sm">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => handleQuantityChange(-1)} className="p-2 hover:bg-gray-100 rounded-l-lg"><FaMinus size={14} /></button>
                  <input
                    type="number"
                    id="quantity-modal"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                    min={product.moq || 1}
                    className="w-14 text-center border-l border-r text-sm"
                  />
                  <button onClick={() => handleQuantityChange(1)} className="p-2 hover:bg-gray-100 rounded-r-lg"><FaPlus size={14} /></button>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t">
                <button onClick={handleAddToCartClick} className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-base font-semibold">
                  <FaShoppingCart />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
