--
-- PostgreSQL database dump
--

\restrict NdWGQJG6uoyEI1czJ82q64mttrfwqfv0zlASebJW9eEJCUnvlup3wWiKRZCv6Hk

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_type AS ENUM (
    'L',
    'P'
);


ALTER TYPE public.gender_type OWNER TO postgres;

--
-- Name: payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_type AS ENUM (
    'Umum',
    'BPJS',
    'Asuransi Lainnya'
);


ALTER TYPE public.payment_type OWNER TO postgres;

--
-- Name: queue_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.queue_status AS ENUM (
    'Menunggu',
    'Dipanggil',
    'Selesai'
);


ALTER TYPE public.queue_status OWNER TO postgres;

--
-- Name: regist_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.regist_status AS ENUM (
    'Menunggu',
    'Check In',
    'Pemeriksaan',
    'Selesai'
);


ALTER TYPE public.regist_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'Administrator',
    'Dokter',
    'Petugas Pendaftaran'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    doctor_code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20),
    specialization character varying(100),
    poly_id bigint,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    subjective text,
    blood_pressure character varying(20),
    temperature numeric(5,2),
    weight numeric(5,2),
    height numeric(5,2),
    assessment text,
    plan text,
    medical_action text,
    examined_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by bigint,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by bigint
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- Name: medical_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_records_id_seq OWNER TO postgres;

--
-- Name: medical_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_records_id_seq OWNED BY public.medical_records.id;


