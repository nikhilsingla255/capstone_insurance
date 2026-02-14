const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ['POLICY', 'CLAIM', 'TREATY', 'USER'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE'],
      required: true
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    ipAddress: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);