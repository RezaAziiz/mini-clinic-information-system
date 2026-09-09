import jwt from 'jsonwebtoken';
import { ApiError } from '../common/utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(ApiError.unauthorized('Token tidak ditemukan'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Token sudah kadaluarsa'
            : 'Token tidak valid';

        return next(ApiError.unauthorized(message));
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized());
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(ApiError.forbidden());
        }

        next();
    };
};

export { authenticate, authorize };
