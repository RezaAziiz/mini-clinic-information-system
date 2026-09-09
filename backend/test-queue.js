import prisma from './src/config/database.js';

async function main() {
  const queues = await prisma.patientQueue.findMany();
  console.log(queues);
}

main().finally(() => prisma.$disconnect());
