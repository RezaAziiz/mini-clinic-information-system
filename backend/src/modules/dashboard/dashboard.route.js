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
// Administrator dapat melihat semua dashboard, bisa juga ditambahkan role lain jika dibutuhkan (sesuai use case, utamanya Administrator)
router.get('/', authorize(ROLE.ADMINISTRATOR), dashboardController.getSummary);

export default router;
