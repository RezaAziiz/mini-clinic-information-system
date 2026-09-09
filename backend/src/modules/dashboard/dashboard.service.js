import prisma from '../../config/database.js';
import { QUEUE_STATUS } from '../../common/constants/enums.js';

const getDashboardSummary = async () => {
    // Tanggal hari ini dari jam 00:00:00 sampai 23:59:59
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = {
        gte: startOfDay,
        lte: endOfDay
    };

    //Total Pasien(Keseluruhan)
    const totalPasien = await prisma.patient.count();

    //Total Kunjungan (Pasien Hari Ini berdasarkan tanggal kunjungan)
    const totalKunjunganHariIni = await prisma.registration.count({
        where: {
            visitDate: dateFilter
        }
    });

    //Total Antrean Hari Ini (Antrean yang dibuat hari ini)
    const totalAntreanHariIni = await prisma.patientQueue.count({
        where: {
            createdAt: dateFilter
        }
    });

    //Antrean Menunggu (Hari Ini)
    const antreanMenunggu = await prisma.patientQueue.count({
        where: {
            createdAt: dateFilter,
            queueStatus: QUEUE_STATUS.MENUNGGU
        }
    });

    //Antrean Selesai (Hari Ini)
    const antreanSelesai = await prisma.patientQueue.count({
        where: {
            createdAt: dateFilter,
            queueStatus: QUEUE_STATUS.SELESAI
        }
    });

    return {
        totalPasien,
        totalKunjunganHariIni,
        totalAntreanHariIni,
        antreanMenunggu,
        antreanSelesai
    };
};

export default {
    getDashboardSummary
};
