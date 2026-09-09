import prisma from '../../config/database.js';

const findAll = async (filters = {}) => {
    const { startDate, endDate, status, polyId } = filters;
    const where = {};

    if (startDate && endDate) {
        where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    } else if (startDate) {
        // Jika hanya ada 1 tanggal, cari spesifik di hari itu
        const date = new Date(startDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        where.createdAt = {
            gte: date,
            lt: nextDay
        };
    }

    if (status) where.queueStatus = status;

    if (polyId) {
        where.registration = {
            polyId: Number(polyId)
        };
    }

    return await prisma.patientQueue.findMany({
        where,
        include: {
            registration: {
                include: {
                    patient: {
                        select: { id: true, name: true, medicalRecordNumber: true }
                    },
                    polyclinic: {
                        select: { id: true, name: true }
                    },
                    doctor: {
                        select: { id: true, name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
};

const findById = async (id) => {
    return await prisma.patientQueue.findUnique({
        where: { id: Number(id) },
        include: {
            registration: {
                include: {
                    patient: true,
                    polyclinic: true,
                    doctor: true
                }
            }
        }
    });
};

const findByRegistrationId = async (registrationId) => {
    return await prisma.patientQueue.findUnique({
        where: { registrationId: Number(registrationId) }
    });
};

const findLastQueueByPolyAndDate = async (polyId, date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.patientQueue.findFirst({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            },
            registration: {
                polyId: Number(polyId)
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
};

const create = async (data) => {
    return await prisma.patientQueue.create({
        data,
        include: {
            registration: {
                include: {
                    patient: true,
                    polyclinic: true
                }
            }
        }
    });
};

const update = async (id, data) => {
    return await prisma.patientQueue.update({
        where: { id: Number(id) },
        data,
        include: {
            registration: {
                include: {
                    patient: true,
                    polyclinic: true
                }
            }
        }
    });
};

export default {
    findAll,
    findById,
    findByRegistrationId,
    findLastQueueByPolyAndDate,
    create,
    update
};
