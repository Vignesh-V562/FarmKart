const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProduct,
    createProduct, 
    updateProduct, 
    updateProductStatus,
    deleteProduct,
    getProductTitles 
} = require('../controllers/productController');
const { protect, farmer } = require('../middleware/authMiddleware');

router.route('/').get(protect, farmer, getProducts).post(protect, farmer, createProduct);
router.route('/all').get(getProducts);
router.route('/titles').get(getProductTitles);
router.route('/:id').get(protect, farmer, getProduct).put(protect, farmer, updateProduct).delete(protect, farmer, deleteProduct);
router.route('/:id/status').patch(protect, farmer, updateProductStatus);

module.exports = router;
