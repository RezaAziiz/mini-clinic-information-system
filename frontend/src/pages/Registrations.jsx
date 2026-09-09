import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Plus, Eye, Pencil, X, Filter,
    ClipboardList, User, Stethoscope, Building2, Calendar,
    CreditCard, FileText, Loader2, CheckCircle2
} from 'lucide-react';

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

const STATUSES = ['Menunggu', 'Check In', 'Pemeriksaan', 'Selesai'];
const PAYMENT_TYPES = [
    { value: 'Umum',             label: 'Umum' },
    { value: 'BPJS',             label: 'BPJS' },
    { value: 'Asuransi_Lainnya', label: 'Asuransi Lainnya' },
];

const todayISO = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const Registrations = () => {
    const { user } = useAuth();

    // ── Data ──────────────────────────────────────────────────────────────
    const [registrations, setRegistrations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [polyclinics, setPolyclinics] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Filters ───────────────────────────────────────────────────────────
    const [filterDate, setFilterDate] = useState(todayISO());
    const [filterStatus, setFilterStatus] = useState('');

    // ── Modal state ───────────────────────────────────────────────────────
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingReg, setEditingReg] = useState(null);
    const [detailReg, setDetailReg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Form ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        patientId:        '',
        patientName:      '',
        doctorId:         '',
        polyId:           '',
        visitDate:        todayISO(),
        paymentType:      'Umum',
        initialComplaint: '',
        registStatus:     '',
    });
    const [formErrors, setFormErrors] = useState({});

    // ── Patient search ────────────────────────────────────────────────────
    const [patientSearch, setPatientSearch] = useState('');
    const [patientResults, setPatientResults] = useState([]);
    const [searchingPatient, setSearchingPatient] = useState(false);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const patientSearchRef = useRef(null);

    // ── Fetch helpers ─────────────────────────────────────────────────────
    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterDate) params.startDate = filterDate;
            if (filterStatus) params.status = filterStatus;

            const res = await api.get('/registrations', { params });
            if (res.success) setRegistrations(res.data);
        } catch {
            toast.error('Gagal memuat data registrasi');
        } finally {
            setLoading(false);
        }
    }, [filterDate, filterStatus]);

    const fetchSupportData = useCallback(async () => {
        try {
            const [drRes, polyRes] = await Promise.all([
                api.get('/doctors'),
                api.get('/polyclinics'),
            ]);
            if (drRes.success)   setDoctors(drRes.data);
            if (polyRes.success) setPolyclinics(polyRes.data);
        } catch {
            // non-critical
        }
    }, []);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);
    useEffect(() => { fetchSupportData(); },    [fetchSupportData]);

    // ── Patient search debounce ───────────────────────────────────────────
    useEffect(() => {
        if (!patientSearch || patientSearch.length < 2) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingPatient(true);
            try {
                const res = await api.get('/patients', {
                    params: { search: patientSearch, limit: 6 },
                });
                if (res.success) {
                    setPatientResults(res.data.data || []);
                    setShowPatientDropdown(true);
                }
            } catch {
                // silent
            } finally {
                setSearchingPatient(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    // Close patient dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (patientSearchRef.current && !patientSearchRef.current.contains(e.target)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Form helpers ──────────────────────────────────────────────────────
    const resetForm = () => {
        setForm({
            patientId: '', patientName: '', doctorId: '', polyId: '',
            visitDate: todayISO(), paymentType: 'Umum',
            initialComplaint: '', registStatus: '',
        });
        setPatientSearch('');
        setPatientResults([]);
        setFormErrors({});
        setEditingReg(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEditModal = (reg) => {
        setEditingReg(reg);
        setForm({
            patientId:        String(reg.patient?.id || reg.patientId || ''),
            patientName:      reg.patient?.name || '',
            doctorId:         String(reg.doctor?.id || reg.doctorId || ''),
            polyId:           String(reg.polyclinic?.id || reg.polyId || ''),
            visitDate:        reg.visitDate ? reg.visitDate.split('T')[0] : todayISO(),
            paymentType:      reg.paymentType || 'Umum',
            initialComplaint: reg.initialComplaint || '',
            registStatus:     reg.registStatus || '',
        });
        setPatientSearch(reg.patient?.name || '');
        setFormErrors({});
        setShowFormModal(true);
    };

    const openDetailModal = async (reg) => {
        try {
            const res = await api.get(`/registrations/${reg.id}`);
            if (res.success) {
                setDetailReg(res.data);
                setShowDetailModal(true);
            }
        } catch {
            toast.error('Gagal memuat detail registrasi');
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.patientId) errors.patientId = 'Pasien wajib dipilih dari hasil pencarian';
        if (!form.doctorId)  errors.doctorId  = 'Dokter wajib dipilih';
        if (!form.polyId)    errors.polyId    = 'Poliklinik wajib dipilih';
        if (!form.visitDate) errors.visitDate = 'Tanggal kunjungan wajib diisi';
        if (!form.paymentType) errors.paymentType = 'Jenis pembayaran wajib dipilih';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);

        const payload = {
            patientId:        Number(form.patientId),
            doctorId:         Number(form.doctorId),
            polyId:           Number(form.polyId),
            visitDate:        form.visitDate,
            paymentType:      form.paymentType,
            initialComplaint: form.initialComplaint || undefined,
        };

        // Only send registStatus if it actually changed (prevents invalid-transition error)
        if (editingReg && form.registStatus && form.registStatus !== editingReg.registStatus) {
            payload.registStatus = form.registStatus;
        }

        try {
            if (editingReg) {
                await api.put(`/registrations/${editingReg.id}`, payload);
                toast.success('Data registrasi berhasil diperbarui');
            } else {
                await api.post('/registrations', payload);
                toast.success('Registrasi kunjungan berhasil dibuat');
            }
            setShowFormModal(false);
            resetForm();
            fetchRegistrations();
        } catch (error) {
            const fieldErrors = error?.errors;
            if (fieldErrors) {
                setFormErrors(fieldErrors);
            } else {
                toast.error(error?.message || 'Terjadi kesalahan');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Quick check-in from table row
    const handleCheckIn = async (reg) => {
        try {
            await api.put(`/registrations/${reg.id}`, { registStatus: 'Check In' });
            toast.success(`${reg.patient?.name} berhasil Check In`);
            fetchRegistrations();
        } catch (error) {
            toast.error(error?.message || 'Gagal melakukan check in');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    // Role guard — only Petugas Pendaftaran (hooks must all be called before this)
    if (user && user.role !== 'Petugas Pendaftaran') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Registrasi Kunjungan
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Pendaftaran kunjungan pasien •{' '}
                        <span className="text-primary-600 font-bold">{registrations.length}</span> data ditemukan
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Daftar Pasien Baru
                </button>
            </div>

            {/* Filter Bar */}
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

                    {/* Status filter pills */}
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
                        {STATUSES.map((s) => (
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
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasien</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dokter / Poli</th>
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
                                        <p className="text-xs font-medium text-slate-400">Memuat data registrasi...</p>
                                    </td>
                                </tr>
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">Tidak ada data registrasi</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Coba ubah filter tanggal / status, atau daftarkan pasien baru
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-slate-700">{reg.patient?.name}</p>
                                            <p className="text-[10px] font-semibold text-primary-600">
                                                {reg.patient?.medicalRecordNumber}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-700">{reg.doctor?.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400">{reg.polyclinic?.name}</p>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                            {formatDate(reg.visitDate)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <PaymentBadge type={reg.paymentType} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={reg.registStatus} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openDetailModal(reg)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(reg)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {reg.registStatus === 'Menunggu' && (
                                                    <button
                                                        onClick={() => handleCheckIn(reg)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                                                        title="Check In Pasien"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Check In
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== FORM MODAL (Create / Edit) ====== */}
            {showFormModal && (
                <Backdrop onClose={() => { setShowFormModal(false); resetForm(); }}>
                    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
                        {/* Sticky header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {editingReg ? 'Edit Registrasi' : 'Daftar Kunjungan Pasien'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {editingReg
                                        ? 'Perbarui data pendaftaran kunjungan'
                                        : 'Isi form pendaftaran kunjungan pasien'}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowFormModal(false); resetForm(); }}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">

                            {/* ── Patient search ── */}
                            <div ref={patientSearchRef} className="relative">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Pasien <span className="text-red-500">*</span>
                                </label>

                                {/* Show "selected" card only in create mode after picking */}
                                {form.patientId && !editingReg ? (
                                    <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold text-primary-800">{form.patientName}</p>
                                            <p className="text-[10px] font-medium text-primary-500">Pasien dipilih</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((f) => ({ ...f, patientId: '', patientName: '' }));
                                                setPatientSearch('');
                                            }}
                                            className="text-primary-400 hover:text-primary-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={patientSearch}
                                            onChange={(e) => {
                                                setPatientSearch(e.target.value);
                                                // If user types again in edit mode, clear the current selection
                                                if (editingReg && e.target.value !== form.patientName) {
                                                    setForm((f) => ({ ...f, patientId: '', patientName: '' }));
                                                }
                                            }}
                                            onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                                            placeholder="Ketik nama pasien atau No. RM..."
                                            className={`w-full py-2.5 pl-10 pr-10 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                                formErrors.patientId ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                                            }`}
                                        />
                                        {searchingPatient && (
                                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                )}

                                {/* Dropdown results */}
                                {showPatientDropdown && patientResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                        {patientResults.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setForm((f) => ({
                                                        ...f,
                                                        patientId:   String(p.id),
                                                        patientName: p.name,
                                                    }));
                                                    setPatientSearch(p.name);
                                                    setShowPatientDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400">
                                                    {p.medicalRecordNumber}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {formErrors.patientId && (
                                    <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.patientId}</p>
                                )}
                            </div>

                            {/* ── Doctor & Polyclinic ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Dokter <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.doctorId}
                                        onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                                        className={`w-full py-2.5 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                            formErrors.doctorId ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                    >
                                        <option value="">Pilih Dokter</option>
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.doctorId && (
                                        <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.doctorId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Poliklinik <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.polyId}
                                        onChange={(e) => setForm((f) => ({ ...f, polyId: e.target.value }))}
                                        className={`w-full py-2.5 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                            formErrors.polyId ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                    >
                                        <option value="">Pilih Poliklinik</option>
                                        {polyclinics.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.polyId && (
                                        <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.polyId}</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Visit Date & Payment Type ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Tanggal Kunjungan <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={form.visitDate}
                                            onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
                                            className={`w-full py-2.5 pl-10 pr-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                                formErrors.visitDate ? 'border-red-300' : 'border-slate-200'
                                            }`}
                                        />
                                    </div>
                                    {formErrors.visitDate && (
                                        <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.visitDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Jenis Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-1.5">
                                        {PAYMENT_TYPES.map((pt) => (
                                            <button
                                                key={pt.value}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, paymentType: pt.value }))}
                                                className={`w-full py-2 px-3 rounded-lg text-xs font-bold border text-left transition-all ${
                                                    form.paymentType === pt.value
                                                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                {pt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Status (edit mode, only when Menunggu) ── */}
                            {editingReg && editingReg.registStatus === 'Menunggu' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Status Kunjungan
                                    </label>
                                    <div className="flex gap-2">
                                        {['Menunggu', 'Check In'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, registStatus: s }))}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                    form.registStatus === s
                                                        ? s === 'Menunggu'
                                                            ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                                            : 'bg-blue-50 border-blue-300 text-blue-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Initial Complaint ── */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Keluhan Awal
                                    <span className="text-slate-400 font-normal ml-1">(opsional)</span>
                                </label>
                                <div className="relative">
                                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <textarea
                                        value={form.initialComplaint}
                                        onChange={(e) => setForm((f) => ({ ...f, initialComplaint: e.target.value }))}
                                        placeholder="Deskripsikan keluhan awal pasien..."
                                        rows={3}
                                        className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* ── Actions ── */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowFormModal(false); resetForm(); }}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingReg ? 'Simpan Perubahan' : 'Daftarkan Pasien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Backdrop>
            )}

            {/* ====== DETAIL MODAL ====== */}
            {showDetailModal && detailReg && (
                <Backdrop onClose={() => { setShowDetailModal(false); setDetailReg(null); }}>
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="text-base font-bold text-slate-800">Detail Registrasi</h3>
                            <button
                                onClick={() => { setShowDetailModal(false); setDetailReg(null); }}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="p-5 space-y-3 overflow-y-auto">
                            {/* Status + Date */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Kunjungan</p>
                                    <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(detailReg.visitDate)}</p>
                                </div>
                                <StatusBadge status={detailReg.registStatus} />
                            </div>

                            {/* Patient */}
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pasien</p>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{detailReg.patient?.name}</p>
                                <p className="text-xs font-semibold text-primary-600 mt-0.5">
                                    {detailReg.patient?.medicalRecordNumber}
                                </p>
                            </div>

                            {/* Doctor & Polyclinic - 2 col */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dokter</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">{detailReg.doctor?.name}</p>
                                    {detailReg.doctor?.specialization && (
                                        <p className="text-[10px] text-slate-400 mt-0.5">{detailReg.doctor.specialization}</p>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Poliklinik</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">{detailReg.polyclinic?.name}</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jenis Pembayaran</p>
                                </div>
                                <PaymentBadge type={detailReg.paymentType} />
                            </div>

                            {/* Initial Complaint */}
                            {detailReg.initialComplaint && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Keluhan Awal</p>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{detailReg.initialComplaint}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="px-5 pb-5 pt-1 flex gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    openEditModal(detailReg);
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                            >
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() => { setShowDetailModal(false); setDetailReg(null); }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </Backdrop>
            )}
        </div>
    );
};

export default Registrations;
