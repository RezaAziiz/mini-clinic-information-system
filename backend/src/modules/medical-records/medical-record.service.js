import medicalRecordRepository from './medical-record.repository.js';
import registRepository from '../registrations/regist.repository.js';
import patientRepository from '../patients/patient.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { ROLE } from '../../common/constants/enums.js';

const createMedicalRecord = async (data, user) => {
    // Cek apakah pendaftaran valid
    const registration = await registRepository.findById(data.registrationId);
    if (!registration) {
        throw ApiError.notFound('Data pendaftaran tidak ditemukan');
    }

    // memastikan dokter yang memeriksa adalah dokter yang dituju, kecuali admin yang memiliki akses super
    if (user.role === ROLE.DOKTER) {
        const doctor = await medicalRecordRepository.findDoctorByUserId(user.userId);

        if (!doctor || doctor.id !== registration.doctorId) {
            throw ApiError.forbidden('Anda tidak memiliki akses untuk memeriksa pasien ini');
        }
    }

    // Pastikan belum ada rekam medis untuk pendaftaran ini
    const existingRecord = await medicalRecordRepository.findByRegistrationId(data.registrationId);
    if (existingRecord) {
        throw ApiError.badRequest('Rekam medis untuk pendaftaran ini sudah ada');
    }

    // Buat Rekam Medis & Selesaikan Status (Transaction di Repository)
    return await medicalRecordRepository.createMedicalRecord(data, user.userId);
};

const getMedicalRecordsByPatientId = async (patientId) => {
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
        throw ApiError.notFound('Pasien tidak ditemukan');
    }

    return await medicalRecordRepository.findByPatientId(patientId);
};

export default {
    createMedicalRecord,
    getMedicalRecordsByPatientId
};
