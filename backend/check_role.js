import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({ where: { email: 'petugas@klinik.com' } });
    console.log("Role string:", user.role);
    console.log("Exact comparison:", user.role === 'Petugas Pendaftaran', user.role === 'Petugas_Pendaftaran');
}
main().finally(() => prisma.$disconnect());
