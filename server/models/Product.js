const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'flowers', 'other'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  origin: {
    type: String,
    trim: true,
  },
  
  // Pricing and Quantity
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  discount: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'lb', 'ton', 'piece', 'dozen', 'bunch', 'bag', 'box', 'quintal'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  moq: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  
  // Product Details
  harvestDate: {
    type: Date,
    required: true,
  },
  shelfLife: {
    type: String,
  },
  grade: {
    type: String,
    required: true,
    enum: ['premium', 'grade-a', 'grade-b', 'standard', 'commercial'],
  },
  packaging: {
    type: String,
    required: true,
    enum: ['loose', 'plastic-bag', 'cardboard-box', 'wooden-crate', 'jute-bag', 'vacuum-sealed', 'other'],
  },
  sku: {
    type: String,
    trim: true,
  },
  
  // Media
  images: [{
    type: String, // URLs to uploaded images
  }],
  video: {
    type: String, // URL to uploaded video
  },
  
  // Shipping and Logistics
  shippingOptions: [{
    type: String,
    enum: ['pickup', 'delivery', 'express-delivery', 'cold-chain'],
  }],
  deliveryRadius: {
    type: String,
  },
  shippingCharges: {
    type: Number,
  },
  leadTime: {
    type: String,
  },
  
  // Tags and Searchability
  tags: [{
    type: String,
    trim: true,
  }],
  
  // Certifications
  certifications: [{
    type: String,
    enum: ['organic', 'fssai', 'iso', 'halal', 'kosher', 'fair-trade', 'rainforest-alliance', 'other'],
  }],
  
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'published', 'unlisted', 'private'],
    default: 'draft',
  },
  
  // Farmer Reference
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Additional Information
  additionalInfo: {
    type: String,
  },
  
  // SEO and Marketing
  keywords: [{
    type: String,
    trim: true,
  }],
  seo: {
    slug: { type: String, trim: true },
    metaDesc: { type: String, trim: true },
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true,
  },
  
  // Featured Product
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text', tags: 'text', keywords: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ farmer: 1, status: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;