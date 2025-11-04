const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Message = require('../models/Message');

// GET /api/farmer/dashboard/summary
exports.getSummary = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day; // Monday as start
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todaysOrders, pendingOrders, weekRevenueAgg, monthRevenueAgg, stockAgg] = await Promise.all([
    Order.countDocuments({ farmer: farmerId, placedAt: { $gte: startOfToday } }),
    Order.countDocuments({ farmer: farmerId, status: 'pending' }),
    Order.aggregate([
      { $match: { farmer: farmerId, placedAt: { $gte: startOfWeek }, paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { farmer: farmerId, placedAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ]),
    Product.aggregate([
      { $match: { farmer: farmerId } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
  ]);

  const revenueThisWeek = weekRevenueAgg[0]?.revenue || 0;
  const revenueThisMonth = monthRevenueAgg[0]?.revenue || 0;
  const availableStock = stockAgg[0]?.total || 0;

  res.json({
    todaysOrders,
    pendingOrders,
    revenueThisWeek,
    revenueThisMonth,
    availableStock,
  });
});

// GET /api/farmer/dashboard/recent
exports.getRecent = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const [products, messages] = await Promise.all([
    Product.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(6),
    Message.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(5),
  ]);
  res.json({ products, messages });
});

// GET /api/farmer/dashboard/alerts
exports.getAlerts = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const lowStockProducts = await Product.find({ farmer: farmerId, quantity: { $lte: 5 } })
    .select('name quantity');

  const pendingVerification = 0; // placeholder if future verification logic for products

  const paymentIssues = await Order.countDocuments({ farmer: farmerId, paymentStatus: 'failed' });

  res.json({
    lowStock: lowStockProducts,
    pendingVerification,
    paymentIssues,
  });
});

// PATCH /api/products/:id/publish
exports.togglePublish = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.farmer.toString() !== farmerId.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  product.published = !product.published;
  await product.save();
  res.json(product);
});

// GET /api/farmer/dashboard/orders
exports.getOrders = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const orders = await Order.find({ farmer: farmerId })
    .populate('items.product', 'title price')
    .populate('customer', 'name email')
    .sort({ placedAt: -1 });

  res.json(orders);
});

// GET /api/farmer/dashboard/orders/:orderId
exports.getOrderById = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const order = await Order.findById(req.params.orderId)
    .populate('items.product', 'title price imageUrl')
    .populate('customer', 'name email address');

  if (order && order.farmer.toString() === farmerId.toString()) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// PATCH /api/farmer/dashboard/orders/:orderId/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const { status } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (order && order.farmer.toString() === farmerId.toString()) {
    order.status = status;
    await order.save();
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// PATCH /api/farmer/dashboard/orders/:orderId/accept
exports.acceptOrder = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const order = await Order.findById(req.params.orderId);

  if (order && order.farmer.toString() === farmerId.toString() && order.status === 'pending') {
    order.status = 'accepted';
    await order.save();
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found or cannot be accepted' });
  }
});

// PATCH /api/farmer/dashboard/orders/:orderId/reject
exports.rejectOrder = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;
  const order = await Order.findById(req.params.orderId);

  if (order && order.farmer.toString() === farmerId.toString() && order.status === 'pending') {
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found or cannot be rejected' });
  }
});


