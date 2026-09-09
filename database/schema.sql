CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL
        CHECK (role IN (
            'Administrator',
            'Dokter',
            'Petugas Pendaftaran'
        )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    medical_record_number VARCHAR(20) NOT NULL UNIQUE,
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE polyclinics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE
        REFERENCES users(id),
    doctor_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL
        REFERENCES patients(id),
    doctor_id BIGINT NOT NULL
        REFERENCES doctors(id),
    poly_id BIGINT NOT NULL
        REFERENCES polyclinics(id),
    visit_date DATE NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    initial_complaint TEXT,
    regist_status VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
        CHECK (regist_status IN (
            'Menunggu',
            'Check In',
            'Pemeriksaan',
            'Selesai'
        )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_queues (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL UNIQUE
        REFERENCES registrations(id) ON DELETE CASCADE,
    queue_number VARCHAR(20) NOT NULL,
    queue_status VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
        CHECK (queue_status IN (
            'Menunggu',
            'Dipanggil',
            'Selesai'
        )),
    called_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL UNIQUE
        REFERENCES registrations(id) ON DELETE CASCADE,
    subjective TEXT,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(5,2),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    assessment TEXT,
    plan TEXT,
    medical_action TEXT,
    examined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES users(id)
);

CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT NOT NULL
        REFERENCES medical_records(id) ON DELETE CASCADE,
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL
        REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    quantity INT,
    instructions TEXT
);

