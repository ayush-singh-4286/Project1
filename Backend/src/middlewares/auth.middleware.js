const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        // Headers se token nikaalna
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false, 
                message: "Access Denied. No token provided or invalid format." 
            });
        }

        // 'Bearer <token>' me se sirf token alag karna
        const token = authHeader.split(" ")[1];
        
        const jwtSecret = process.env.JWT_SECRET || 'YOUR_TEMPORARY_FALLBACK_JWT_SECRET_KEY';
        
        // Token ko verify karna
        const decoded = jwt.verify(token, jwtSecret);
        
        // Token ke andar jo userId thi, use req.user me daal diya
        req.user = decoded; 
        
        next(); // Aage route handler par bhej do
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: "Invalid or Expired Token.", 
            error: error.message 
        });
    }
};

module.exports = authMiddleware; 