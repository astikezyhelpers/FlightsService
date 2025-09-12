import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
dotenv.config({path:'../../.env'})

// Authentication middleware - verifies JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Access token required',401));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new AppError('Invalid token',403));
        }
        req.user = user;
        next();
    });
};

export default authenticateToken;

