const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BidSchema = new Schema(
  {
    bidId: { type: String, required: true, unique: true },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerUnit: { type: Number, required: true },
    deliveryWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    transportMethod: { type: String, required: true },
    remarks: { type: String },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['submitted', 'accepted', 'rejected'], default: 'submitted' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bid', BidSchema);