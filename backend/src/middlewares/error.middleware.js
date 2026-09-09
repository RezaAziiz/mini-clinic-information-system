import { Prisma } from '@prisma/client';
import { ApiError } from '../common/utils/ApiError.js';

const errorHandler = (err, req, res, _next) => {
    // Jika error sudah dari ApiError, gunakan format
    if (err instanceof ApiError) {
        const hasErrors = err.errors && Object.keys(err.errors).length > 0;
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(hasErrors && { errors: err.errors })
        });
    }

    // Mapping Error Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (err.code === 'P2002') {
            const field = err.meta?.target || 'Data';
            return res.status(409).json({
                success: false,
                message: `${field} sudah terdaftar atau tidak boleh duplikat`,
                data: null
            });
        }

        // P2003: Foreign key constraint failed
        if (err.code === 'P2003') {
            return res.status(400).json({
                success: false,
                message: 'Data tidak dapat dihapus atau diubah karena masih berelasi dengan data lain',
                data: null
            });
        }

        // P2025: Record to update/delete not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Data tidak ditemukan',
                data: null
            });
        }
    }

    // Jika error dari library lain atau runtime, jadikan 500
    console.error(' [Unhandled Error]:', err);

    return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        data: null,
    });
};

export default errorHandler;
