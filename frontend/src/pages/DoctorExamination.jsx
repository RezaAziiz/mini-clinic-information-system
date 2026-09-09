import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus, X, Filter, Calendar, Loader2,
    ClipboardList, User, Stethoscope, Pill, Trash2, CheckCircle2,
} from 'lucide-react';

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const Backdrop = ({ children, onClose }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
    >
        <div onClick={(e) => e.stopPropagation()} className="w-full">
            {children}
        </div>
    </div>
);

const STATUS_STYLES = {
    'Menunggu':    'bg-yellow-50 text-yellow-700',
    'Check In':    'bg-blue-50 text-blue-700',
    'Pemeriksaan': 'bg-purple-50 text-purple-700',
    'Selesai':     'bg-green-50 text-green-700',
};

const PAYMENT_LABELS = {
    'Umum':             'Umum',
    'BPJS':             'BPJS',
    'Asuransi_Lainnya': 'Asuransi Lainnya',
};

const PAYMENT_STYLES = {
    'BPJS':             'bg-green-50 text-green-700',
    'Umum':             'bg-slate-100 text-slate-600',
    'Asuransi_Lainnya': 'bg-purple-50 text-purple-700',
};

const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

const PaymentBadge = ({ type }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${PAYMENT_STYLES[type] || 'bg-slate-100 text-slate-600'}`}>
        {PAYMENT_LABELS[type] || type}
    </span>
);

// Status pills shown in filter bar (excludes 'Menunggu' since doctor only cares about active ones)
const FILTER_STATUSES = ['Check In', 'Pemeriksaan', 'Selesai'];

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

// ─── Prescription item factory ────────────────────────────────────────────────

const emptyItem = () => ({
    medicineName: '',
    dosage:       '',
    frequency:    '',
    quantity:     '',
    instructions: '',
});

// ─── Section label component ──────────────────────────────────────────────────

const SoapSection = ({ accentColor, label, sublabel, children }) => (
    <div className={`border-l-4 ${accentColor} pl-4`}>
        <div className="mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            {sublabel && <span className="ml-2 text-xs font-medium text-slate-400">— {sublabel}</span>}
        </div>
        {children}
    </div>
);

// ─── Field helpers ────────────────────────────────────────────────────────────

const inputCls = (hasError) =>
    `w-full px-3 py-2 text-sm bg-white border rounded-xl outline-none transition-colors ${
        hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
    } text-slate-700 placeholder:text-slate-400`;

const textareaCls = (hasError) =>
    `w-full px-3 py-2 text-sm bg-white border rounded-xl outline-none transition-colors resize-none ${
        hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
    } text-slate-700 placeholder:text-slate-400`;

// ─── Main component ───────────────────────────────────────────────────────────

const DoctorExamination = () => {
    useAuth(); // auth context kept for consistency; role guard is handled by the router

    // ── Doctor profile ────────────────────────────────────────────────────────
    const [myDoctorId, setMyDoctorId]     = useState(null);
    const [myDoctorName, setMyDoctorName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    // ── Registrations ─────────────────────────────────────────────────────────
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading]             = useState(false);

    // ── Filters ───────────────────────────────────────────────────────────────
    // No default date — show all active patients for this doctor regardless of visitDate.
    // Doctor can optionally filter by date to narrow down.
    const [filterDate, setFilterDate]     = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // ── SOAP Modal ────────────────────────────────────────────────────────────
    const [showModal, setShowModal]   = useState(false);
    const [activeReg, setActiveReg]   = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── SOAP form ─────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        subjective:    '',
        bloodPressure: '',
        temperature:   '',
        weight:        '',
        height:        '',
        assessment:    '',
        plan:          '',
        medicalAction: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // ── Prescription ──────────────────────────────────────────────────────────
    const [showPresc, setShowPresc]   = useState(false);
    const [prescNotes, setPrescNotes] = useState('');
    const [prescItems, setPrescItems] = useState([emptyItem()]);

    // ── Fetch doctor profile on mount ─────────────────────────────────────────
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

    // ── Fetch registrations whenever doctorId or filterDate changes ─────────────
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

    // ── Derived: apply status filter on the frontend ──────────────────────────
    const displayed = filterStatus
        ? registrations.filter((r) => r.registStatus === filterStatus)
        : registrations;

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const resetModal = () => {
        setForm({
            subjective:    '',
            bloodPressure: '',
            temperature:   '',
            weight:        '',
            height:        '',
            assessment:    '',
            plan:          '',
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

    // ── Form field updater ────────────────────────────────────────────────────
    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }));
    };

    // ── Prescription item updater ─────────────────────────────────────────────
    const setPrescField = (idx, key, value) => {
        setPrescItems((prev) => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    };

    const addPrescItem = () => setPrescItems((prev) => [...prev, emptyItem()]);

    const removePrescItem = (idx) => {
        if (prescItems.length === 1) return;
        setPrescItems((prev) => prev.filter((_, i) => i !== idx));
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!form.subjective.trim())  errors.subjective  = 'Keluhan pasien wajib diisi';
        if (!form.assessment.trim())  errors.assessment  = 'Diagnosa wajib diisi';
        if (!form.plan.trim())        errors.plan        = 'Rencana terapi wajib diisi';
        return errors;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            // 1. Build medical record payload — omit empty optional fields
            const mrPayload = {
                registrationId: Number(activeReg.id),
                subjective:     form.subjective.trim(),
                assessment:     form.assessment.trim(),
                plan:           form.plan.trim(),
            };
            if (form.bloodPressure.trim()) mrPayload.bloodPressure = form.bloodPressure.trim();
            if (form.temperature !== '')   mrPayload.temperature   = Number(form.temperature);
            if (form.weight !== '')        mrPayload.weight        = Number(form.weight);
            if (form.height !== '')        mrPayload.height        = Number(form.height);
            if (form.medicalAction.trim()) mrPayload.medicalAction = form.medicalAction.trim();

            // 2. POST medical record
            const mrRes = await api.post('/medical-records', mrPayload);
            const medRecord = mrRes.data;

            // 3. Optionally POST prescription
            if (showPresc) {
                const validItems = prescItems.filter((it) => it.medicineName.trim());
                if (validItems.length > 0) {
                    await api.post('/prescriptions', {
                        medicalRecordId: Number(medRecord.id),
                        notes:           prescNotes.trim() || undefined,
                        items:           validItems.map((it) => ({
                            medicineName: it.medicineName.trim(),
                            dosage:       it.dosage.trim(),
                            frequency:    it.frequency.trim(),
                            quantity:     Number(it.quantity),
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

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = {
        total:       registrations.length,
        checkIn:     registrations.filter((r) => r.registStatus === 'Check In').length,
        pemeriksaan: registrations.filter((r) => r.registStatus === 'Pemeriksaan').length,
        selesai:     registrations.filter((r) => r.registStatus === 'Selesai').length,
    };

    // ─── Loading profile state (hooks already declared above) ────────────────
    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin mr-3" />
                <p className="text-sm text-slate-500 font-medium">Memuat profil dokter...</p>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
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
                    { label: 'Total',       value: stats.total,       color: 'text-slate-700',  bg: 'bg-white' },
                    { label: 'Check In',    value: stats.checkIn,     color: 'text-blue-600',   bg: 'bg-blue-50' },
                    { label: 'Pemeriksaan', value: stats.pemeriksaan, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Selesai',     value: stats.selesai,     color: 'text-green-600',  bg: 'bg-green-50' },
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                !filterStatus
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    filterStatus === s
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

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasien</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keluhan Awal</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tgl Kunjungan</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pembayaran</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-medium text-slate-400">Memuat data pasien...</p>
                                    </td>
                                </tr>
                            ) : displayed.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">Tidak ada data pasien</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Coba ubah filter tanggal atau status
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayed.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Patient */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{reg.patient?.name}</p>
                                                    <p className="text-[10px] font-semibold text-primary-600">
                                                        {reg.patient?.medicalRecordNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Initial complaint — truncated */}
                                        <td className="px-5 py-4 max-w-[200px]">
                                            <p className="text-xs text-slate-500 truncate" title={reg.initialComplaint || ''}>
                                                {reg.initialComplaint
                                                    ? reg.initialComplaint.length > 50
                                                        ? reg.initialComplaint.slice(0, 50) + '…'
                                                        : reg.initialComplaint
                                                    : <span className="text-slate-300 italic">—</span>
                                                }
                                            </p>
                                        </td>

                                        {/* Visit date */}
                                        <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                            {formatDate(reg.visitDate)}
                                        </td>

                                        {/* Payment */}
                                        <td className="px-5 py-4">
                                            <PaymentBadge type={reg.paymentType} />
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <StatusBadge status={reg.registStatus} />
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center">
                                                {(reg.registStatus === 'Check In' || reg.registStatus === 'Pemeriksaan') && (
                                                    <button
                                                        onClick={() => openModal(reg)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/25 active:scale-[0.97]"
                                                    >
                                                        <Stethoscope className="w-3.5 h-3.5" />
                                                        Periksa
                                                    </button>
                                                )}
                                                {reg.registStatus === 'Selesai' && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Selesai
                                                    </span>
                                                )}
                                                {/* Menunggu → no action */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== SOAP EXAMINATION MODAL ====== */}
            {showModal && activeReg && (
                <Backdrop onClose={closeModal}>
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">

                        {/* ── Sticky header ── */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Pemeriksaan Pasien
                                    <span className="text-slate-400 font-normal"> — </span>
                                    {activeReg.patient?.name}
                                </h3>
                                <p className="text-xs font-semibold text-primary-600 mt-0.5">
                                    {activeReg.patient?.medicalRecordNumber}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0 mt-0.5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* ── Scrollable body ── */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
                        >
                            {/* Patient info strip */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-wrap gap-x-5 gap-y-2">
                                <div className="flex items-center gap-1.5">
                                    <StatusBadge status={activeReg.registStatus} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Poli</span>
                                    <span className="text-xs font-semibold text-slate-600">{activeReg.polyclinic?.name || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <PaymentBadge type={activeReg.paymentType} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-600">{formatDate(activeReg.visitDate)}</span>
                                </div>
                                {activeReg.initialComplaint && (
                                    <div className="w-full flex items-start gap-1.5 mt-0.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 shrink-0">Keluhan</span>
                                        <span className="text-xs text-slate-500">{activeReg.initialComplaint}</span>
                                    </div>
                                )}
                            </div>

                            {/* ── S — Subjective ── */}
                            <SoapSection accentColor="border-blue-400" label="S" sublabel="Subjective">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Keluhan Pasien <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.subjective}
                                        onChange={(e) => setField('subjective', e.target.value)}
                                        placeholder="Deskripsikan keluhan yang disampaikan pasien..."
                                        className={textareaCls(!!formErrors.subjective)}
                                    />
                                    {formErrors.subjective && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.subjective}</p>
                                    )}
                                </div>
                            </SoapSection>

                            {/* ── O — Objective ── */}
                            <SoapSection accentColor="border-teal-400" label="O" sublabel="Objective">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Tekanan Darah
                                        </label>
                                        <input
                                            type="text"
                                            value={form.bloodPressure}
                                            onChange={(e) => setField('bloodPressure', e.target.value)}
                                            placeholder="misal: 120/80"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Suhu Tubuh
                                        </label>
                                        <input
                                            type="number"
                                            value={form.temperature}
                                            onChange={(e) => setField('temperature', e.target.value)}
                                            placeholder="°C"
                                            step="0.1"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Berat Badan
                                        </label>
                                        <input
                                            type="number"
                                            value={form.weight}
                                            onChange={(e) => setField('weight', e.target.value)}
                                            placeholder="kg"
                                            step="0.1"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Tinggi Badan
                                        </label>
                                        <input
                                            type="number"
                                            value={form.height}
                                            onChange={(e) => setField('height', e.target.value)}
                                            placeholder="cm"
                                            step="0.1"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                </div>
                            </SoapSection>

                            {/* ── A — Assessment ── */}
                            <SoapSection accentColor="border-amber-400" label="A" sublabel="Assessment">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Diagnosa <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={form.assessment}
                                        onChange={(e) => setField('assessment', e.target.value)}
                                        placeholder="Tuliskan diagnosa hasil pemeriksaan..."
                                        className={textareaCls(!!formErrors.assessment)}
                                    />
                                    {formErrors.assessment && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.assessment}</p>
                                    )}
                                </div>
                            </SoapSection>

                            {/* ── P — Plan ── */}
                            <SoapSection accentColor="border-rose-400" label="P" sublabel="Plan">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Rencana Terapi <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={form.plan}
                                            onChange={(e) => setField('plan', e.target.value)}
                                            placeholder="Rencana penanganan dan terapi yang diberikan..."
                                            className={textareaCls(!!formErrors.plan)}
                                        />
                                        {formErrors.plan && (
                                            <p className="text-xs text-red-500 mt-1">{formErrors.plan}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Tindakan Medis
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={form.medicalAction}
                                            onChange={(e) => setField('medicalAction', e.target.value)}
                                            placeholder="Tindakan medis yang dilakukan (opsional)..."
                                            className={textareaCls(false)}
                                        />
                                    </div>
                                </div>
                            </SoapSection>

                            {/* ── Prescription toggle ── */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowPresc((v) => !v)}
                                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                                        showPresc
                                            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                            : 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                                    }`}
                                >
                                    <Pill className="w-3.5 h-3.5" />
                                    {showPresc ? '✕ Batal Resep' : '＋ Tambah Resep'}
                                </button>
                            </div>

                            {/* ── Prescription section ── */}
                            {showPresc && (
                                <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Pill className="w-4 h-4 text-primary-500" />
                                        <span className="text-sm font-bold text-slate-700">Resep Obat</span>
                                    </div>

                                    {/* Prescription notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Catatan Resep
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={prescNotes}
                                            onChange={(e) => setPrescNotes(e.target.value)}
                                            placeholder="Catatan tambahan untuk apoteker (opsional)..."
                                            className={textareaCls(false)}
                                        />
                                    </div>

                                    {/* Prescription items */}
                                    <div className="space-y-2">
                                        {prescItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={item.medicineName}
                                                    onChange={(e) => setPrescField(idx, 'medicineName', e.target.value)}
                                                    placeholder="Nama Obat"
                                                    className={`${inputCls(false)} flex-1`}
                                                />
                                                <input
                                                    type="text"
                                                    value={item.dosage}
                                                    onChange={(e) => setPrescField(idx, 'dosage', e.target.value)}
                                                    placeholder="Dosis"
                                                    className={`${inputCls(false)} w-24`}
                                                />
                                                <input
                                                    type="text"
                                                    value={item.frequency}
                                                    onChange={(e) => setPrescField(idx, 'frequency', e.target.value)}
                                                    placeholder="Frekuensi"
                                                    className={`${inputCls(false)} w-28`}
                                                />
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => setPrescField(idx, 'quantity', e.target.value)}
                                                    placeholder="Jml"
                                                    min="1"
                                                    className={`${inputCls(false)} w-20`}
                                                />
                                                <input
                                                    type="text"
                                                    value={item.instructions}
                                                    onChange={(e) => setPrescField(idx, 'instructions', e.target.value)}
                                                    placeholder="Instruksi"
                                                    className={`${inputCls(false)} flex-1`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePrescItem(idx)}
                                                    disabled={prescItems.length === 1}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                                    title="Hapus obat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add medicine row */}
                                    <button
                                        type="button"
                                        onClick={addPrescItem}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 border border-primary-200 bg-white hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Tambah Obat
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* ── Sticky footer ── */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form=""
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Simpan Pemeriksaan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Backdrop>
            )}
        </div>
    );
};

export default DoctorExamination;
