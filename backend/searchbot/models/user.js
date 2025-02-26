const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    twitterUsername: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    email: String,
    twoFactorSecret: String,
    lastLoginAt: Date,
    cookies: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 