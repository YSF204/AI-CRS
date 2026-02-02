import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ================================== //
//    AUTH USING JWT TOKEN MIDDLEWARE //
// ================================== //

export const authenticate = async (req, res, next) => {
    try {

        // we get the token from the authorization header

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }
        // extrating the token from the header
        const token = authHeader.split(' ')[1];

        // veryifying the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // finding the user by id from the token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found ! The token is not valid "
            });

        }

        req.user = user;
        next();
    } catch (error) {

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token is not valid"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token is expired"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

}