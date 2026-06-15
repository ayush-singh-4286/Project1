const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP / REGISTER (🔥 FIXED: Clean direct database registration without OTP)
exports.signup = async (req, res) => {
    try {
        const { email, password, username, dob, gender } = req.body;

        // Validation checking
        if (!email || !password || !username || !dob || !gender) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Check if user or username context already occupied
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or Username already taken.' });
        }

        // Encrypt credentials safety string
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save raw profile document into database cluster index
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            dob,
            gender
        });
        
        await newUser.save();

        return res.status(201).json({ 
            success: true, 
            message: 'Account created successfully! Welcome to Traveller_LOG.' 
        });
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during direct registration.', 
            error: error.message 
        });
    }
};

// 2. LOGIN AREA
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide credentials.' });
        }

        const user = await User.findOne({ $or: [{ email: email }, { username: email }] });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials.' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'YOUR_TEMPORARY_FALLBACK_JWT_SECRET_KEY';
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '24h' });

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                username: user.username,
                dob: user.dob,     
                gender: user.gender 
            } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
    }
};

// 3. PURGE POST RECORD (Dynamic dynamic safety handler)
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const mongoose = require('mongoose');
        const PostModel = mongoose.models.post || mongoose.models.Post || mongoose.model('post');
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        
        if (!deletedPost) {
            return res.status(404).json({ success: false, message: 'Post memory not found in index.' });
        }

        return res.status(200).json({ success: true, message: 'Post node purged from database successfully!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error during post deletion.', error: error.message });
    }
};

// 4. DIRECT PASSWORD UPDATE STRATEGY
exports.updatePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing required parameters." });
        }

        const mongoose = require('mongoose');
        const UserModel = mongoose.models.User || mongoose.models.user || mongoose.model('User') || mongoose.model('user');

        const targetUser = await UserModel.findOne({ email: email.trim() });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User context not found inside database index." });
        }

        const isMatch = await bcrypt.compare(oldPassword, targetUser.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Security Warning: Current credential password mismatch." });
        }

        const finalPasswordToSave = await bcrypt.hash(newPassword, 10);

        await UserModel.updateOne(
            { email: email.trim() },
            { $set: { password: finalPasswordToSave } }
        );

        return res.status(200).json({ 
            success: true, 
            message: "Password updated successfully!" 
        });

    } catch (error) {
        console.error("🚨 LIVE BACKEND CRASH DETECTED:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during credential rewrite.", 
            error: error.message 
        });
    }
};

// Dummy placeholders placeholders keeping router maps safely compiled
exports.sendOTP = async (req, res) => {
    return res.status(410).json({ success: false, message: "OTP verification service deprecated on this server node." });
};
exports.sendOTPReset = async (req, res) => {
    return res.status(410).json({ success: false, message: "OTP verification service deprecated on this server node." });
};
exports.resetPasswordOTP = async (req, res) => {
    return res.status(410).json({ success: false, message: "OTP verification service deprecated on this server node." });
};