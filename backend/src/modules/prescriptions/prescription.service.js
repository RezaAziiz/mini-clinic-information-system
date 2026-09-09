import prescriptionRepository from './prescription.repository.js';
import medicalRecordRepository from '../medical-records/medical-record.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { ROLE } from '../../common/constants/enums.js';

const createPrescription = async (data, user) => {
    // 1. Pastikan medical record valid
    const medicalRecord = await medicalRecordRepository.findById(data.medicalRecordId);

    if (!medicalRecord) {
        throw ApiError.notFound('Data rekam medis tidak ditemukan');
    }

    // 2. Pastikan dokter yang login adalah dokter yang membuat rekam medis tersebut
    // Assumption: Hanya dokter pemeriksa yang boleh menerbitkan resep
    if (user.role === ROLE.DOKTER) {
        // medicalRecord.createdBy menyimpan userId dari dokter yang membuat
        if (String(medicalRecord.createdBy) !== String(user.userId)) {
            throw ApiError.forbidden('Anda tidak dapat membuat resep untuk rekam medis milik dokter lain');
        }
    }

    // 3. Buat Resep beserta item-itemnya
    return await prescriptionRepository.createWithItems(data);
};

const getPrescriptionById = async (id) => {
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) {
        throw ApiError.notFound('Resep obat tidak ditemukan');
    }
    return prescription;
};

export default {
    createPrescription,
    getPrescriptionById
};