--
-- Name: patient_queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_queues (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    queue_number character varying(20) NOT NULL,
    queue_status public.queue_status DEFAULT 'Menunggu'::public.queue_status NOT NULL,
    called_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.patient_queues OWNER TO postgres;

--
-- Name: patient_queues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_queues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_queues_id_seq OWNER TO postgres;

--
-- Name: patient_queues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_queues_id_seq OWNED BY public.patient_queues.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id bigint NOT NULL,
    medical_record_number character varying(20) NOT NULL,
    nik character varying(16) NOT NULL,
    name character varying(100) NOT NULL,
    gender public.gender_type NOT NULL,
    date_of_birth date NOT NULL,
    phone character varying(20),
    address text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: polyclinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.polyclinics (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.polyclinics OWNER TO postgres;

--
-- Name: polyclinics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.polyclinics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.polyclinics_id_seq OWNER TO postgres;

--
-- Name: polyclinics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.polyclinics_id_seq OWNED BY public.polyclinics.id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    id bigint NOT NULL,
    prescription_id bigint NOT NULL,
    medicine_name character varying(100) NOT NULL,
    dosage character varying(50),
    frequency character varying(50),
    quantity integer,
    instructions text
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_items_id_seq OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_items_id_seq OWNED BY public.prescription_items.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id bigint NOT NULL,
    medical_record_id bigint NOT NULL,
    prescription_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id bigint NOT NULL,
    patient_id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    poly_id bigint NOT NULL,
    visit_date date NOT NULL,
    payment_type public.payment_type NOT NULL,
    initial_complaint text,
    regist_status public.regist_status DEFAULT 'Menunggu'::public.regist_status NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registrations_id_seq OWNER TO postgres;

--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: medical_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN id SET DEFAULT nextval('public.medical_records_id_seq'::regclass);


--
-- Name: patient_queues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_queues ALTER COLUMN id SET DEFAULT nextval('public.patient_queues_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: polyclinics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polyclinics ALTER COLUMN id SET DEFAULT nextval('public.polyclinics_id_seq'::regclass);


--
-- Name: prescription_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN id SET DEFAULT nextval('public.prescription_items_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, user_id, doctor_code, name, phone, specialization, poly_id, created_at, updated_at) FROM stdin;
1	2	DKT-001	dr. Sari Dewi, Sp.PD	081234567890	Penyakit Dalam	1	2026-09-10 00:36:02.773	2026-09-10 00:36:02.773
2	3	DKT-002	drg. Budi Santoso	081234567891	Dokter Gigi	2	2026-09-10 00:36:02.788	2026-09-10 00:36:02.788
3	4	DKT-003	dr. Rina Kartika, Sp.A	081234567892	Dokter Anak	3	2026-09-10 00:36:02.793	2026-09-10 00:36:02.793
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (id, registration_id, subjective, blood_pressure, temperature, weight, height, assessment, plan, medical_action, examined_at, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	Pasien mengeluh demam sejak 3 hari lalu, disertai batuk berdahak dan pilek. Sudah minum paracetamol tapi belum membaik.	120/80	38.50	65.00	170.00	ISPA (Infeksi Saluran Pernapasan Atas)	Terapi simptomatik, istirahat cukup, banyak minum air putih. Kontrol 3 hari jika belum membaik.	Pemeriksaan fisik, auskultasi paru	2026-09-10 00:36:03.03	2026-09-10 00:36:03.038	2	2026-09-10 00:36:03.038	2
\.


--
-- Data for Name: patient_queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_queues (id, registration_id, queue_number, queue_status, called_at, created_at, updated_at) FROM stdin;
1	1	A-001	Selesai	2026-09-10 00:36:03.003	2026-09-10 00:36:03.005	2026-09-10 00:36:03.005
3	3	A-002	Menunggu	\N	2026-09-10 00:36:03.008	2026-09-10 00:36:03.008
2	2	B-001	Dipanggil	2026-09-10 00:36:03.003	2026-09-10 00:36:03.007	2026-09-10 00:36:03.007
4	5	C-001	Menunggu	\N	2026-09-10 00:36:03.009	2026-09-10 00:36:03.009
5	4	A-003	Menunggu	\N	2026-09-10 00:36:03.008	2026-09-10 00:36:03.008
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, medical_record_number, nik, name, gender, date_of_birth, phone, address, created_at, updated_at) FROM stdin;
1	RM-000001	3201012345670001	Ahmad Fauzi	L	1990-05-15	082111223344	Jl. Merdeka No. 10, Bandung	2026-09-10 00:36:02.799	2026-09-10 00:36:02.799
2	RM-000002	3201012345670002	Siti Nurhaliza	P	1985-08-22	082111223355	Jl. Sudirman No. 25, Bandung	2026-09-10 00:36:02.801	2026-09-10 00:36:02.801
3	RM-000003	3201012345670003	Rudi Hermawan	L	1978-12-03	082111223366	Jl. Asia Afrika No. 5, Bandung	2026-09-10 00:36:02.801	2026-09-10 00:36:02.801
4	RM-000004	3201012345670004	Dewi Lestari	P	1995-03-10	082111223377	Jl. Braga No. 42, Bandung	2026-09-10 00:36:02.801	2026-09-10 00:36:02.801
5	RM-000005	3201012345670005	Rizky Pratama	L	2018-07-20	082111223388	Jl. Dago No. 88, Bandung	2026-09-10 00:36:02.801	2026-09-10 00:36:02.801
\.


--
-- Data for Name: polyclinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.polyclinics (id, name, description, created_at, updated_at) FROM stdin;
1	Poli Umum	Pelayanan kesehatan umum untuk semua keluhan	2026-09-10 00:36:02.745	2026-09-10 00:36:02.745
2	Poli Gigi	Pelayanan kesehatan gigi dan mulut	2026-09-10 00:36:02.755	2026-09-10 00:36:02.755
3	Poli Anak	Pelayanan kesehatan anak dan tumbuh kembang	2026-09-10 00:36:02.759	2026-09-10 00:36:02.759
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, quantity, instructions) FROM stdin;
1	1	Paracetamol 500mg	500mg	3x sehari	9	Diminum setelah makan, jika demam
2	1	Ambroxol 30mg	30mg	3x sehari	9	Diminum setelah makan
3	1	Cetirizine 10mg	10mg	1x sehari	5	Diminum malam hari sebelum tidur
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, medical_record_id, prescription_date, notes, created_at, updated_at) FROM stdin;
1	1	2026-09-10 00:36:03.126	Obat diminum setelah makan. Kembali kontrol jika dalam 3 hari belum membaik.	2026-09-10 00:36:03.126	2026-09-10 00:36:03.126
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, patient_id, doctor_id, poly_id, visit_date, payment_type, initial_complaint, regist_status, created_at, updated_at) FROM stdin;
1	1	1	1	2026-09-09	BPJS	Demam dan batuk sudah 3 hari	Selesai	2026-09-10 00:36:02.952	2026-09-10 00:36:02.952
2	2	2	2	2026-09-09	Umum	Sakit gigi geraham kanan bawah	Pemeriksaan	2026-09-10 00:36:02.98	2026-09-10 00:36:02.98
3	3	1	1	2026-09-09	BPJS	Kontrol tekanan darah tinggi	Check In	2026-09-10 00:36:02.987	2026-09-10 00:36:02.987
4	4	1	1	2026-09-09	Umum	Mual dan pusing sejak kemarin	Menunggu	2026-09-10 00:36:02.992	2026-09-10 00:36:02.992
5	5	3	3	2026-09-09	BPJS	Demam tinggi dan ruam kulit	Menunggu	2026-09-10 00:36:02.999	2026-09-10 00:36:02.999
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
1	admin@klinik.com	$2b$10$1X2ZdXTCF4B6VM7ZQalb9em/jV88CCW1qBy9QwVvwLKCGmJwlUkXK	Administrator	2026-09-10 00:36:02.578	2026-09-10 00:36:02.578
2	dr.sari@klinik.com	$2b$10$1X2ZdXTCF4B6VM7ZQalb9em/jV88CCW1qBy9QwVvwLKCGmJwlUkXK	Dokter	2026-09-10 00:36:02.721	2026-09-10 00:36:02.721
3	dr.budi@klinik.com	$2b$10$1X2ZdXTCF4B6VM7ZQalb9em/jV88CCW1qBy9QwVvwLKCGmJwlUkXK	Dokter	2026-09-10 00:36:02.727	2026-09-10 00:36:02.727
4	dr.rina@klinik.com	$2b$10$1X2ZdXTCF4B6VM7ZQalb9em/jV88CCW1qBy9QwVvwLKCGmJwlUkXK	Dokter	2026-09-10 00:36:02.732	2026-09-10 00:36:02.732
5	petugas@klinik.com	$2b$10$1X2ZdXTCF4B6VM7ZQalb9em/jV88CCW1qBy9QwVvwLKCGmJwlUkXK	Petugas Pendaftaran	2026-09-10 00:36:02.738	2026-09-10 00:36:02.738
\.


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 3, true);


