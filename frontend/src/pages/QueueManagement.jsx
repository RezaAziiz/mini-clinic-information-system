import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus, X, Filter, Calendar, Loader2,
    ListOrdered, PhoneCall, CheckCircle2, Clock,
    User, Building2, Stethoscope, Hash
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

const QUEUE_STATUS_STYLES = {
    Menunggu:   'bg-yellow-50 text-yellow-700',
    Dipanggil:  'bg-blue-50  text-blue-700',
    Selesai:    'bg-green-50 text-green-700',
};

const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${QUEUE_STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

const todayISO = () => new Date().toISOString().split('T')[0];

const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

const STATUSES = ['Menunggu', 'Dipanggil', 'Selesai'];

// ─── Main component ───────────────────────────────────────────────────────────

const QueueManagement = () => {
    const { user } = useAuth();
    const isPetugas = user?.role === 'Petugas Pendaftaran';

    // ── Data ──────────────────────────────────────────────────────────────────
    const [queues, setQueues] = useState([]);
    const [polyclinics, setPolyclinics] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Doctor profile (only relevant when role = Dokter) ─────────────────────
    const [myDoctorId, setMyDoctorId] = useState(null);     // Doctor record ID
    const [myDoctorName, setMyDoctorName] = useState('');
    const [loadingDoctorProfile, setLoadingDoctorProfile] = useState(!isPetugas);

    // ── Filters ───────────────────────────────────────────────────────────────
    const [filterDate, setFilterDate] = useState(todayISO());
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPolyId, setFilterPolyId] = useState('');

    // ── Create modal ──────────────────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [checkInRegs, setCheckInRegs] = useState([]);
    const [loadingRegs, setLoadingRegs] = useState(false);
    const [selectedRegId, setSelectedRegId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Action loading map (queueId → bool) ───────────────────────────────────
    const [actionLoading, setActionLoading] = useState({});

    // ── Fetch doctor profile (for Dokter role) ────────────────────────────────
    useEffect(() => {
        if (isPetugas) return;
        const fetchMyProfile = async () => {
            setLoadingDoctorProfile(true);
            try {
                const res = await api.get('/doctors/me');
                if (res.success) {
                    setMyDoctorId(String(res.data.id));
                    setMyDoctorName(res.data.name);
                }
            } catch {
                toast.error('Gagal memuat profil dokter');
            } finally {
                setLoadingDoctorProfile(false);
            }
        };
        fetchMyProfile();
    }, [isPetugas]);

    // ── Fetch queues ──────────────────────────────────────────────────────────
    const fetchQueues = useCallback(async () => {
        // Dokter: wait until we know their doctorId before fetching
        if (!isPetugas && myDoctorId === null) return;

        setLoading(true);
        try {
            const params = {};
            if (filterDate)   params.startDate = filterDate;
            if (filterStatus) params.status    = filterStatus;
            // Petugas: optional poly filter. Dokter: always filter by own doctorId
            if (isPetugas && filterPolyId) params.polyId = filterPolyId;
            if (!isPetugas && myDoctorId)  params.doctorId = myDoctorId;

            const res = await api.get('/queues', { params });
            if (res.success) setQueues(res.data);
        } catch {
            toast.error('Gagal memuat data antrean');
        } finally {
            setLoading(false);
        }
    }, [filterDate, filterStatus, filterPolyId, isPetugas, myDoctorId]);

    const fetchPolyclinics = useCallback(async () => {
        if (!isPetugas) return; // dokter tidak butuh filter poli
        try {
            const res = await api.get('/polyclinics');
            if (res.success) setPolyclinics(res.data);
        } catch {
            // non-critical
        }
    }, [isPetugas]);

    useEffect(() => { fetchQueues(); },      [fetchQueues]);
    useEffect(() => { fetchPolyclinics(); }, [fetchPolyclinics]);

    // ── Fetch "Check In" registrations for create modal ───────────────────────
    const openCreateModal = async () => {
        setShowCreateModal(true);
        setSelectedRegId('');
        setLoadingRegs(true);
        try {
            const res = await api.get('/registrations', {
                params: { status: 'Check In', startDate: filterDate || todayISO() },
            });
            if (res.success) setCheckInRegs(res.data);
        } catch {
            toast.error('Gagal memuat daftar pendaftaran');
        } finally {
            setLoadingRegs(false);
        }
    };

    const handleCreateQueue = async () => {
        if (!selectedRegId) {
            toast.error('Pilih pendaftaran terlebih dahulu');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/queues', { registrationId: Number(selectedRegId) });
            toast.success('Nomor antrean berhasil digenerate');
            setShowCreateModal(false);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal membuat antrean');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Call queue (Menunggu → Dipanggil) ─────────────────────────────────────
    const handleCall = async (queue) => {
        setActionLoading((p) => ({ ...p, [queue.id]: true }));
        try {
            await api.put(`/queues/${queue.id}/call`);
            toast.success(`Antrean ${queue.queueNumber} berhasil dipanggil`);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal memanggil antrean');
        } finally {
            setActionLoading((p) => ({ ...p, [queue.id]: false }));
        }
    };

    // ── Finish queue (Dipanggil → Selesai) ────────────────────────────────────
    const handleFinish = async (queue) => {
        setActionLoading((p) => ({ ...p, [queue.id]: true }));
        try {
            await api.put(`/queues/${queue.id}/status`, { queueStatus: 'Selesai' });
            toast.success(`Antrean ${queue.queueNumber} selesai`);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal memperbarui status');
        } finally {
            setActionLoading((p) => ({ ...p, [queue.id]: false }));
        }
    };

    // ── Stats from queues list ─────────────────────────────────────────────────
    const stats = {
        total:     queues.length,
        menunggu:  queues.filter((q) => q.queueStatus === 'Menunggu').length,
        dipanggil: queues.filter((q) => q.queueStatus === 'Dipanggil').length,
        selesai:   queues.filter((q) => q.queueStatus === 'Selesai').length,
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    // Show loading state while fetching doctor profile
    if (loadingDoctorProfile) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin mr-3" />
                <p className="text-sm text-slate-500">Memuat profil dokter...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Manajemen Antrean
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {isPetugas
                            ? <>Kelola antrean kunjungan pasien • <span className="text-primary-600 font-bold">{stats.total}</span> antrean ditemukan</>
                            : <>Antrean pasien Anda hari ini • <span className="font-semibold text-slate-700">{myDoctorName}</span> • <span className="text-primary-600 font-bold">{stats.total}</span> antrean</>
                        }
                    </p>
                </div>
                {isPetugas && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        Generate Antrean
                    </button>
                )}
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total',     value: stats.total,     color: 'text-slate-700',  bg: 'bg-white' },
                    { label: 'Menunggu',  value: stats.menunggu,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Dipanggil', value: stats.dipanggil, color: 'text-blue-600',   bg: 'bg-blue-50' },
                    { label: 'Selesai',   value: stats.selesai,   color: 'text-green-600',  bg: 'bg-green-50' },
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

                    {/* Date */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none"
                        />
                        {filterDate && (
                            <button onClick={() => setFilterDate('')} className="text-slate-400 hover:text-slate-600 transition-colors">
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

                    {/* Polyclinic filter — only for Petugas */}
                    {isPetugas && polyclinics.length > 0 && (
                        <select
                            value={filterPolyId}
                            onChange={(e) => setFilterPolyId(e.target.value)}
                            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none focus:border-primary-400 transition-colors"
                        >
                            <option value="">Semua Poliklinik</option>
                            {polyclinics.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    )}

                    {/* Doctor context badge — only for Dokter */}
                    {!isPetugas && myDoctorName && (
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
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Antrean</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasien</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poli / Dokter</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dipanggil Pukul</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-medium text-slate-400">Memuat data antrean...</p>
                                    </td>
                                </tr>
                            ) : queues.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <ListOrdered className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">Tidak ada data antrean</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Coba ubah filter tanggal / status, atau generate antrean baru
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                queues.map((queue) => (
                                    <tr key={queue.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Queue number */}
                                        <td className="px-5 py-4">
                                            <span className={`text-xl font-black tracking-tight ${
                                                queue.queueStatus === 'Selesai'
                                                    ? 'text-slate-300'
                                                    : 'text-primary-600'
                                            }`}>
                                                {queue.queueNumber}
                                            </span>
                                        </td>

                                        {/* Patient */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-slate-700">
                                                {queue.registration?.patient?.name}
                                            </p>
                                            <p className="text-[10px] font-semibold text-primary-600">
                                                {queue.registration?.patient?.medicalRecordNumber}
                                            </p>
                                        </td>

                                        {/* Poli / Doctor */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-700">
                                                {queue.registration?.polyclinic?.name}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400">
                                                {queue.registration?.doctor?.name}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <StatusBadge status={queue.queueStatus} />
                                        </td>

                                        {/* Called at */}
                                        <td className="px-5 py-4">
                                            {queue.calledAt ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600">{formatTime(queue.calledAt)}</p>
                                                    <p className="text-[10px] text-slate-400">{formatDate(queue.calledAt)}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {queue.queueStatus === 'Menunggu' && (
                                                    <button
                                                        onClick={() => handleCall(queue)}
                                                        disabled={actionLoading[queue.id]}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-600/25"
                                                    >
                                                        {actionLoading[queue.id]
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <PhoneCall className="w-3.5 h-3.5" />
                                                        }
                                                        Panggil
                                                    </button>
                                                )}

                                                {queue.queueStatus === 'Dipanggil' && (
                                                    <button
                                                        onClick={() => handleFinish(queue)}
                                                        disabled={actionLoading[queue.id]}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm shadow-green-600/25"
                                                    >
                                                        {actionLoading[queue.id]
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <CheckCircle2 className="w-3.5 h-3.5" />
                                                        }
                                                        Selesaikan
                                                    </button>
                                                )}

                                                {queue.queueStatus === 'Selesai' && (
                                                    <span className="text-xs font-semibold text-slate-300">Selesai</span>
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

            {/* ====== CREATE QUEUE MODAL (Petugas only) ====== */}
            {showCreateModal && (
                <Backdrop onClose={() => setShowCreateModal(false)}>
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Generate Nomor Antrean</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Pilih pendaftaran (status Check In) untuk digenerate antreannya
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {loadingRegs ? (
                                <div className="py-10 text-center">
                                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">Memuat daftar pendaftaran...</p>
                                </div>
                            ) : checkInRegs.length === 0 ? (
                                <div className="py-10 text-center">
                                    <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-400">Tidak ada pendaftaran Check In</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Semua pasien sudah memiliki antrean, atau belum ada yang Check In pada tanggal ini
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {checkInRegs.map((reg) => (
                                        <button
                                            key={reg.id}
                                            type="button"
                                            onClick={() => setSelectedRegId(String(reg.id))}
                                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                                                selectedRegId === String(reg.id)
                                                    ? 'border-primary-400 bg-primary-50'
                                                    : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <p className="text-sm font-bold text-slate-700 truncate">
                                                            {reg.patient?.name}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] font-semibold text-primary-600 mb-1.5">
                                                        {reg.patient?.medicalRecordNumber}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {reg.polyclinic?.name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Stethoscope className="w-3 h-3" />
                                                            {reg.doctor?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedRegId === String(reg.id) && (
                                                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 pt-3 flex gap-3 shrink-0 border-t border-slate-100">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreateQueue}
                                disabled={submitting || !selectedRegId || checkInRegs.length === 0}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Hash className="w-4 h-4" />
                                }
                                Generate Antrean
                            </button>
                        </div>
                    </div>
                </Backdrop>
            )}
        </div>
    );
};

export default QueueManagement;
