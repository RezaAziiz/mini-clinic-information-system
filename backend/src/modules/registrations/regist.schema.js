import { ApiError } from '../../common/utils/ApiError.js';
import { PAYMENT_TYPE, REGIST_STATUS } from '../../common/constants/enums.js';

const registCreateSchema = {
    patientId: { required: true, type: 'number' },
    doctorId: { required: true, type: 'number' },
    polyId: { required: true, type: 'number' },
    visitDate: { required: true, type: 'string', format: 'date' },
    paymentType: { required: true, type: 'string', enum: Object.values(PAYMENT_TYPE) },
    initialComplaint: { required: false, type: 'string' },
};

const registUpdateSchema = {
    ...registCreateSchema,
    registStatus: { required: false, type: 'string', enum: Object.values(REGIST_STATUS) },
};

const validate = (schema, data, isUpdate = false) => {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        if (isUpdate && value === undefined) {
            continue;
        }

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors[field] = `${field} wajib diisi`;
            continue;
        }

        if (value === undefined || value === null || value === '') continue;

        if (rules.type === 'string' && typeof value !== 'string') {
            errors[field] = `${field} harus berupa teks`;
            continue;
        }

        if (rules.type === 'number' && typeof value !== 'number') {
            // Bisa jadi dikirim sebagai string number dari frontend
            if (isNaN(Number(value))) {
                errors[field] = `${field} harus berupa angka (ID)`;
                continue;
            }
        }

        if (rules.enum && !rules.enum.includes(value)) {
            errors[field] = `${field} harus salah satu dari: ${rules.enum.join(', ')}`;
            continue;
        }

        if (rules.format === 'date') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                errors[field] = `${field} format tanggal tidak valid (gunakan YYYY-MM-DD)`;
                continue;
            }
        }
    }

    return errors;
};

const validateCreate = (req, res, next) => {
    const errors = validate(registCreateSchema, req.body, false);
    if (Object.keys(errors).length > 0) {
        return next(ApiError.badRequest('Validation Error', errors));
    }
    
    // Parse ID dari string ke number jika perlu
    if (req.body.patientId) req.body.patientId = Number(req.body.patientId);
    if (req.body.doctorId) req.body.doctorId = Number(req.body.doctorId);
    if (req.body.polyId) req.body.polyId = Number(req.body.polyId);

    next();
};

const validateUpdate = (req, res, next) => {
    const errors = validate(registUpdateSchema, req.body, true);
    if (Object.keys(errors).length > 0) {
        return next(ApiError.badRequest('Validation Error', errors));
    }

    if (req.body.patientId) req.body.patientId = Number(req.body.patientId);
    if (req.body.doctorId) req.body.doctorId = Number(req.body.doctorId);
    if (req.body.polyId) req.body.polyId = Number(req.body.polyId);

    next();
};

export default { validateCreate, validateUpdate };
