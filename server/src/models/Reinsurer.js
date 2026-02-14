const mongoose = require('mongoose');
const { Schema } = mongoose;

const reinsurerSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    rating: { type: String, enum: ["AAA", "AA", "A", "BBB"], required: true },
    contactEmail: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true }
}, { timestamps: true })

module.exports = mongoose.model('Reinsurer', reinsurerSchema)