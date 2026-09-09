import express from 'express';
import prescriptionController from './prescription.controller.js';
import prescriptionSchema from './prescription.schema.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../common/constants/enums.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Pengelolaan Resep Obat
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PrescriptionItemInput:
 *       type: object
 *       required:
 *         - medicineName
 *         - dosage
 *         - frequency
 *         - quantity
 *       properties:
 *         medicineName:
 *           type: string
 *           example: "Paracetamol"
 *         dosage:
 *           type: string
 *           example: "500mg"
 *         frequency:
 *           type: string
 *           example: "3x1"
 *         quantity:
 *           type: integer
 *           example: 10
 *         instructions:
 *           type: string
 *           example: "Sesudah makan"
 *     PrescriptionInput:
 *       type: object
 *       required:
 *         - medicalRecordId
 *         - items
 *       properties:
 *         medicalRecordId:
 *           type: integer
 *           example: 1
 *         notes:
 *           type: string
 *           example: "Habiskan obat antibiotik"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PrescriptionItemInput'
 */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Membuat resep obat baru
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescriptionInput'
 *     responses:
 *       201:
 *         description: Resep obat berhasil dibuat
 */
// Hanya Dokter yang dapat membuat resep
router.post('/', authorize(ROLE.DOKTER), prescriptionSchema.validateCreate, prescriptionController.createPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Mendapatkan detail resep obat berdasarkan ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data resep obat berhasil diambil
 */
// Detail resep bisa dilihat oleh Dokter (dan mungkin Petugas/Apoteker nantinya, saat ini kita buka untuk DOKTER dan ADMINISTRATOR)
router.get('/:id', authorize(ROLE.DOKTER, ROLE.ADMINISTRATOR), prescriptionController.getPrescription);

export default router;
