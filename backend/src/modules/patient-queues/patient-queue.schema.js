import { ApiError } from '../../common/utils/ApiError.js';
import { QUEUE_STATUS } from '../../common/constants/enums.js';

const queueCreateSchema = {
    registrationId: { required: true, type: 'number' }
};

const queueStatusSchema = {
    queueStatus: { required: true, type: 'string', enum: Object.values(QUEUE_STATUS) }
};

const validate = (schema, data) => {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors[field] = `${field} wajib diisi`;
            continue;
        }

        if (value !== undefined && value !== null && value !== '') {
            if (typeof value !== rules.type) {
                errors[field] = `${field} harus berupa ${rules.type}`;
            }

            if (rules.enum && !rules.enum.includes(value)) {
                errors[field] = `${field} hanya boleh berisi ${rules.enum.join(', ')}`;
            }
        }
    }

    if (Object.keys(errors).length > 0) {
        throw ApiError.badRequest('Validation Error', errors);
    }
};

export default {
    validateCreate: (req, res, next) => {
        try {
            // Karena schema mengharapkan number, pastikan parsing body
            const body = { ...req.body };
            if (body.registrationId) body.registrationId = Number(body.registrationId);
            
            validate(queueCreateSchema, body);
            req.body = body; // timpa dengan parsed data
            next();
        } catch (error) {
            next(error);
        }
    },
    validateStatus: (req, res, next) => {
        try {
            validate(queueStatusSchema, req.body);
            next();
        } catch (error) {
            next(error);
        }
    }
};
