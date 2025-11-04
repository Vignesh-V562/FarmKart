import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../hooks/useAuth';
import { FaFilter, FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AddProductModal } from '../../components/farmer/AddProductModal';
import ProductForm from '../../components/farmer/ProductForm';
import ProductCard from '../../components/farmer/ProductCard';

const ProductManagement = () => {
  const { products, loading, error, fetchProducts, deleteProduct, updateProduct, addProduct } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date Created');
  const [sortOrder, setSortOrder] = useState('Descending');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const addProductParam = params.get('add');

    if (editId && products.length > 0) {
      const productToEdit = products.find(p => p._id === editId);
      if (productToEdit) {
        handleEditProduct(productToEdit);
        navigate(location.pathname, { replace: true });
      }
    } else if (addProductParam) {
      setEditingProduct(null);
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, products, navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || product.status === statusFilter;

      const matchesStock = stockFilter === 'All' ||
                           (stockFilter === 'Low Stock' && product.quantity <= 10 && product.quantity > 0) ||
                           (stockFilter === 'Out of Stock' && product.quantity === 0);

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesStock && matchesCategory;
    })
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

  const totalProducts = filteredAndSortedProducts.length;
  const publishedProducts = filteredAndSortedProducts.filter(p => p.status === 'published').length;
  const lowStockProducts = filteredAndSortedProducts.filter(p => p.quantity <= 10 && p.quantity > 0).length;

  const handleDeleteIndividual = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product.');
        console.error(err);
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await addProduct(productData);
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
      <p className="text-gray-600 mb-6">Manage your product listings, inventory, and sales.</p>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-xl font-bold text-gray-800">{totalProducts}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Published</p>
            <p className="text-xl font-bold text-green-600">{publishedProducts}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Low Stock</p>
            <p className="text-xl font-bold text-yellow-600">{lowStockProducts}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => setShowFilters(!showFilters)} variant="secondary" className="flex items-center">
            <FaFilter className="mr-2" /> Filters {showFilters ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </Button>
          <Button onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
            <FaPlus className="mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <Input
            type="text"
            placeholder="Search by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow mr-0 md:mr-4 mb-4 md:mb-0"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="All">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Stock Level</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option>All</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
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
                <option>Status</option>
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
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No products found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onEdit={() => handleEditProduct(product)} 
              onDelete={() => handleDeleteIndividual(product._id)}
            />
          ))}
        </div>
      )}

      <AddProductModal isOpen={isAddModalOpen} onClose={handleCloseModal}>
        <ProductForm product={editingProduct} onProductSaved={handleSaveProduct} onClose={handleCloseModal} />
      </AddProductModal>
    </div>
  );
};

export default ProductManagement;
