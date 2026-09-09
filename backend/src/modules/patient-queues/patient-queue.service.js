import queueRepository from './patient-queue.repository.js';
import registRepository from '../registrations/regist.repository.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { QUEUE_STATUS } from '../../common/constants/enums.js';

const generateQueueNumber = async (polyId, date) => {
    const lastQueue = await queueRepository.findLastQueueByPolyAndDate(polyId, date);

    if (!lastQueue) {
        return 'A001';
    }

    // Ekstrak angka dari antrean terakhir menggunakan Regex 
    const match = lastQueue.queueNumber.match(/\d+$/);
    const lastNumber = match ? parseInt(match[0], 10) : 0;
    const nextNumber = lastNumber + 1;

    // Format ke string dengan padding 000 (contoh 6 ke 'A006')
    const nextNumberFormatted = nextNumber.toString().padStart(3, '0');
    return `A${nextNumberFormatted}`;
};

const getAllQueues = async (filters) => {
    return await queueRepository.findAll(filters);
};

const getQueueById = async (id) => {
    const queue = await queueRepository.findById(id);
    if (!queue) throw ApiError.notFound('Data antrean tidak ditemukan');
    return queue;
};

const createQueue = async (data) => {
    const registration = await registRepository.findById(data.registrationId);
    if (!registration) {
        throw ApiError.notFound('Data pendaftaran tidak ditemukan');
    }

    // Cek apakah pendaftaran sudah memiliki antrean
    const existingQueue = await queueRepository.findByRegistrationId(registration.id);

    if (existingQueue) {
        throw ApiError.badRequest('Pendaftaran ini sudah memiliki nomor antrean');
    }

    const today = new Date();
    const nextQueueNumber = await generateQueueNumber(registration.polyId, today);

    const queueData = {
        registrationId: registration.id,
        queueNumber: nextQueueNumber,
        queueStatus: QUEUE_STATUS.MENUNGGU
    };

    return await queueRepository.create(queueData);
};

const callQueue = async (id) => {
    const queue = await getQueueById(id);

    if (queue.queueStatus === QUEUE_STATUS.SELESAI) {
        throw ApiError.badRequest('Tidak bisa memanggil antrean yang sudah selesai');
    }

    return await queueRepository.update(id, {
        queueStatus: QUEUE_STATUS.DIPANGGIL,
        calledAt: new Date()
    });
};

const updateQueueStatus = async (id, statusData) => {
    const queue = await getQueueById(id);

    return await queueRepository.update(id, {
        queueStatus: statusData.queueStatus
    });
};

export default {
    getAllQueues,
    getQueueById,
    createQueue,
    callQueue,
    updateQueueStatus
};
