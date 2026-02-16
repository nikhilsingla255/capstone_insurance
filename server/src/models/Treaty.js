const mongoose = require('mongoose');
const { Schema } = mongoose;

const treatySchema = new Schema(
    {
        treatyName: { type: String, required: true },
        treatyType: {
            type: String,
            enum: ['QUOTA_SHARE', 'SURPLUS'],
            required: true
        },
        reinsurerId: {
            type: Schema.Types.ObjectId,
            ref: 'Reinsurer',
            required: true
        },
        sharePercentage: { type: Number, required: true }, //this is for Quota_Share, reinsurer takes x%
        retentionLimit: { type: Number, required: true }, //50 lac this is for surplus, insurer reten limit
        treatyLimit: { type: Number, required: true }, //1 cr Maximum amount reinsurer is willing to accept under that treaty.
        applicableLOBs: {
            type: [String],
            enum: ['HEALTH', 'MOTOR' , "LIFE" , "PROPERTY"],
            required: true
        },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: { type: Date, required: true },
        status: {
            type: String,
            enum: ['ACTIVE', 'EXPIRED'],
            default: 'ACTIVE'
        }        
    },
    { timestamps: true }
);

module.exports = mongoose.model('Treaty', treatySchema);