import patientService from './patient.service.js';

const getPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const result = await patientService.getPatients(page, limit, search);
        return res.success(result, 'Data pasien berhasil diambil');
    } catch (error) {
        next(error);
    }
};

const getPatientById = async (req, res, next) => {
    try {
        const result = await patientService.getPatientById(req.params.id);
        return res.success(result, 'Detail pasien berhasil diambil');
    } catch (error) {
        next(error);
    }
};

const createPatient = async (req, res, next) => {
    try {
        const result = await patientService.createPatient(req.body);
        return res.success(result, 'Data pasien berhasil ditambahkan', 201);
    } catch (error) {
        next(error);
    }
};

const updatePatient = async (req, res, next) => {
    try {
        const result = await patientService.updatePatient(req.params.id, req.body);
        return res.success(result, 'Data pasien berhasil diperbarui');
    } catch (error) {
        next(error);
    }
};

const deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.id);
        return res.success(null, 'Data pasien berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

export default {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};