--
-- Name: medical_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_records_id_seq', 1, true);


--
-- Name: patient_queues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_queues_id_seq', 5, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 5, true);


--
-- Name: polyclinics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.polyclinics_id_seq', 3, true);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_items_id_seq', 3, true);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 1, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registrations_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: patient_queues patient_queues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_queues
    ADD CONSTRAINT patient_queues_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: polyclinics polyclinics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polyclinics
    ADD CONSTRAINT polyclinics_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: doctors_doctor_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_doctor_code_key ON public.doctors USING btree (doctor_code);


--
-- Name: doctors_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_user_id_key ON public.doctors USING btree (user_id);


--
-- Name: medical_records_registration_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX medical_records_registration_id_key ON public.medical_records USING btree (registration_id);


--
-- Name: patient_queues_registration_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patient_queues_registration_id_key ON public.patient_queues USING btree (registration_id);


--
-- Name: patients_medical_record_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_medical_record_number_key ON public.patients USING btree (medical_record_number);


--
-- Name: patients_nik_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_nik_key ON public.patients USING btree (nik);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: doctors doctors_poly_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_poly_id_fkey FOREIGN KEY (poly_id) REFERENCES public.polyclinics(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: medical_records medical_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: medical_records medical_records_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: medical_records medical_records_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: patient_queues patient_queues_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_queues
    ADD CONSTRAINT patient_queues_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescription_items prescription_items_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: registrations registrations_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_poly_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_poly_id_fkey FOREIGN KEY (poly_id) REFERENCES public.polyclinics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict NdWGQJG6uoyEI1czJ82q64mttrfwqfv0zlASebJW9eEJCUnvlup3wWiKRZCv6Hk

