import { ApiError } from '../../common/utils/ApiError.js';

const loginSchema = {
    email: {
        required: true,
        type: 'string',
        format: 'email',
    },
    password: {
        required: true,
        type: 'string',
        minLength: 6,
    },
};

const validate = (schema, data) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} wajib diisi`);
            continue;
        }

        if (value === undefined || value === null) continue;

        if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`${field} harus berupa teks`);
            continue;
        }

        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} minimal ${rules.minLength} karakter`);
        }

        if (rules.format === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push(`${field} format tidak valid`);
            }
        }
    }

    return errors;
};

const validateLogin = (req, res, next) => {
    const errors = validate(loginSchema, req.body);

    if (errors.length > 0) {
        return next(ApiError.badRequest('Validasi gagal', errors));
    }

    next();
};

export default { validateLogin };
