// Trigger nodemon restart
const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Get key metrics for the business dashboard
// @route   GET /api/analytics/metrics
// @access  Private/Business
const getKeyMetrics = asyncHandler(async (req, res) => {
  const totalSpend = await Order.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: null, totalSpend: { $sum: '$totalPrice' } } },
  ]);

  const orderVolume = await Order.countDocuments({ user: req.user._id });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentOrders = await Order.find({ user: req.user._id, createdAt: { $gte: thirtyDaysAgo } });
  const previousOrders = await Order.find({ user: req.user._id, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

  const calculateAveragePrice = (orders) => {
    if (orders.length === 0) return 0;
    let totalValue = 0;
    let totalItems = 0;
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        totalValue += item.price * item.quantity;
        totalItems += item.quantity;
      });
    });
    return totalItems > 0 ? totalValue / totalItems : 0;
  };

  const recentAveragePrice = calculateAveragePrice(recentOrders);
  const previousAveragePrice = calculateAveragePrice(previousOrders);

  let priceTrend = { percentage: 0, direction: 'stable' };
  if (previousAveragePrice > 0) {
    const percentageChange = ((recentAveragePrice - previousAveragePrice) / previousAveragePrice) * 100;
    priceTrend.percentage = Math.abs(percentageChange.toFixed(2));
    if (percentageChange > 0) {
      priceTrend.direction = 'up';
    } else if (percentageChange < 0) {
      priceTrend.direction = 'down';
    }
  }

  const topSupplier = await Order.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product.farmer', totalValue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } } } },
    { $sort: { totalValue: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'supplier' } },
    { $unwind: '$supplier' },
    { $project: { _id: 0, supplierName: '$supplier.fullName' } },
  ]);

  res.json({
    totalSpend: totalSpend.length > 0 ? totalSpend[0].totalSpend : 0,
    orderVolume,
    priceTrend,
    topSupplier: topSupplier.length > 0 ? topSupplier[0].supplierName : 'N/A',
  });
});

const getSpendByCategory = asyncHandler(async (req, res) => {
  const spendByCategory = await Order.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$orderItems' },
    { $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    { $group: {
        _id: '$productDetails.category',
        totalSpend: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
      }
    },
    { $project: {
        _id: 0,
        category: '$_id',
        totalSpend: '$totalSpend'
      }
    }
  ]);

  res.json(spendByCategory);
});

const getSpendOverTime = asyncHandler(async (req, res) => {
  const spendOverTime = await Order.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSpend: { $sum: "$totalPrice" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        year: '$_id.year',
        totalSpend: '$totalSpend'
      }
    }
  ]);

  res.json(spendOverTime);
});

const getDetailedReport = asyncHandler(async (req, res) => {
  const report = await Order.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$orderItems' },
    { $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    { $lookup: {
        from: 'users',
        localField: 'productDetails.farmer',
        foreignField: '_id',
        as: 'farmerDetails'
      }
    },
    { $unwind: '$farmerDetails' },
    { $group: {
        _id: {
          category: '$productDetails.category',
          supplier: '$farmerDetails.fullName'
        },
        totalSpend: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
      }
    },
    { $project: {
        _id: 0,
        category: '$_id.category',
        supplier: '$_id.supplier',
        spend: '$totalSpend'
      }
    }
  ]);

  res.json(report);
});

const exportCsv = asyncHandler(async (req, res) => {
  const report = await Order.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$orderItems' },
    { $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    { $lookup: {
        from: 'users',
        localField: 'productDetails.farmer',
        foreignField: '_id',
        as: 'farmerDetails'
      }
    },
    { $unwind: '$farmerDetails' },
    { $group: {
        _id: {
          category: '$productDetails.category',
          supplier: '$farmerDetails.fullName'
        },
        totalSpend: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
      }
    },
    { $project: {
        _id: 0,
        category: '$_id.category',
        supplier: '$_id.supplier',
        spend: '$totalSpend'
      }
    }
  ]);

  const fields = ['category', 'supplier', 'spend'];
  const opts = { fields };
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(report);
    res.header('Content-Type', 'text/csv');
    res.attachment('detailed-report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error exporting to CSV');
  }
});

module.exports = { getKeyMetrics, getSpendByCategory, getSpendOverTime, getDetailedReport, exportCsv };