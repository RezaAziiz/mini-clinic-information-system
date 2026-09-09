import { ApiError } from '../../common/utils/ApiError.js';

const medicalRecordCreateSchema = {
    registrationId: { required: true, type: 'number' },
    subjective: { required: true, type: 'string' },
    bloodPressure: { required: false, type: 'string' },
    temperature: { required: false, type: 'number' },
    weight: { required: false, type: 'number' },
    height: { required: false, type: 'number' },
    assessment: { required: true, type: 'string' },
    plan: { required: true, type: 'string' },
    medicalAction: { required: false, type: 'string' }
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
        }
    }

    if (Object.keys(errors).length > 0) {
        throw ApiError.badRequest('Validation Error', errors);
    }
};

export default {
    validateCreate: (req, res, next) => {
        try {
            // Parsing untuk field numerik jika dikirim sebagai string
            const body = { ...req.body };
            if (body.registrationId) body.registrationId = Number(body.registrationId);
            if (body.temperature) body.temperature = Number(body.temperature);
            if (body.weight) body.weight = Number(body.weight);
            if (body.height) body.height = Number(body.height);

            validate(medicalRecordCreateSchema, body);
            req.body = body; // update dengan data yang sudah di-parse
            next();
        } catch (error) {
            next(error);
        }
    }
};
