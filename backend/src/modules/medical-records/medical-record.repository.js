import prisma from '../../config/database.js';
import { REGIST_STATUS, QUEUE_STATUS } from '../../common/constants/enums.js';

const createMedicalRecord = async (data, userId) => {
    // Jalankan operasi-operasi nya dalam satu transaction
    return await prisma.$transaction(async (tx) => {
        // Buat medical record
        const medicalRecord = await tx.medicalRecord.create({
            data: {
                registrationId: data.registrationId,
                subjective: data.subjective,
                bloodPressure: data.bloodPressure,
                temperature: data.temperature,
                weight: data.weight,
                height: data.height,
                assessment: data.assessment,
                plan: data.plan,
                medicalAction: data.medicalAction,
                examinedAt: new Date(), // Waktu pemeriksaan
                createdBy: userId,
                updatedBy: userId
            }
        });

        //Update status registrasi menjadi Selesai
        await tx.registration.update({
            where: { id: data.registrationId },
            data: { registStatus: REGIST_STATUS.SELESAI }
        });

        // Update status antrean menjadi Selesai (jika pasien memiliki antrean)
        // Kita cari dulu antreannya karena patient_queues relasinya ke registration
        const queue = await tx.patientQueue.findUnique({
            where: { registrationId: data.registrationId }
        });

        if (queue) {
            await tx.patientQueue.update({
                where: { registrationId: data.registrationId },
                data: { queueStatus: QUEUE_STATUS.SELESAI }
            });
        }

        return medicalRecord;
    });
};

const findByPatientId = async (patientId) => {
    return await prisma.medicalRecord.findMany({
        where: {
            registration: {
                patientId: Number(patientId)
            }
        },
        include: {
            registration: {
                include: {
                    doctor: true,
                    polyclinic: true
                }
            },
            prescriptions: {
                include: { prescriptionItems: true }
            }
        },
        orderBy: {
            examinedAt: 'desc'
        }
    });
};

const findByRegistrationId = async (registrationId) => {
    return await prisma.medicalRecord.findUnique({
        where: { registrationId: Number(registrationId) }
    });
};

const findById = async (id) => {
    return await prisma.medicalRecord.findUnique({
        where: { id: Number(id) }
    });
};

const findDoctorByUserId = async (userId) => {
    return await prisma.doctor.findUnique({
        where: { userId: Number(userId) }
    });
};

export default {
    createMedicalRecord,
    findByPatientId,
    findByRegistrationId,
    findById,
    findDoctorByUserId
};
