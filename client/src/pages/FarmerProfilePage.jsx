import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../api/profileApi';
import { fetchAllProducts } from '../api/productApi';
import ProductCard from '../components/farmer/ProductCard';

const FarmerProfilePage = () => {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const farmerData = await getProfile(id);
        setFarmer(farmerData);

        const allProducts = await fetchAllProducts();
        const farmerProducts = allProducts.filter(p => p.farmer._id === id);
        setProducts(farmerProducts);
      } catch (err) {
        setError('Failed to fetch farmer data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchFarmerData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading farmer profile...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!farmer) {
    return <div className="text-center py-8">Farmer not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{farmer.fullName}</h1>
        <p className="text-gray-700">{farmer.bio}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Products from {farmer.fullName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} isEcommerce={true} />
        ))}
      </div>
    </div>
  );
};

export default FarmerProfilePage;
