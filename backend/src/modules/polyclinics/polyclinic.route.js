import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import prisma from '../../config/database.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const polyclinics = await prisma.polyclinic.findMany({
            select: {
                id: true,
                name: true,
                description: true,
            },
            orderBy: { name: 'asc' },
        });
        res.success(polyclinics, 'Data poliklinik berhasil diambil');
    } catch (error) {
        next(error);
    }
});

export default router;
