import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...\n');

    // 1. Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@klinik.com',
            passwordHash,
            role: 'Administrator',
        },
    });

    const dokterUser1 = await prisma.user.create({
        data: {
            email: 'dr.sari@klinik.com',
            passwordHash,
            role: 'Dokter',
        },
    });

    const dokterUser2 = await prisma.user.create({
        data: {
            email: 'dr.budi@klinik.com',
            passwordHash,
            role: 'Dokter',
        },
    });

    const dokterUser3 = await prisma.user.create({
        data: {
            email: 'dr.rina@klinik.com',
            passwordHash,
            role: 'Dokter',
        },
    });

    const petugas = await prisma.user.create({
        data: {
            email: 'petugas@klinik.com',
            passwordHash,
            role: 'Petugas_Pendaftaran',
        },
    });

    console.log(`Created ${5} users`);

    // 2. Polyclinics
    const poliUmum = await prisma.polyclinic.create({
        data: {
            name: 'Poli Umum',
            description: 'Pelayanan kesehatan umum untuk semua keluhan',
        },
    });

    const poliGigi = await prisma.polyclinic.create({
        data: {
            name: 'Poli Gigi',
            description: 'Pelayanan kesehatan gigi dan mulut',
        },
    });

    const poliAnak = await prisma.polyclinic.create({
        data: {
            name: 'Poli Anak',
            description: 'Pelayanan kesehatan anak dan tumbuh kembang',
        },
    });

    console.log(`Created ${3} polyclinics`);


    // 3. Doctors
    const drSari = await prisma.doctor.create({
        data: {
            userId: dokterUser1.id,
            doctorCode: 'DKT-001',
            name: 'dr. Sari Dewi, Sp.PD',
            phone: '081234567890',
            specialization: 'Penyakit Dalam',
            polyId: poliUmum.id,
        },
    });

    const drBudi = await prisma.doctor.create({
        data: {
            userId: dokterUser2.id,
            doctorCode: 'DKT-002',
            name: 'drg. Budi Santoso',
            phone: '081234567891',
            specialization: 'Dokter Gigi',
            polyId: poliGigi.id,
        },
    });

    const drRina = await prisma.doctor.create({
        data: {
            userId: dokterUser3.id,
            doctorCode: 'DKT-003',
            name: 'dr. Rina Kartika, Sp.A',
            phone: '081234567892',
            specialization: 'Dokter Anak',
            polyId: poliAnak.id,
        },
    });

    console.log(`Created ${3} doctors`);

    // 4. Patients
    const patients = await Promise.all([
        prisma.patient.create({
            data: {
                medicalRecordNumber: 'RM-000001',
                nik: '3201012345670001',
                name: 'Ahmad Fauzi',
                gender: 'L',
                dateOfBirth: new Date('1990-05-15'),
                phone: '082111223344',
                address: 'Jl. Merdeka No. 10, Bandung',
            },
        }),
        prisma.patient.create({
            data: {
                medicalRecordNumber: 'RM-000002',
                nik: '3201012345670002',
                name: 'Siti Nurhaliza',
                gender: 'P',
                dateOfBirth: new Date('1985-08-22'),
                phone: '082111223355',
                address: 'Jl. Sudirman No. 25, Bandung',
            },
        }),
        prisma.patient.create({
            data: {
                medicalRecordNumber: 'RM-000003',
                nik: '3201012345670003',
                name: 'Rudi Hermawan',
                gender: 'L',
                dateOfBirth: new Date('1978-12-03'),
                phone: '082111223366',
                address: 'Jl. Asia Afrika No. 5, Bandung',
            },
        }),
        prisma.patient.create({
            data: {
                medicalRecordNumber: 'RM-000004',
                nik: '3201012345670004',
                name: 'Dewi Lestari',
                gender: 'P',
                dateOfBirth: new Date('1995-03-10'),
                phone: '082111223377',
                address: 'Jl. Braga No. 42, Bandung',
            },
        }),
        prisma.patient.create({
            data: {
                medicalRecordNumber: 'RM-000005',
                nik: '3201012345670005',
                name: 'Rizky Pratama',
                gender: 'L',
                dateOfBirth: new Date('2018-07-20'),
                phone: '082111223388',
                address: 'Jl. Dago No. 88, Bandung',
            },
        }),
    ]);

    console.log(`Created ${patients.length} patients`);

    // 5. Registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reg1 = await prisma.registration.create({
        data: {
            patientId: patients[0].id,
            doctorId: drSari.id,
            polyId: poliUmum.id,
            visitDate: today,
            paymentType: 'BPJS',
            initialComplaint: 'Demam dan batuk sudah 3 hari',
            registStatus: 'Selesai',
        },
    });

    const reg2 = await prisma.registration.create({
        data: {
            patientId: patients[1].id,
            doctorId: drBudi.id,
            polyId: poliGigi.id,
            visitDate: today,
            paymentType: 'Umum',
            initialComplaint: 'Sakit gigi geraham kanan bawah',
            registStatus: 'Pemeriksaan',
        },
    });

    const reg3 = await prisma.registration.create({
        data: {
            patientId: patients[2].id,
            doctorId: drSari.id,
            polyId: poliUmum.id,
            visitDate: today,
            paymentType: 'BPJS',
            initialComplaint: 'Kontrol tekanan darah tinggi',
            registStatus: 'Check_In',
        },
    });

    const reg4 = await prisma.registration.create({
        data: {
            patientId: patients[3].id,
            doctorId: drSari.id,
            polyId: poliUmum.id,
            visitDate: today,
            paymentType: 'Umum',
            initialComplaint: 'Mual dan pusing sejak kemarin',
            registStatus: 'Menunggu',
        },
    });

    const reg5 = await prisma.registration.create({
        data: {
            patientId: patients[4].id,
            doctorId: drRina.id,
            polyId: poliAnak.id,
            visitDate: today,
            paymentType: 'BPJS',
            initialComplaint: 'Demam tinggi dan ruam kulit',
            registStatus: 'Menunggu',
        },
    });

    console.log(`Created ${5} registrations`);

    // 6. Patient Queues
    await Promise.all([
        prisma.patientQueue.create({
            data: {
                registrationId: reg1.id,
                queueNumber: 'A-001',
                queueStatus: 'Selesai',
                calledAt: new Date(),
            },
        }),
        prisma.patientQueue.create({
            data: {
                registrationId: reg2.id,
                queueNumber: 'B-001',
                queueStatus: 'Dipanggil',
                calledAt: new Date(),
            },
        }),
        prisma.patientQueue.create({
            data: {
                registrationId: reg3.id,
                queueNumber: 'A-002',
                queueStatus: 'Menunggu',
            },
        }),
        prisma.patientQueue.create({
            data: {
                registrationId: reg4.id,
                queueNumber: 'A-003',
                queueStatus: 'Menunggu',
            },
        }),
        prisma.patientQueue.create({
            data: {
                registrationId: reg5.id,
                queueNumber: 'C-001',
                queueStatus: 'Menunggu',
            },
        }),
    ]);

    console.log(`Created ${5} patient queues`);

    // 7. Medical Record (untuk registrasi yang sudah selesai)
    const medRecord1 = await prisma.medicalRecord.create({
        data: {
            registrationId: reg1.id,
            subjective: 'Pasien mengeluh demam sejak 3 hari lalu, disertai batuk berdahak dan pilek. Sudah minum paracetamol tapi belum membaik.',
            bloodPressure: '120/80',
            temperature: 38.5,
            weight: 65.0,
            height: 170.0,
            assessment: 'ISPA (Infeksi Saluran Pernapasan Atas)',
            plan: 'Terapi simptomatik, istirahat cukup, banyak minum air putih. Kontrol 3 hari jika belum membaik.',
            medicalAction: 'Pemeriksaan fisik, auskultasi paru',
            examinedAt: new Date(),
            createdBy: dokterUser1.id,
            updatedBy: dokterUser1.id,
        },
    });

    console.log(`Created ${1} medical record`);

    // 8. Prescriptions & Items
    const prescription1 = await prisma.prescription.create({
        data: {
            medicalRecordId: medRecord1.id,
            notes: 'Obat diminum setelah makan. Kembali kontrol jika dalam 3 hari belum membaik.',
            prescriptionItems: {
                create: [
                    {
                        medicineName: 'Paracetamol 500mg',
                        dosage: '500mg',
                        frequency: '3x sehari',
                        quantity: 9,
                        instructions: 'Diminum setelah makan, jika demam',
                    },
                    {
                        medicineName: 'Ambroxol 30mg',
                        dosage: '30mg',
                        frequency: '3x sehari',
                        quantity: 9,
                        instructions: 'Diminum setelah makan',
                    },
                    {
                        medicineName: 'Cetirizine 10mg',
                        dosage: '10mg',
                        frequency: '1x sehari',
                        quantity: 5,
                        instructions: 'Diminum malam hari sebelum tidur',
                    },
                ],
            },
        },
    });

    console.log(`Created ${1} prescription with ${3} items`);

    console.log(' Seeding selesai!\n');
    console.log(' Akun login yang tersedia:');
    console.log('Admin           : admin@klinik.com');
    console.log('Dokter 1        : dr.sari@klinik.com');
    console.log('Dokter 2        : dr.budi@klinik.com');
    console.log('Dokter 3        : dr.rina@klinik.com');
    console.log('Petugas         : petugas@klinik.com');
    console.log('Password (semua): password123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
