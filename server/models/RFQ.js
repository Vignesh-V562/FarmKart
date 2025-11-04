const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RFQSchema = new Schema(
  {
    rfqId: { type: String, required: true, unique: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    deliveryDeadline: { type: Date, required: true },
    attachments: [{ type: String }],
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    invitedFarmers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New field for private RFQs
    status: { type: String, enum: ['open', 'closed', 'accepted', 'cancelled'], default: 'open' },
    additionalNotes: { type: String },
    region: { type: String }, // New field for region
  },
  { timestamps: true }
);

module.exports = mongoose.model('RFQ', RFQSchema);