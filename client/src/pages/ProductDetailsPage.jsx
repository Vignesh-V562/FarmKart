import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct } from '../api/productApi';
import { addItemToCart } from '../api/cartApi';
import { useAuth } from '../hooks/useAuth';
import { FaShoppingCart, FaArrowLeft, FaPlus, FaMinus, FaLeaf, FaBoxOpen, FaCertificate, FaShippingFast } from 'react-icons/fa';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData);
        if (productData.moq > 1) {
          setQuantity(productData.moq);
        }
      } catch (err) {
        setError('Failed to fetch product.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }

    try {
      await addItemToCart(product._id, quantity);
      alert(`${quantity} unit(s) of ${product.title} added to cart!`);
      navigate('/ecommerce/cart');
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(product.moq || 1, prev + amount));
  };

  if (loading) {
    return <div className="text-center py-12">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/ecommerce')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <FaArrowLeft />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={product.images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-green-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`${product.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <p className="text-gray-500 mb-4">
              Sold by: <Link to={`/ecommerce/farmer/${product.farmer._id}`} className="text-green-600 hover:underline">{product.farmer.fullName || 'Anonymous Farmer'}</Link>
            </p>
            
            <div className="text-4xl font-extrabold text-green-600 mb-6">
              ₹{product.price.toFixed(2)} <span className="text-lg font-medium text-gray-500">/ {product.unit}</span>
            </div>

            <div className="prose max-w-none text-gray-600 mb-6">
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2"><FaLeaf className="text-green-500"/><span>Category: <span className="font-semibold">{product.category}</span></span></div>
              <div className="flex items-center gap-2"><FaBoxOpen className="text-yellow-500"/><span>Stock: <span className="font-semibold">{product.quantity} {product.unit}</span></span></div>
              <div className="flex items-center gap-2"><FaCertificate className="text-blue-500"/><span>Grade: <span className="font-semibold">{product.grade}</span></span></div>
              <div className="flex items-center gap-2"><FaShippingFast className="text-purple-500"/><span>Packaging: <span className="font-semibold">{product.packaging}</span></span></div>
            </div>
            
            {product.moq > 1 && <p className="text-sm text-red-600 mb-4">Minimum order quantity: {product.moq} {product.unit}</p>}

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="font-semibold">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => handleQuantityChange(-1)} className="p-3 hover:bg-gray-100 rounded-l-lg"><FaMinus /></button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                  min={product.moq || 1}
                  className="w-16 text-center border-l border-r"
                />
                <button onClick={() => handleQuantityChange(1)} className="p-3 hover:bg-gray-100 rounded-r-lg"><FaPlus /></button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleOrder} className="flex-1 flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
                <FaShoppingCart />
                Order Now
              </button>
              <button onClick={() => navigate('/ecommerce')} className="flex-1 flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;