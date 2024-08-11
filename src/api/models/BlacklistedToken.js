const { Schema, model } = require('mongoose');

const BlacklistedTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        ref: 'Admin'
    }
}, { timestamps: true });

module.exports = model('BlacklistedToken', BlacklistedTokenSchema);