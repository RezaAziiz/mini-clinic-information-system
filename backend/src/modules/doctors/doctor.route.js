import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../common/utils/ApiError.js';
import prisma from '../../config/database.js';

const router = express.Router();

router.use(authenticate);

// GET /doctors/me — profil dokter yang sedang login
router.get('/me', async (req, res, next) => {
    try {
        if (req.user.role !== 'Dokter') {
            return next(ApiError.forbidden('Endpoint ini hanya untuk role Dokter'));
        }
        const doctor = await prisma.doctor.findUnique({
            where: { userId: BigInt(req.user.userId) },
            select: { id: true, doctorCode: true, name: true, specialization: true, phone: true },
        });
        if (!doctor) {
            return next(ApiError.notFound('Profil dokter tidak ditemukan'));
        }
        res.success(doctor, 'Profil dokter berhasil diambil');
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                doctorCode: true,
                name: true,
                specialization: true,
                phone: true,
            },
            orderBy: { name: 'asc' },
        });
        res.success(doctors, 'Data dokter berhasil diambil');
    } catch (error) {
        next(error);
    }
});

export default router;
