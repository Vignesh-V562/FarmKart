const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private/Farmer
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Farmer
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = req.body.status;

    if (req.body.status === 'Shipped') {
      const invoiceId = `INV-${Date.now()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

      const invoice = new Invoice({
        invoiceId,
        user: order.user,
        farmer: order.orderItems[0].product.farmer, // Assuming all items from same farmer
        order: order._id,
        amount: order.totalPrice,
        dueDate,
      });

      await invoice.save();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = { getOrder, updateOrderStatus };
