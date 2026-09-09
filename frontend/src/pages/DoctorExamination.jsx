import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import Backdrop from '../components/common/Backdrop';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Filter, Calendar, Loader2, Stethoscope } from 'lucide-react';
import DoctorExaminationTable from '../components/doctor-examination/DoctorExaminationTable';
import ExaminationModal from '../components/doctor-examination/ExaminationModal';

// Status pills shown in filter bar (excludes 'Menunggu' since doctor only cares about active ones)
const FILTER_STATUSES = ['Check In', 'Pemeriksaan', 'Selesai'];

// Prescription item factory 
const emptyItem = () => ({
    medicineName: '',
    dosage: '',
    frequency: '',
    quantity: '',
    instructions: '',
});

// Main component 

const DoctorExamination = () => {
    useAuth(); // auth context kept for consistency; role guard is handled by the router

    // Doctor profile 
    const [myDoctorId, setMyDoctorId] = useState(null);
    const [myDoctorName, setMyDoctorName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Registrations 
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters 
    // No default date — show all active patients for this doctor regardless of visitDate.
    // Doctor can optionally filter by date to narrow down.
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // ── SOAP Modal ────────────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [activeReg, setActiveReg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── SOAP form ─────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        subjective: '',
        bloodPressure: '',
        temperature: '',
        weight: '',
        height: '',
        assessment: '',
        plan: '',
        medicalAction: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // Prescription 
    const [showPresc, setShowPresc] = useState(false);
    const [prescNotes, setPrescNotes] = useState('');
    const [prescItems, setPrescItems] = useState([emptyItem()]);

    // Fetch doctor profile on mount 
    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const res = await api.get('/doctors/me');
                if (res.success) {
                    setMyDoctorId(res.data.id);
                    setMyDoctorName(res.data.name);
                }
            } catch {
                toast.error('Gagal memuat profil dokter');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    // Fetch registrations whenever doctorId or filterDate changes 
    // Note: we do NOT pass startDate by default so we see ALL active patients
    // (seeder registrations may have a visitDate from a past run).
    // If the doctor sets an explicit date filter we apply it.
    const fetchRegistrations = useCallback(async () => {
        if (!myDoctorId) return;
        setLoading(true);
        try {
            const params = { doctorId: myDoctorId };
            if (filterDate) params.startDate = filterDate;
            const res = await api.get('/registrations', { params });
            if (res.success) setRegistrations(res.data);
        } catch {
            toast.error('Gagal memuat data registrasi');
        } finally {
            setLoading(false);
        }
    }, [myDoctorId, filterDate]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    //  Derived, apply status filter on the frontend 
    const displayed = filterStatus
        ? registrations.filter((r) => r.registStatus === filterStatus)
        : registrations;

    // Modal helpers 
    const resetModal = () => {
        setForm({
            subjective: '',
            bloodPressure: '',
            temperature: '',
            weight: '',
            height: '',
            assessment: '',
            plan: '',
            medicalAction: '',
        });
        setFormErrors({});
        setShowPresc(false);
        setPrescNotes('');
        setPrescItems([emptyItem()]);
        setActiveReg(null);
    };

    const openModal = (reg) => {
        setActiveReg(reg);
        setForm((prev) => ({
            ...prev,
            subjective: reg.initialComplaint || '',
        }));
        setFormErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetModal();
    };

    // Form field updater 
    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }));
    };

    // Prescription item updater 
    const setPrescField = (idx, key, value) => {
        setPrescItems((prev) => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    };

    const addPrescItem = () => setPrescItems((prev) => [...prev, emptyItem()]);

    const removePrescItem = (idx) => {
        if (prescItems.length === 1) return;
        setPrescItems((prev) => prev.filter((_, i) => i !== idx));
    };

    //  Validation 
    const validate = () => {
        const errors = {};
        if (!form.subjective.trim()) errors.subjective = 'Keluhan pasien wajib diisi';
        if (!form.assessment.trim()) errors.assessment = 'Diagnosa wajib diisi';
        if (!form.plan.trim()) errors.plan = 'Rencana terapi wajib diisi';
        return errors;
    };

    //Submit 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            //  Build medical record payload — omit empty optional fields
            const mrPayload = {
                registrationId: Number(activeReg.id),
                subjective: form.subjective.trim(),
                assessment: form.assessment.trim(),
                plan: form.plan.trim(),
            };
            if (form.bloodPressure.trim()) mrPayload.bloodPressure = form.bloodPressure.trim();
            if (form.temperature !== '') mrPayload.temperature = Number(form.temperature);
            if (form.weight !== '') mrPayload.weight = Number(form.weight);
            if (form.height !== '') mrPayload.height = Number(form.height);
            if (form.medicalAction.trim()) mrPayload.medicalAction = form.medicalAction.trim();

            //  POST medical record
            const mrRes = await api.post('/medical-records', mrPayload);
            const medRecord = mrRes.data;

            //  Optionally POST prescription
            if (showPresc) {
                const validItems = prescItems.filter((it) => it.medicineName.trim());
                if (validItems.length > 0) {
                    await api.post('/prescriptions', {
                        medicalRecordId: Number(medRecord.id),
                        notes: prescNotes.trim() || undefined,
                        items: validItems.map((it) => ({
                            medicineName: it.medicineName.trim(),
                            dosage: it.dosage.trim(),
                            frequency: it.frequency.trim(),
                            quantity: Number(it.quantity),
                            ...(it.instructions.trim() ? { instructions: it.instructions.trim() } : {}),
                        })),
                    });
                }
            }

            toast.success('Pemeriksaan berhasil disimpan');
            closeModal();
            fetchRegistrations();
        } catch (error) {
            const msg = error?.message || 'Gagal menyimpan pemeriksaan';
            toast.error(msg);
            // Map field-level errors if any
            if (error?.errors) {
                const mapped = {};
                error.errors.forEach((e) => { if (e.field) mapped[e.field] = e.message; });
                if (Object.keys(mapped).length) setFormErrors(mapped);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Stats 
    const stats = {
        total: registrations.length,
        checkIn: registrations.filter((r) => r.registStatus === 'Check In').length,
        pemeriksaan: registrations.filter((r) => r.registStatus === 'Pemeriksaan').length,
        selesai: registrations.filter((r) => r.registStatus === 'Selesai').length,
    };

    // Loading profile state 
    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin mr-3" />
                <p className="text-sm text-slate-500 font-medium">Memuat profil dokter...</p>
            </div>
        );
    }

    // Render 
    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Pemeriksaan Pasien
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {myDoctorName && (
                            <>
                                <span className="font-semibold text-slate-700">{myDoctorName}</span>
                                {' • '}
                            </>
                        )}
                        <span className="text-primary-600 font-bold">{stats.total}</span> pasien terdaftar hari ini
                    </p>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
                    { label: 'Check In', value: stats.checkIn, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pemeriksaan', value: stats.pemeriksaan, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Selesai', value: stats.selesai, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4`}>
                        <div>
                            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Filter className="w-3.5 h-3.5" />
                        Filter
                    </div>

                    {/* Date filter */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status pills */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!filterStatus
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            Semua
                        </button>
                        {FILTER_STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Doctor context badge */}
                    {myDoctorName && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-xl">
                            <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
                            <span className="text-xs font-semibold text-primary-700">{myDoctorName}</span>
                        </div>
                    )}
                </div>
            </div>

            <DoctorExaminationTable
                displayed={displayed}
                loading={loading}
                onOpenModal={openModal}
            />

            <ExaminationModal
                show={showModal}
                activeReg={activeReg}
                onClose={closeModal}
                onSubmit={handleSubmit}
                form={form}
                setField={setField}
                formErrors={formErrors}
                showPresc={showPresc}
                setShowPresc={setShowPresc}
                prescNotes={prescNotes}
                setPrescNotes={setPrescNotes}
                prescItems={prescItems}
                setPrescField={setPrescField}
                addPrescItem={addPrescItem}
                removePrescItem={removePrescItem}
                submitting={submitting}
            />
        </div>
    );
};

export default DoctorExamination;
