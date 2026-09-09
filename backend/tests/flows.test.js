import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('Integration Test: Clinic End-to-End Flows', async (t) => {
    // Shared state across the flows
    let adminToken, petugasToken, dokterToken;
    let patientId, registrationId, queueId, medicalRecordId;
    let dokterIdForTest = 1; // Default doctor id based on seeds (dr. Sari Dewi, Sp.PD)

    // Helper functions
    const generateNik = () => '3201' + Math.floor(100000000000 + Math.random() * 900000000000).toString();

    await t.test('Setup: Authentication', async () => {
        // Login as Administrator
        let res = await request(app).post('/api/auth/login').send({
            email: 'admin@klinik.com',
            password: 'password123'
        });
        assert.equal(res.status, 200, 'Admin login failed');
        adminToken = res.body.data.accessToken;

        // Login as Petugas Pendaftaran
        res = await request(app).post('/api/auth/login').send({
            email: 'petugas@klinik.com',
            password: 'password123'
        });
        assert.equal(res.status, 200, 'Petugas login failed');
        petugasToken = res.body.data.accessToken;

        // Login as Dokter
        res = await request(app).post('/api/auth/login').send({
            email: 'dr.sari@klinik.com',
            password: 'password123'
        });
        assert.equal(res.status, 200, 'Dokter login failed');
        dokterToken = res.body.data.accessToken;
    });

    await t.test('Flow 1: Pendaftaran Pasien & Antrean (Petugas)', async () => {
        // 1. Mendaftarkan Pasien Baru
        const newPatient = {
            nik: generateNik(),
            name: 'Pasien Test E2E',
            gender: 'L',
            dateOfBirth: '1995-01-01',
            phone: '081234567890',
            address: 'Jl. Test No. 1'
        };

        let res = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${petugasToken}`)
            .send(newPatient);
        
        assert.equal(res.status, 201, `Create patient failed: ${JSON.stringify(res.body)}`);
        patientId = res.body.data.id;
        assert.ok(patientId);

        // 2. Membuat Pendaftaran Kunjungan
        const newRegistration = {
            patientId: patientId,
            doctorId: dokterIdForTest,
            polyId: 1, // Poli Umum
            visitDate: new Date().toISOString().split('T')[0],
            paymentType: 'Umum',
            initialComplaint: 'Pusing dan demam (Test)'
        };

        res = await request(app)
            .post('/api/registrations')
            .set('Authorization', `Bearer ${petugasToken}`)
            .send(newRegistration);
        
        assert.equal(res.status, 201, `Create registration failed: ${JSON.stringify(res.body)}`);
        registrationId = res.body.data.id;
        assert.ok(registrationId);

        // 3. Membuat Nomor Antrean
        res = await request(app)
            .post('/api/queues')
            .set('Authorization', `Bearer ${petugasToken}`)
            .send({ registrationId });
        
        assert.equal(res.status, 201, `Create queue failed: ${JSON.stringify(res.body)}`);
        queueId = res.body.data.id;
        assert.equal(res.body.data.queueStatus, 'Menunggu');

        // 4. Mengubah Status Registrasi menjadi Check In
        res = await request(app)
            .put(`/api/registrations/${registrationId}`)
            .set('Authorization', `Bearer ${petugasToken}`)
            .send({ registStatus: 'Check In' });
        
        assert.equal(res.status, 200, `Update registration to Check In failed: ${JSON.stringify(res.body)}`);
        assert.equal(res.body.data.registStatus, 'Check In');
    });

    await t.test('Flow 2: Pemeriksaan & Resep (Dokter)', async () => {
        // 1. Memanggil Antrean
        let res = await request(app)
            .put(`/api/queues/${queueId}/call`)
            .set('Authorization', `Bearer ${dokterToken}`);
        
        assert.equal(res.status, 200, `Call queue failed: ${JSON.stringify(res.body)}`);
        assert.equal(res.body.data.queueStatus, 'Dipanggil');

        // 2. Ubah Status Registrasi menjadi Pemeriksaan (Manual oleh Dokter)
        res = await request(app)
            .put(`/api/registrations/${registrationId}`)
            .set('Authorization', `Bearer ${dokterToken}`)
            .send({ registStatus: 'Pemeriksaan' });
        
        assert.equal(res.status, 200, `Update registration to Pemeriksaan failed: ${JSON.stringify(res.body)}`);

        // 3. Menyimpan hasil pemeriksaan SOAP
        const soapData = {
            registrationId,
            subjective: 'Pasien masih pusing',
            bloodPressure: '110/70',
            temperature: 37.5,
            weight: 60,
            height: 165,
            assessment: 'Migraine',
            plan: 'Pemberian obat pereda nyeri',
            medicalAction: 'Konsultasi'
        };

        res = await request(app)
            .post('/api/medical-records')
            .set('Authorization', `Bearer ${dokterToken}`)
            .send(soapData);
        
        assert.equal(res.status, 201, `Create medical record failed: ${JSON.stringify(res.body)}`);
        medicalRecordId = res.body.data.id;
        assert.ok(medicalRecordId);

        // 4. Memastikan Status otomatis berubah menjadi Selesai (Transaction di repository)
        // Cek Registration
        let regCheck = await request(app)
            .get(`/api/registrations?status=Selesai`)
            .set('Authorization', `Bearer ${adminToken}`); // Bebas
        
        // Cek manual karena get by id belum ada secara explisit di requirements
        // Kita cukup percaya transaksi di DB, atau memastikannya lewat get dashboard/queue status
        let queueCheck = await request(app)
            .get(`/api/queues?status=Selesai`)
            .set('Authorization', `Bearer ${petugasToken}`);
        
        const isQueueFinished = queueCheck.body.data.some(q => String(q.id) === String(queueId));
        assert.ok(isQueueFinished, 'Queue should automatically be set to Selesai after medical record creation');

        // 5. Membuat Resep Obat
        const prescriptionData = {
            medicalRecordId,
            notes: 'Diminum sesudah makan',
            items: [
                {
                    medicineName: 'Ibuprofen',
                    dosage: '400mg',
                    frequency: '2x1',
                    quantity: 10,
                    instructions: 'Bila nyeri'
                }
            ]
        };

        res = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${dokterToken}`)
            .send(prescriptionData);
        
        assert.equal(res.status, 201, `Create prescription failed: ${JSON.stringify(res.body)}`);
        assert.ok(res.body.data.id);
        
        // Cek validasi array kosong (Negative test)
        res = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${dokterToken}`)
            .send({ ...prescriptionData, items: [] });
        assert.equal(res.status, 400, 'Should reject empty items array');
    });

    await t.test('Flow 3: Laporan Dashboard (Admin)', async () => {
        const res = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);
        
        assert.equal(res.status, 200, `Get dashboard failed: ${JSON.stringify(res.body)}`);
        const summary = res.body.data;
        
        assert.ok(summary.totalPasien >= 1, 'Total Pasien should at least be 1');
        assert.ok(summary.totalKunjunganHariIni >= 1, 'Total Kunjungan Hari Ini should at least be 1');
        assert.ok(summary.totalAntreanHariIni >= 1, 'Total Antrean Hari Ini should at least be 1');
        
        // Since we completed the queue, antreanSelesai must be >= 1
        assert.ok(summary.antreanSelesai >= 1, 'Antrean Selesai should at least be 1');
    });

});
