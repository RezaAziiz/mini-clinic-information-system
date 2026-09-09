import prescriptionService from './prescription.service.js';

const createPrescription = async (req, res, next) => {
    try {
        const prescription = await prescriptionService.createPrescription(req.body, req.user);
        return res.success(prescription, 'Resep obat berhasil dibuat', 201);
    } catch (error) {
        next(error);
    }
};

const getPrescription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prescription = await prescriptionService.getPrescriptionById(id);
        return res.success(prescription, 'Data resep obat berhasil diambil');
    } catch (error) {
        next(error);
    }
};

export default {
    createPrescription,
    getPrescription
};
