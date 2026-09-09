import queueService from './patient-queue.service.js';

const getQueues = async (req, res, next) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
            polyId: req.query.polyId,
            doctorId: req.query.doctorId,
        };

        const queues = await queueService.getAllQueues(filters);

        res.status(200).json({
            success: true,
            message: 'Data antrean berhasil diambil',
            data: queues
        });
    } catch (error) {
        next(error);
    }
};

const createQueue = async (req, res, next) => {
    try {
        const queue = await queueService.createQueue(req.body);

        res.status(201).json({
            success: true,
            message: 'Antrean berhasil dibuat',
            data: queue
        });
    } catch (error) {
        next(error);
    }
};

const callQueue = async (req, res, next) => {
    try {
        const queue = await queueService.callQueue(Number(req.params.id));

        res.status(200).json({
            success: true,
            message: 'Antrean berhasil dipanggil',
            data: queue
        });
    } catch (error) {
        next(error);
    }
};

const updateQueueStatus = async (req, res, next) => {
    try {
        const queue = await queueService.updateQueueStatus(Number(req.params.id), req.body);

        res.status(200).json({
            success: true,
            message: 'Status antrean berhasil diupdate',
            data: queue
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getQueues,
    createQueue,
    callQueue,
    updateQueueStatus
};
