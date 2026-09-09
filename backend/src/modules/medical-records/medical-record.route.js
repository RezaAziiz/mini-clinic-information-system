import express from 'express';
import medicalRecordController from './medical-record.controller.js';
import medicalRecordSchema from './medical-record.schema.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../common/constants/enums.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: MedicalRecords
 *   description: Pengelolaan Rekam Medis Pasien
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalRecordInput:
 *       type: object
 *       required:
 *         - registrationId
 *         - subjective
 *         - assessment
 *         - plan
 *       properties:
 *         registrationId:
 *           type: integer
 *           example: 1
 *         subjective:
 *           type: string
 *           description: Keluhan Pasien
 *           example: "Pasien mengeluh pusing dan mual sejak 3 hari yang lalu."
 *         bloodPressure:
 *           type: string
 *           example: "120/80"
 *         temperature:
 *           type: number
 *           format: float
 *           example: 38.5
 *         weight:
 *           type: number
 *           format: float
 *           example: 65.5
 *         height:
 *           type: number
 *           format: float
 *           example: 170
 *         assessment:
 *           type: string
 *           description: Diagnosa
 *           example: "Observasi Febris, Susp. Dengue Fever"
 *         plan:
 *           type: string
 *           description: Rencana Terapi
 *           example: "Cek darah rutin, Paracetamol 3x500mg, Istirahat cukup"
 *         medicalAction:
 *           type: string
 *           description: Tindakan medis yang dilakukan
 *           example: "Pemberian infus RL 500ml"
 */

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Membuat rekam medis baru (SOAP) dan menyelesaikan kunjungan
 *     tags: [MedicalRecords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecordInput'
 *     responses:
 *       201:
 *         description: Rekam Medis berhasil disimpan
 */
// Sesuai use case, hanya Dokter yang melakukan pemeriksaan
router.post('/', authorize(ROLE.DOKTER), medicalRecordSchema.validateCreate, medicalRecordController.createMedicalRecord);

/**
 * @swagger
 * /api/medical-records/{patientId}:
 *   get:
 *     summary: Mendapatkan riwayat rekam medis berdasarkan ID Pasien
 *     tags: [MedicalRecords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Riwayat pemeriksaan berhasil diambil
 */
// Riwayat Pemeriksaan dilihat oleh Dokter (dan mungkin Administrator, tapi sesuai Use Case: Dokter)
router.get('/:patientId', authorize(ROLE.DOKTER, ROLE.ADMINISTRATOR), medicalRecordController.getMedicalRecords);

export default router;
