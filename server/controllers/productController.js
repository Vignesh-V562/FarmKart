const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all products (for e-commerce) or products for a specific farmer
// @route   GET /api/products (farmer's products) or /api/products/all (all products)
// @access  Public (for /all) or Private/Farmer (for /)
const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  let products;
  if (req.path === '/all') {
    products = await Product.find({ ...keyword }).populate('farmer', 'fullName companyName');
  } else {
    products = await Product.find({ ...keyword, farmer: req.user._id });
  }

  // Further filter by farmer name if keyword is present and products are from /all route
  if (req.path === '/all' && req.query.keyword) {
    products = products.filter(product => 
      product.farmer.fullName.toLowerCase().includes(req.query.keyword.toLowerCase())
    );
  }

  res.json(products);
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Private/Farmer
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the product belongs to the farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this product');
    }
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    ...req.body,
    farmer: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Farmer
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the product belongs to the farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this product');
    }

    Object.assign(product, req.body);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private/Farmer
const updateProductStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the product belongs to the farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this product');
    }

    product.status = status;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the product belongs to the farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this product');
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get all unique product titles
// @route   GET /api/products/titles
// @access  Public
const getProductTitles = asyncHandler(async (req, res) => {
  const titles = await Product.distinct('title');
  res.json(titles);
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, updateProductStatus, deleteProduct, getProductTitles };