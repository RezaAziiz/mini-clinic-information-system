import express from 'express';
import dashboardController from './dashboard.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../common/constants/enums.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API untuk data statistik Dashboard
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Mendapatkan summary statistik harian
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data summary dashboard berhasil diambil
 */
// Dashboard bisa diakses oleh semua role (Administrator, Dokter, Petugas) sesuai Use Case
router.get('/', authorize(ROLE.ADMINISTRATOR, ROLE.DOKTER, ROLE.PETUGAS_PENDAFTARAN), dashboardController.getSummary);

export default router;
