import patientRepository from './patient.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';

const serializePatient = (patient) => {
    if (!patient) return null;
    return {
        ...patient,
        id: patient.id.toString(),
    };
};

const getPatients = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const { patients, total } = await patientRepository.findAll(skip, limit, search);

    return {
        data: patients.map(serializePatient),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getPatientById = async (id) => {
    const patient = await patientRepository.findById(id);

    if (!patient) {
        throw ApiError.notFound('Data pasien tidak ditemukan');
    }

    return serializePatient(patient);
};

const generateMedicalRecordNumber = async () => {
    const date = new Date();
    // Format: RM-YYMMDD-XXXX
    const prefix = `RM-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const lastPatient = await patientRepository.findLastMedicalRecordByPrefix(prefix);

    if (!lastPatient) {
        return `${prefix}-0001`;
    }

    const lastSequence = parseInt(lastPatient.medicalRecordNumber.split('-')[2]);
    const nextSequence = (lastSequence + 1).toString().padStart(4, '0');

    return `${prefix}-${nextSequence}`;
};

const createPatient = async (data) => {
    // Cek duplikasi NIK
    const existingNik = await patientRepository.findByNik(data.nik);
    if (existingNik) {
        throw ApiError.badRequest('NIK sudah terdaftar');
    }

    // Generate Nomor Rekam Medis (Auto Generate)
    const medicalRecordNumber = await generateMedicalRecordNumber();

    const newPatient = await patientRepository.create({
        ...data,
        medicalRecordNumber,
        dateOfBirth: new Date(data.dateOfBirth),
    });

    return serializePatient(newPatient);
};

const updatePatient = async (id, data) => {
    const patient = await patientRepository.findById(id);

    if (!patient) {
        throw ApiError.notFound('Data pasien tidak ditemukan');
    }

    // Jika update NIK, cek apakah NIK dipakai orang lain
    if (data.nik && data.nik !== patient.nik) {
        const existingNik = await patientRepository.findByNik(data.nik);
        if (existingNik) {
            throw ApiError.badRequest('NIK sudah terdaftar untuk pasien lain');
        }
    }

    const updateData = { ...data };
    if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    const updatedPatient = await patientRepository.update(id, updateData);

    return serializePatient(updatedPatient);
};

const deletePatient = async (id) => {
    const patient = await patientRepository.findById(id);

    if (!patient) {
        throw ApiError.notFound('Data pasien tidak ditemukan');
    }

    try {
        await patientRepository.remove(id);
        return true;
    } catch (error) {
        // Handle constraint violation (contoh: pasien sudah punya rekam medis/antrean)
        if (error.code === 'P2003') {
            throw ApiError.badRequest('Tidak dapat menghapus pasien karena data sudah digunakan di pendaftaran/rekam medis');
        }
        throw error;
    }
};

export default {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};
