const express = require("express");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

const uploadFile = require("./Services/storage.service");
const postModel = require("./models/post.models"); 
const authController = require("./controllers/authController"); 

app.use(cors({ origin: "*" })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// AUTH MIDDLEWARE LAYER
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access Denied. Please Login." });
        }
        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET || 'YOUR_TEMPORARY_FALLBACK_JWT_SECRET_KEY';
        
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(403).json({ success: false, message: "Session expired. Login again." });
    }
};

// AUTH ROUTES
app.post('/api/auth/send-otp', authController.sendOTP);
app.post('/api/auth/register', authController.signup);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/send-otp-reset', authController.sendOTPReset);
app.post('/api/auth/reset-password-otp', authController.resetPasswordOTP);

// Routed directly to the active Controller layer without duplicate code blocks
app.post('/api/auth/update-password', authController.updatePassword);

// POSTS ROUTES
app.post('/api/posts/create', authMiddleware, upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an image" });
        }
        
        const result = await uploadFile(req.file.buffer);
        const finalUserId = req.body.userId || req.user?.userId || req.user?.id;

        if (!finalUserId) {
            return res.status(400).json({ 
                success: false, 
                message: "User identity extraction failed. Please login again." 
            });
        }

        const extractedFolderName = req.body.folderName;
        const extractedIsThumbnail = req.body.isThumbnail === 'true' || req.body.isThumbnail === true;

        if (!extractedFolderName) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: Destination folderName parameter is required."
            });
        }

        const post = await postModel.create({
            image: result.url,
            caption: req.body.caption,
            user: finalUserId, 
            folderName: extractedFolderName, 
            isThumbnail: extractedIsThumbnail 
        });
        
        return res.status(201).json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        next(error); 
    }
});

app.get('/api/posts', authMiddleware, async (req, res, next) => {
    try {
        const targetUserId = req.user?.userId || req.user?.id;
        const posts = await postModel.find({ user: targetUserId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/posts/delete/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const deletedPost = await postModel.findByIdAndDelete(postId);
        
        if (!deletedPost) {
            return res.status(404).json({ 
                success: false, 
                message: 'Requested memory node not found in index.' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Post memory layer successfully purged from database!' 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server handshake error during deletion.', 
            error: error.message 
        });
    }
});

// GLOBAL ERROR HANDLER MIDDLEWARE
app.use((err, req, res, next) => {
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

module.exports = app;