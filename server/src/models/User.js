const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ["UNDERWRITER", "CLAIMS_ADJUSTER", "REINSURANCE_ANALYST", "ADMIN"],
        default: "UNDERWRITER"
    },
    permissions: { type: [String], required: true },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
}

module.exports = mongoose.model('User', userSchema)