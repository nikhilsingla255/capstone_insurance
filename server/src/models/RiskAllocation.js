const mongoose = require('mongoose');
const { Schema } = mongoose;

const allocationItemSchema = new Schema(
  {
    reinsurerId: { type: Schema.Types.ObjectId, ref: 'Reinsurer', required: true },
    treatyId: { type: Schema.Types.ObjectId, ref: 'Treaty', required: true },
    allocatedAmount: { type: Number, required: true },
    allocatedPercentage: { type: Number, required: true }
  },
  { _id: false } 
);

const riskAllocationSchema = new Schema(
  {
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
    allocations: {
      type: [allocationItemSchema],
      required: true,
      default: []
    },
    retainedAmount: { type: Number, required: true },
    calculatedAt: { type: Date, required: true },
    calculatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskAllocation', riskAllocationSchema);
