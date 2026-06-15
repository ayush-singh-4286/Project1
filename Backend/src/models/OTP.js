const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 🔥 300 seconds = 5 minutes. Iske baad ye document automatic delete ho jayega!
    }
});

module.exports = mongoose.model("OTP", otpSchema); // 🔥 Dhyan dena 'module.exports' hona chahiye, sirf 'exports' nahi!