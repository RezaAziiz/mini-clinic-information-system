import { ApiError } from '../../common/utils/ApiError.js';

const patientSchema = {
    nik: { required: true, type: 'string', minLength: 16, maxLength: 16 },
    name: { required: true, type: 'string', minLength: 3 },
    gender: { required: true, type: 'string', enum: ['L', 'P'] },
    dateOfBirth: { required: true, type: 'string', format: 'date' },
    phone: { required: false, type: 'string' },
    address: { required: false, type: 'string' },
};

const validate = (schema, data, isUpdate = false) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        // Jika update dan field tidak dikirim, skip validasi field ini
        if (isUpdate && value === undefined) {
            continue;
        }

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} wajib diisi`);
            continue;
        }

        if (value === undefined || value === null || value === '') continue;

        if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`${field} harus berupa teks`);
            continue;
        }

        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} minimal ${rules.minLength} karakter`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} maksimal ${rules.maxLength} karakter`);
        }

        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} harus salah satu dari: ${rules.enum.join(', ')}`);
        }

        if (rules.format === 'date') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                errors.push(`${field} format tanggal tidak valid (gunakan YYYY-MM-DD)`);
            }
        }
    }

    return errors;
};

const validateCreate = (req, res, next) => {
    const errors = validate(patientSchema, req.body, false);
    if (errors.length > 0) {
        return next(ApiError.badRequest('Validasi gagal', errors));
    }
    next();
};

const validateUpdate = (req, res, next) => {
    const errors = validate(patientSchema, req.body, true);
    if (errors.length > 0) {
        return next(ApiError.badRequest('Validasi gagal', errors));
    }
    next();
};

export default { validateCreate, validateUpdate };
