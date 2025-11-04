const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    entityType: { type: String, required: true, enum: ['RFQ', 'Bid', 'User'] }, // Type of entity being audited
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' }, // Reference to the entity
    eventType: { type: String, required: true }, // e.g., 'created', 'updated', 'status_change', 'bid_submitted', 'bid_accepted', 'bid_rejected'
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who performed the action (optional, for system actions)
    details: { type: Schema.Types.Mixed }, // JSON object for additional event-specific data
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);