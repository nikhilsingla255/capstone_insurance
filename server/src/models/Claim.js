const mongoose = require('mongoose');
const { Schema } = mongoose;

const claimSchema = new Schema({
    claimNumber: { type: String, required: true, unique: true },
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
    claimAmount: { type: Number, required: true },
    approvedAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'],
      default: 'SUBMITTED'
    },
    incidentDate: { type: Date, required: true },
    reportedDate: { type: Date, required: true },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    remarks: { type: String, default: '' },
}, { timestamps: true })


module.exports = mongoose.model('Claim', claimSchema);