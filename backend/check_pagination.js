import { config } from 'dotenv';
config();

import prisma from './src/config/database.js';

async function main() {
  const skip = 0;
  const take = 10;
  const search = '';
  
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

  console.log(`Length: ${patients.length}, Total: ${total}`);
  
  process.exit(0);
}

main();
