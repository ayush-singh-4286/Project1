const User = require('../models/User'); 
const OTP = require('../models/OTP'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

// ==================== NODEMAILER CONFIGURATION FOR LIVE SERVER ====================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // TLS/SSL Handshake mandatory for Render
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    // 🔥 YEH LIVE PRODUCTION MEIN GMAIL BLOCK HO NE SE BACHAYEGA
    tls: {
        rejectUnauthorized: false
    }
});

// Live startup logs checking
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ LIVE SMTP CONFIGURATION ERROR:", error);
    } else {
        console.log("✅ LIVE SMTP SERVER READY TO SEND MAILS");
    }
});
// =================================================================================

// 1. SEND OTP (FOR SIGNUP)
exports.sendOTP = async (req, res) => {
    try {
        console.log("1. Controller Hit");

        const { email } = req.body;
        console.log("2. Email:", email);

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address.' });
        }

        const existingUser = await User.findOne({ email });
        console.log("3. User Check Done");

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        }

        const generatedOtp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("4. OTP Generated");

        const otpRecord = new OTP({ email, otp: generatedOtp });
        await otpRecord.save();
        console.log("5. OTP Saved");

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mail is from Traveller_LOG',
            html: `<h2>Your OTP is ${generatedOtp}</h2>`
        };

        console.log("Generated OTP:", generatedOtp);
        console.log("Sending to:", email);

        const info = await transporter.sendMail(mailOptions);
        console.log("MAIL INFO:", info);
        console.log("6. Mail Sent");

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully!'
        });

    } catch (error) {
        console.log("❌ ERROR IN SENDING OTP:", error);

        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP.',
            error: error.message
        });
    }
};

// 2. FINAL SIGNUP
exports.signup = async (req, res) => {
    try {
        const { email, password, otp, username, dob, gender } = req.body;

        if (!email || !password || !otp || !username || !dob || !gender) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const latestOtpRecord = await OTP.findOne({ email }).sort({ _id: -1 });
        if (!latestOtpRecord) {
            return res.status(400).json({ success: false, message: 'OTP expired or never generated.' });
        }

        if (String(latestOtpRecord.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or Username already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            dob,
            gender
        });
        await newUser.save();
        await OTP.deleteMany({ email });

        return res.status(201).json({ success: true, message: 'Account created successfully!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
    }
};

// 3. LOGIN
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

// 4. DELETE AN EXISTING POST BY ID
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const deletedPost = await Post.findByIdAndDelete(postId);
        
        if (!deletedPost) {
            return res.status(404).json({ success: false, message: 'Post memory not found in index.' });
        }

        return res.status(200).json({ success: true, message: 'Post node purged from database successfully!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error during post deletion.', error: error.message });
    }
};

// 5. SEND OTP FOR PASSWORD RESET
exports.sendOTPReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account discovered with this email address.' });
        }

        const generatedOtp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false 
        });

        const otpRecord = new OTP({ email, otp: generatedOtp });
        await otpRecord.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Traveller_LOG Account Security Reset Token',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px;">
                    <h2>Traveller_LOG Password Reset</h2>
                    <p>Use this security token to complete your account access override:</p>
                    <div style="background: #fff0f2; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #dc2626; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca;">
                        ${generatedOtp}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Recovery OTP dispatched successfully!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to send recovery token.', error: error.message });
    }
};

// 6. RESET PASSWORD ACCORDING TO OTP MATCH
exports.resetPasswordOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All parameters are required.' });
        }

        const latestOtpRecord = await OTP.findOne({ email }).sort({ _id: -1 });
        if (!latestOtpRecord) {
            return res.status(400).json({ success: false, message: 'OTP token context expired.' });
        }

        if (String(latestOtpRecord.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid verification token.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User context not found.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await OTP.deleteMany({ email });

        return res.status(200).json({ success: true, message: 'Cryptographic security string overridden successfully!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server reset execution breakdown.', error: error.message });
    }
};

// 7. UPDATE PASSWORD DIRECTLY
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