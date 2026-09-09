import medicalRecordService from './medical-record.service.js';

const createMedicalRecord = async (req, res, next) => {
    try {
        const medicalRecord = await medicalRecordService.createMedicalRecord(req.body, req.user);
        return res.success(medicalRecord, 'Rekam Medis berhasil disimpan dan kunjungan diselesaikan', 201);
    } catch (error) {
        next(error);
    }
};

const getMedicalRecords = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const records = await medicalRecordService.getMedicalRecordsByPatientId(patientId);
        return res.success(records, 'Riwayat pemeriksaan berhasil diambil');
    } catch (error) {
        next(error);
    }
};

export default {
    createMedicalRecord,
    getMedicalRecords
};
