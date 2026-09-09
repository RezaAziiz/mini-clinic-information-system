import { Router } from 'express';
import patientController from './patient.controller.js';
import patientSchema from './patient.schema.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Semua rute pasien harus terautentikasi
router.use(authenticate);

// Berdasarkan Use Case, hanya Administrator dan Petugas Pendaftaran yang mengelola pasien
const managePatientAccess = authorize('Administrator', 'Petugas Pendaftaran');

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients with pagination and search
 *     description: Mengambil daftar pasien. Bisa dicari berdasarkan NIK, Nama, atau No Rekam Medis
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword pencarian (NIK/Nama/No RM)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Anda tidak memiliki akses ke resource ini
 */
router.get('/', managePatientAccess, patientController.getPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Pasien
 *     responses:
 *       200:
 *         description: Detail pasien
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Anda tidak memiliki akses ke resource ini
 *       404:
 *         description: Data tidak ditemukan
 */
router.get('/:id', managePatientAccess, patientController.getPatientById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     tags: [Patients]
 *     summary: Add new patient
 *     description: Menambahkan data pasien baru. Nomor Rekam Medis dibuat otomatis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       201:
 *         description: Pasien berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Anda tidak memiliki akses ke resource ini
 */
router.post('/', managePatientAccess, patientSchema.validateCreate, patientController.createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update patient data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Pasien
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       200:
 *         description: Pasien berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Anda tidak memiliki akses ke resource ini
 *       404:
 *         description: Data tidak ditemukan
 */
router.put('/:id', managePatientAccess, patientSchema.validateUpdate, patientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete a patient
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Pasien
 *     responses:
 *       200:
 *         description: Pasien berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Pasien tidak bisa dihapus karena punya relasi
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Anda tidak memiliki akses ke resource ini
 *       404:
 *         description: Data tidak ditemukan
 */
router.delete('/:id', managePatientAccess, patientController.deletePatient);

export default router;
