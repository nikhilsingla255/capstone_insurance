const mongoose = require('mongoose');
const { Schema } = mongoose;

const policySchema = new Schema(
    {
        policyNumber: { type: String, required: true, unique: true },
        insuredName: { type: String, required: true },
        insuredType: { type: String, enum: ["INDIVIDUAL", "CORPORATE"], default: "INDIVIDUAL" },
        lineOfBusiness: { type: String, enum: ["HEALTH", "MOTOR", "LIFE", "PROPERTY"], required: true },
        sumInsured: { type: Number, required: true },
        premium: { type: Number, required: true },
        retentionLimit: { type: Number, required: true },
        status: { type: String, enum: ["DRAFT", "ACTIVE", "SUSPENDED", "EXPIRED"], default: "DRAFT" },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: { type: Date, required: true },
        createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User',  default: null },
        isDeleted: { type: Boolean, default: false },
        deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema)