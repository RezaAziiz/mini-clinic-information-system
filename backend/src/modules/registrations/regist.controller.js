import registService from './regist.service.js';

const getRegistrations = async (req, res, next) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
            doctorId: req.query.doctorId,
            polyId: req.query.polyId
        };

        const registrations = await registService.getAllRegistrations(filters);

        res.status(200).json({
            success: true,
            message: 'Data pendaftaran berhasil diambil',
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};

const getRegistrationById = async (req, res, next) => {
    try {
        const registration = await registService.getRegistrationById(Number(req.params.id));
        
        res.status(200).json({
            success: true,
            message: 'Data pendaftaran berhasil diambil',
            data: registration
        });
    } catch (error) {
        next(error);
    }
};

const createRegistration = async (req, res, next) => {
    try {
        const registration = await registService.createRegistration(req.body);

        res.status(201).json({
            success: true,
            message: 'Pendaftaran kunjungan berhasil ditambahkan',
            data: registration
        });
    } catch (error) {
        next(error);
    }
};

const updateRegistration = async (req, res, next) => {
    try {
        const registration = await registService.updateRegistration(Number(req.params.id), req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Data pendaftaran berhasil diperbarui',
            data: registration
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration
};
