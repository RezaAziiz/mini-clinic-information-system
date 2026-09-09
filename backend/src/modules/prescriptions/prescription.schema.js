import { ApiError } from '../../common/utils/ApiError.js';

const validateCreate = (req, res, next) => {
    try {
        const { medicalRecordId, notes, items } = req.body;

        if (!medicalRecordId) {
            throw ApiError.badRequest('Validation Error', { medicalRecordId: 'medicalRecordId wajib diisi' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw ApiError.badRequest('Validation Error', { items: 'Daftar obat (items) wajib diisi dan minimal 1 obat' });
        }

        const itemErrors = {};
        items.forEach((item, index) => {
            const errors = {};
            if (!item.medicineName) errors.medicineName = 'Nama obat wajib diisi';
            if (!item.dosage) errors.dosage = 'Dosis wajib diisi';
            if (!item.frequency) errors.frequency = 'Frekuensi wajib diisi';
            if (!item.quantity) errors.quantity = 'Jumlah (quantity) wajib diisi';
            else if (typeof item.quantity !== 'number') errors.quantity = 'Jumlah harus berupa angka';

            if (Object.keys(errors).length > 0) {
                itemErrors[`item_${index}`] = errors;
            }
        });

        if (Object.keys(itemErrors).length > 0) {
            throw ApiError.badRequest('Validation Error', itemErrors);
        }

        // Parse format numerik
        req.body.medicalRecordId = Number(medicalRecordId);
        next();
    } catch (error) {
        next(error);
    }
};

export default {
    validateCreate
};
