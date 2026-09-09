import prisma from '../../config/database.js';

const createWithItems = async (data) => {
    // Prisma secara otomatis menjalankan nested create dalam satu transaction.
    // Jika salah satu item gagal, seluruh pembuatan resep akan dibatalkan.
    return await prisma.prescription.create({
        data: {
            medicalRecordId: data.medicalRecordId,
            notes: data.notes,
            prescriptionItems: {
                create: data.items.map(item => ({
                    medicineName: item.medicineName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    quantity: item.quantity,
                    instructions: item.instructions
                }))
            }
        },
        include: {
            prescriptionItems: true
        }
    });
};

const findById = async (id) => {
    return await prisma.prescription.findUnique({
        where: { id: Number(id) },
        include: {
            prescriptionItems: true,
            medicalRecord: {
                include: {
                    registration: {
                        include: {
                            patient: true,
                            doctor: true
                        }
                    }
                }
            }
        }
    });
};

export default {
    createWithItems,
    findById
};
