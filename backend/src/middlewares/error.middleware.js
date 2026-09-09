import { ApiError } from '../common/utils/ApiError.js';

const errorHandler = (err, req, res, _next) => {
    // Jika error sudah dari ApiError gunakan formatter
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors.length > 0 && { errors: err.errors })// array errors jika ada (utk validasi)
        });
    }

    // Jika error dari library (prisma/jwt) atau runtime, jadikan 500
    console.error(' [Unhandled Error]:', err);

    return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        data: null,
    });
};

export default errorHandler;
