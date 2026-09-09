import registRepository from './regist.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';
import prisma from '../../config/database.js';
import { REGIST_STATUS, ROLE } from '../../common/constants/enums.js';

const getAllRegistrations = async (filters) => {
    return await registRepository.findAll(filters);
};

const getRegistrationById = async (id) => {
    const registration = await registRepository.findById(id);
    if (!registration) {
        throw ApiError.notFound('Data pendaftaran tidak ditemukan');
    }
    return registration;
};

// Fungsi helper untuk mengecek referensi
const checkReferences = async (patientId, doctorId, polyId) => {
    if (patientId) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) throw ApiError.notFound('Data pasien tidak ditemukan');
    }

    if (doctorId) {
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) throw ApiError.notFound('Data dokter tidak ditemukan');
    }

    if (polyId) {
        const poly = await prisma.polyclinic.findUnique({ where: { id: polyId } });
        if (!poly) throw ApiError.notFound('Data poliklinik tidak ditemukan');
    }
};

const createRegistration = async (data) => {
    await checkReferences(data.patientId, data.doctorId, data.polyId);
    return await registRepository.create(data);
};

const updateRegistration = async (id, data, user) => {
    const existing = await getRegistrationById(id);

    // Validasi transisi status jika ada perubahan status
    if (data.registStatus && data.registStatus !== existing.registStatus) {
        const statusFlow = {
            [REGIST_STATUS.MENUNGGU]: REGIST_STATUS.CHECK_IN,
            [REGIST_STATUS.CHECK_IN]: REGIST_STATUS.PEMERIKSAAN,
            [REGIST_STATUS.PEMERIKSAAN]: REGIST_STATUS.SELESAI,
            [REGIST_STATUS.SELESAI]: null // Selesai adalah state akhir
        };

        const allowedNextStatus = statusFlow[existing.registStatus];

        if (data.registStatus !== allowedNextStatus) {
            throw ApiError.badRequest(
                `Transisi status tidak valid. Status '${existing.registStatus}' hanya bisa diubah menjadi '${allowedNextStatus}'`
            );
        }

        // Pengecekan otorisasi perubahan status berdasarkan Role
        if (user.role === ROLE.PETUGAS_PENDAFTARAN && allowedNextStatus !== REGIST_STATUS.CHECK_IN) {
            throw ApiError.forbidden(`Petugas Pendaftaran hanya berhak mengubah status menjadi ${REGIST_STATUS.CHECK_IN}`);
        }

        if (user.role === ROLE.DOKTER && ![REGIST_STATUS.PEMERIKSAAN, REGIST_STATUS.SELESAI].includes(allowedNextStatus)) {
            throw ApiError.forbidden(`Dokter hanya berhak mengubah status menjadi ${REGIST_STATUS.PEMERIKSAAN} atau ${REGIST_STATUS.SELESAI}`);
        }
    }

    // Dokter tidak mengupdate informasi pendaftaran selain status
    if (user.role === ROLE.DOKTER) {
        const fieldsToUpdate = Object.keys(data).filter(key => key !== 'registStatus' && data[key] !== undefined);
        if (fieldsToUpdate.length > 0) {
            throw ApiError.forbidden('Dokter hanya diizinkan mengubah status kunjungan, tidak boleh merubah detail data pasien atau poliklinik');
        }
    }

    // Jika update melibatkan perubahan referensi pasien/dokter/poli
    if (data.patientId || data.doctorId || data.polyId) {
        await checkReferences(data.patientId, data.doctorId, data.polyId);
    }

    return await registRepository.update(id, data);
};

export default {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration
};
