import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw ApiError.unauthorized('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Email atau password salah');
    }

    const tokenPayload = {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

    return {
        accessToken,
        user: {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        },
    };
};

const getProfile = async (userId) => {
    const user = await authRepository.findUserById(BigInt(userId));

    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    return {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

export default { login, getProfile };
