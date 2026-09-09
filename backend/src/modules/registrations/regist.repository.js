import prisma from '../../config/database.js';

const findAll = async (filters = {}) => {
    const { startDate, endDate, status, doctorId, polyId } = filters;
    const where = {};

    if (startDate && endDate) {
        where.visitDate = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    } else if (startDate) {
        // Jika hanya ada 1 tanggal, cari spesifik di hari itu
        const date = new Date(startDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        where.visitDate = {
            gte: date,
            lt: nextDay
        };
    }

    if (status) where.registStatus = status;
    if (doctorId) where.doctorId = Number(doctorId);
    if (polyId) where.polyId = Number(polyId);

    return await prisma.registration.findMany({
        where,
        include: {
            patient: {
                select: { id: true, name: true, medicalRecordNumber: true, gender: true }
            },
            doctor: {
                select: { id: true, name: true, specialization: true }
            },
            polyclinic: {
                select: { id: true, name: true }
            }
        },
        orderBy: { visitDate: 'desc' }
    });
};

const findById = async (id) => {
    return await prisma.registration.findUnique({
        where: { id: Number(id) },
        include: {
            patient: true,
            doctor: true,
            polyclinic: true
        }
    });
};

const create = async (data) => {
    return await prisma.registration.create({
        data: {
            patientId: data.patientId,
            doctorId: data.doctorId,
            polyId: data.polyId,
            visitDate: new Date(data.visitDate),
            paymentType: data.paymentType,
            initialComplaint: data.initialComplaint || null,
            registStatus: 'Menunggu', // Default status awal
        },
        include: {
            patient: true,
            doctor: true,
            polyclinic: true
        }
    });
};

const update = async (id, data) => {
    const updateData = { ...data };
    
    // Jika ada update visitDate, format ke Date
    if (updateData.visitDate) {
        updateData.visitDate = new Date(updateData.visitDate);
    }

    return await prisma.registration.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
            patient: true,
            doctor: true,
            polyclinic: true
        }
    });
};

export default {
    findAll,
    findById,
    create,
    update
};
