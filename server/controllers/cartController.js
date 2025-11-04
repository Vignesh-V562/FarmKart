const Cart = require('../models/Cart');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (cart) {
    res.json(cart);
  } else {
    res.json({ items: [] });
  }
});

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });

  if (cart) {
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    cart = await cart.save();
  } else {
    cart = await Cart.create({ user: userId, items: [{ product: productId, quantity }] });
  }

  const populatedCart = await Cart.findById(cart._id).populate('items.product');
  res.status(201).json(populatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

module.exports = { getCart, addItemToCart, removeItemFromCart };
