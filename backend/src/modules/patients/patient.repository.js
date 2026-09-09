import prisma from '../../config/database.js';

const findAll = async (skip, take, search) => {
    const where = search
        ? {
              OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
                  { nik: { contains: search, mode: 'insensitive' } },
              ],
          }
        : {};

    const [patients, total] = await Promise.all([
        prisma.patient.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.patient.count({ where }),
    ]);

    return { patients, total };
};

const findById = async (id) => {
    return prisma.patient.findUnique({
        where: { id: BigInt(id) },
    });
};

const findByNik = async (nik) => {
    return prisma.patient.findUnique({
        where: { nik },
    });
};

const create = async (data) => {
    return prisma.patient.create({
        data,
    });
};

const update = async (id, data) => {
    return prisma.patient.update({
        where: { id: BigInt(id) },
        data,
    });
};

const remove = async (id) => {
    return prisma.patient.delete({
        where: { id: BigInt(id) },
    });
};

const findLastMedicalRecordByPrefix = async (prefix) => {
    return prisma.patient.findFirst({
        where: {
            medicalRecordNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            medicalRecordNumber: 'desc',
        },
        select: {
            medicalRecordNumber: true,
        },
    });
};

export default {
    findAll,
    findById,
    findByNik,
    create,
    update,
    remove,
    findLastMedicalRecordByPrefix,
};
