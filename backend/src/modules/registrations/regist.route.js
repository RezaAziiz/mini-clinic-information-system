import express from 'express';
import registController from './regist.controller.js';
import registSchema from './regist.schema.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../common/constants/enums.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Pendaftaran Kunjungan Pasien
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationInput:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - polyId
 *         - visitDate
 *         - paymentType
 *       properties:
 *         patientId:
 *           type: integer
 *           description: ID Pasien
 *           example: 1
 *         doctorId:
 *           type: integer
 *           description: ID Dokter yang dituju
 *           example: 1
 *         polyId:
 *           type: integer
 *           description: ID Poliklinik yang dituju
 *           example: 1
 *         visitDate:
 *           type: string
 *           format: date
 *           description: Tanggal rencana kunjungan (YYYY-MM-DD)
 *           example: "2026-09-10"
 *         paymentType:
 *           type: string
 *           enum: [Umum, BPJS, Asuransi_Lainnya]
 *           description: Jenis pembayaran
 *           example: "Umum"
 *         initialComplaint:
 *           type: string
 *           description: Keluhan awal pasien saat mendaftar
 *           example: "Sakit perut bagian bawah"
 */

router.use(authenticate);

/**
 * @swagger
 * /api/registrations:
 *   get:
 *     summary: Mendapatkan daftar pendaftaran
 *     description: Mengambil seluruh daftar pendaftaran kunjungan (Bisa diakses oleh Petugas Pendaftaran dan Dokter)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal awal (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Menunggu, Check In, Pemeriksaan, Selesai]
 *         description: Filter status pendaftaran
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID dokter
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get(
    '/',
    authorize(ROLE.ADMINISTRATOR, ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER),
    registController.getRegistrations
);

/**
 * @swagger
 * /api/registrations/{id}:
 *   get:
 *     summary: Mendapatkan detail pendaftaran berdasarkan ID
 *     description: Mengambil detail spesifik dari sebuah pendaftaran
 *     tags: [Registrations]
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
 *         description: Berhasil mengambil data pendaftaran
 *       404:
 *         description: Data tidak ditemukan
 */
router.get(
    '/:id',
    authorize(ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER),
    registController.getRegistrationById
);

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Mendaftarkan kunjungan pasien baru
 *     description: Mendaftarkan jadwal kunjungan pasien ke poli dan dokter tertentu. Hanya dapat diakses oleh **Petugas Pendaftaran**.
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationInput'
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil dibuat
 *       400:
 *         description: Validasi input gagal
 */
router.post(
    '/',
    authorize(ROLE.PETUGAS_PENDAFTARAN),
    registSchema.validateCreate,
    registController.createRegistration
);

/**
 * @swagger
 * /api/registrations/{id}:
 *   put:
 *     summary: Mengubah data atau status pendaftaran
 *     description: Mengubah informasi pendaftaran atau status pendaftaran. **Petugas Pendaftaran** dapat mengubah data kunjungan dan check-in pasien. **Dokter** hanya dapat mengubah status menjadi Pemeriksaan dan Selesai.
 *     tags: [Registrations]
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
 *             allOf:
 *               - $ref: '#/components/schemas/RegistrationInput'
 *               - type: object
 *                 properties:
 *                   registStatus:
 *                     type: string
 *                     enum: [Menunggu, Check In, Pemeriksaan, Selesai]
 *     responses:
 *       200:
 *         description: Berhasil mengubah data
 *       400:
 *         description: Validasi input gagal
 *       404:
 *         description: Data pendaftaran tidak ditemukan
 */
router.put(
    '/:id',
    authorize(ROLE.PETUGAS_PENDAFTARAN, ROLE.DOKTER),
    registSchema.validateUpdate,
    registController.updateRegistration
);

export default router;
