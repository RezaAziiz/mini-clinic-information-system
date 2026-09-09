import { QUEUE_STATUS } from './src/common/constants/enums.js';
import queueRepository from './src/modules/patient-queues/patient-queue.repository.js';
import prisma from './src/config/database.js';

const generateQueueNumber = async (polyId, date) => {
    const lastQueue = await queueRepository.findLastQueueByPolyAndDate(polyId, date);
    
    if (!lastQueue) {
        return 'A001';
    }

    const lastNumberStr = lastQueue.queueNumber.substring(1);
    const nextNumber = parseInt(lastNumberStr, 10) + 1;
    
    const nextNumberFormatted = nextNumber.toString().padStart(3, '0');
    return `A${nextNumberFormatted}`;
};

async function test() {
    const today = new Date();
    console.log(await generateQueueNumber(1, today));
    
    // Check what's the last queue actually is
    const lastQueue = await queueRepository.findLastQueueByPolyAndDate(1, today);
    console.log('Last Queue is:', lastQueue);
    
    // Check ALL queues
    const all = await prisma.patientQueue.findMany();
    console.log('All queues:', all);
}

test().finally(() => prisma.$disconnect());
