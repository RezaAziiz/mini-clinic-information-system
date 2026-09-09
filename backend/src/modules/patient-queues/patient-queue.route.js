import express from 'express';
import queueController from './patient-queue.controller.js';
import queueSchema from './patient-queue.schema.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../common/constants/enums.js';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Queues
 *   description: Pengelolaan Antrean Pasien
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QueueInput:
 *       type: object
 *       required:
 *         - registrationId
 *       properties:
 *         registrationId:
 *           type: integer
 *           description: ID Pendaftaran yang akan dibuatkan antreannya
 *           example: 1
 *     QueueStatusUpdate:
 *       type: object
 *       required:
 *         - queueStatus
 *       properties:
 *         queueStatus:
 *           type: string
 *           enum: [Menunggu, Dipanggil, Selesai]
 *           example: "Selesai"
 */

/**
 * @swagger
 * /api/queues:
 *   get:
 *     summary: Mendapatkan daftar antrean
 *     tags: [Queues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Menunggu, Dipanggil, Selesai]
 *       - in: query
 *         name: polyId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daftar antrean berhasil diambil
 */
router.get('/', authorize(ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER), queueController.getQueues);

/**
 * @swagger
 * /api/queues:
 *   post:
 *     summary: Membuat antrean baru untuk pendaftaran tertentu
 *     tags: [Queues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueueInput'
 *     responses:
 *       201:
 *         description: Antrean berhasil dibuat
 */
// Hanya Petugas Pendaftaran yang bisa MEMBUAT antrean
router.post('/', authorize(ROLE.PETUGAS_PENDAFTARAN), queueSchema.validateCreate, queueController.createQueue);

/**
 * @swagger
 * /api/queues/{id}/call:
 *   put:
 *     summary: Memanggil pasien berdasarkan antrean
 *     description: Mengubah status antrean menjadi Dipanggil dan mencatat waktu panggilan
 *     tags: [Queues]
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
 *         description: Pasien berhasil dipanggil
 */
router.put('/:id/call', authorize(ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER), queueController.callQueue);

/**
 * @swagger
 * /api/queues/{id}/status:
 *   put:
 *     summary: Mengubah status antrean
 *     tags: [Queues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueueStatusUpdate'
 *     responses:
 *       200:
 *         description: Status antrean berhasil diupdate
 */
router.put('/:id/status', authorize(ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER), queueSchema.validateStatus, queueController.updateQueueStatus);

export default router;
