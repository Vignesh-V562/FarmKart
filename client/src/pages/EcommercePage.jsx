import React, { useState, useEffect } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Input from '../components/common/Input';
import ProductCard from '../components/farmer/ProductCard';
import BusinessRequirementCard from '../components/common/BusinessRequirementCard';
import BuyerProfileCard from '../components/common/BuyerProfileCard';
import RequestQuoteModal from '../components/common/RequestQuoteModal';
import ContactModal from '../components/common/ContactModal';
import ProductDetailsModal from '../components/common/ProductDetailsModal'; // Import the new modal
import { fetchAllProducts, fetchBusinessRequirements } from '../api/productApi';
import { fetchBuyerProfiles } from '../api/profileApi';
import { getCart, addItemToCart } from '../api/cartApi';
import { useAuth } from '../hooks/useAuth';

const EcommercePage = () => {
  const [products, setProducts] = useState([]);
  const [businessRequirements, setBusinessRequirements] = useState([]);
  const [buyerProfiles, setBuyerProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date Created');
  const [sortOrder, setSortOrder] = useState('Descending');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const { user, loading: authLoading } = useAuth();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // State for the new product details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        console.log('EcommercePage fetchData - user:', user);
        console.log('EcommercePage fetchData - authLoading:', authLoading);
        setLoading(true);
        setError(null);
        try {
          const [productsData, requirementsData, buyerProfilesData] = await Promise.all([
            fetchAllProducts(searchTerm),
            fetchBusinessRequirements(searchTerm),
            fetchBuyerProfiles(searchTerm),
          ]);

          if (user) {
            const cartData = await getCart();
            setCart(cartData);
          }

          const filteredAndSortedProducts = productsData
            .filter(product => categoryFilter === 'All' || product.category === categoryFilter)
            .sort((a, b) => {
              let compareValue = 0;
              switch (sortBy) {
                case 'Date Created':
                  compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                  break;
                case 'Title':
                  compareValue = a.title.localeCompare(b.title);
                  break;
                case 'Price':
                  compareValue = a.price - b.price;
                  break;
                case 'Quantity':
                  compareValue = a.quantity - b.quantity;
                  break;
                case 'Status':
                  compareValue = a.status.localeCompare(b.status);
                  break;
                case 'Harvest Date':
                  compareValue = new Date(a.harvestDate) - new Date(b.harvestDate);
                  break;
                default:
                  break;
              }
              return sortOrder === 'Ascending' ? compareValue : -compareValue;
            });

          setProducts(filteredAndSortedProducts);
          setBusinessRequirements(requirementsData);
          setBuyerProfiles(buyerProfilesData);
        } catch (err) {
          setError('Failed to fetch marketplace data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [searchTerm, categoryFilter, sortBy, sortOrder, user]);

  const handleAddToCart = async (product, quantity) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }

    try {
      const updatedCart = await addItemToCart(product._id, quantity);
      setCart(updatedCart);
      alert(`${quantity} unit(s) of ${product.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleRequestQuote = (requirement) => {
    setSelectedRequirement(requirement);
    setIsQuoteModalOpen(true);
  };

  const handleContact = (entity) => {
    setSelectedRecipient(entity);
    setIsContactModalOpen(true);
  };

  // Handlers for the new modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading marketplace...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to the Marketplace!</h1>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-between">
        <Input
          type="text"
          placeholder="Search for products, farmers, businesses, or requirements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 mb-4 md:mb-0"
        />
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-400 transition-colors duration-200"
          >
            <FaFilter className="mr-2" /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <Link to="cart" className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
            <FaShoppingCart className="mr-2" /> Cart ({cart.items.length})
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="All">All</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="spices">Spices</option>
              <option value="herbs">Herbs</option>
              <option value="flowers">Flowers</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>Date Created</option>
              <option>Title</option>
              <option>Price</option>
              <option>Quantity</option>
              <option>Harvest Date</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>Ascending</option>
              <option>Descending</option>
            </select>
          </div>
        </div>
      )}

      {isQuoteModalOpen && (
        <RequestQuoteModal
          requirement={selectedRequirement}
          onClose={() => setIsQuoteModalOpen(false)}
          onQuoteSubmitted={() => {
            alert('Quote submitted successfully!');
          }}
        />
      )}

      {isContactModalOpen && (
        <ContactModal
          recipient={selectedRecipient}
          onClose={() => setIsContactModalOpen(false)}
          onMessageSent={() => {
            alert('Message sent successfully!');
          }}
        />
      )}

      {/* Render the new Product Details Modal */}
      {isDetailModalOpen && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}

      {products.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                isEcommerce={true} 
                onContact={handleContact} 
                onViewDetails={() => handleViewProduct(product)} // Pass the handler
              />
            ))}
          </div>
        </div>
      )}

      {businessRequirements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businessRequirements.map(requirement => (
              <BusinessRequirementCard key={requirement._id} requirement={requirement} onRequestQuote={handleRequestQuote} onContact={handleContact} />
            ))}
          </div>
        </div>
      )}

      {buyerProfiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Buyer Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {buyerProfiles.map(buyer => (
              <BuyerProfileCard key={buyer._id} buyer={buyer} onContact={handleContact} />
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && businessRequirements.length === 0 && buyerProfiles.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No items found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default EcommercePage;
