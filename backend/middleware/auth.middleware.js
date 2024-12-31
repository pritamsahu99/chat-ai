import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // Extract token from cookies or authorization header
        const token = req.cookies?.token || 
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized user. Token not provided.' });
        }
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            res.cookie('token', '')
            return res.status(401).json({ error: 'Unauthorized user. Token has been blacklisted.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded payload to request object
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error('JWT Verification Error:', error.message); // Debug log
        return res.status(401).json({ error: 'Unauthorized user. Invalid or expired token.' });
    }
};
