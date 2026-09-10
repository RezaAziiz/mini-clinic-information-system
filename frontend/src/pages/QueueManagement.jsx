import { useState, useEffect, useCallback } from 'react';

import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import Backdrop from '../components/common/Backdrop';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Filter, Calendar, Loader2, Stethoscope } from 'lucide-react';
import QueueTable from '../components/queue/QueueTable';
import QueueCreateModal from '../components/queue/QueueCreateModal';
import queueService from '../services/queue.service';
import doctorService from '../services/doctor.service';
import { registrationService } from "../services/registration.service";
import { referenceService } from "../services/reference.service";
import { ROLE, QUEUE_STATUS, REGIST_STATUS } from '../utils/constants';

const todayISO = () => new Date().toISOString().split('T')[0];

const STATUSES = [QUEUE_STATUS.MENUNGGU, QUEUE_STATUS.DIPANGGIL, QUEUE_STATUS.SELESAI];

//  Main component 

const QueueManagement = () => {
    const { user } = useAuth();
    const isPetugas = user?.role === ROLE.PETUGAS_PENDAFTARAN;

    // Data 
    const [queues, setQueues] = useState([]);
    const [polyclinics, setPolyclinics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Doctor profile (only relevant when role = Dokter) 
    const [myDoctorId, setMyDoctorId] = useState(null);     // Doctor record ID
    const [myDoctorName, setMyDoctorName] = useState('');
    const [loadingDoctorProfile, setLoadingDoctorProfile] = useState(!isPetugas);

    // Filters
    const [filterDate, setFilterDate] = useState(todayISO());
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPolyId, setFilterPolyId] = useState('');

    // Create modal 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [checkInRegs, setCheckInRegs] = useState([]);
    const [loadingRegs, setLoadingRegs] = useState(false);
    const [selectedRegId, setSelectedRegId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Action loading map (queueId → bool) 
    const [actionLoading, setActionLoading] = useState({});

    // Fetch doctor profile (for Dokter role) 
    useEffect(() => {
        if (isPetugas) return;
        const fetchMyProfile = async () => {
            setLoadingDoctorProfile(true);
            try {
                const res = await doctorService.getMyProfile();
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

    // Fetch queues 
    const fetchQueues = useCallback(async () => {
        // Dokter: wait until we know their doctorId before fetching
        if (!isPetugas && myDoctorId === null) return;

        setLoading(true);
        try {
            const params = {};
            if (filterDate) params.startDate = filterDate;
            if (filterStatus) params.status = filterStatus;
            // Petugas: optional poly filter. Dokter: always filter by own doctorId
            if (isPetugas && filterPolyId) params.polyId = filterPolyId;
            if (!isPetugas && myDoctorId) params.doctorId = myDoctorId;

            const res = await queueService.getAll(params);
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
            const res = await referenceService.getPolyclinics();
            if (res.success) setPolyclinics(res.data);
        } catch {
            // non-critical
        }
    }, [isPetugas]);

    useEffect(() => { fetchQueues(); }, [fetchQueues]);
    useEffect(() => { fetchPolyclinics(); }, [fetchPolyclinics]);

    // Fetch "Check In" registrations for create modal 
    const openCreateModal = async () => {
        setShowCreateModal(true);
        setSelectedRegId('');
        setLoadingRegs(true);
        try {
            const res = await registrationService.getAll({ status: REGIST_STATUS.CHECK_IN, startDate: filterDate || todayISO() });
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
            await queueService.create({ registrationId: Number(selectedRegId) });
            toast.success('Nomor antrean berhasil digenerate');
            setShowCreateModal(false);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal membuat antrean');
        } finally {
            setSubmitting(false);
        }
    };

    // Call queue (Menunggu → Dipanggil) 
    const handleCall = async (queue) => {
        setActionLoading((p) => ({ ...p, [queue.id]: true }));
        try {
            await queueService.callQueue(queue.id);
            toast.success(`Antrean ${queue.queueNumber} berhasil dipanggil`);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal memanggil antrean');
        } finally {
            setActionLoading((p) => ({ ...p, [queue.id]: false }));
        }
    };

    // Finish queue (Dipanggil → Selesai) 
    const handleFinish = async (queue) => {
        setActionLoading((p) => ({ ...p, [queue.id]: true }));
        try {
            await queueService.updateStatus(queue.id, QUEUE_STATUS.SELESAI);
            toast.success(`Antrean ${queue.queueNumber} selesai`);
            fetchQueues();
        } catch (error) {
            toast.error(error?.message || 'Gagal memperbarui status');
        } finally {
            setActionLoading((p) => ({ ...p, [queue.id]: false }));
        }
    };

    // Stats from queues list 
    const stats = {
        total: queues.length,
        menunggu: queues.filter((q) => q.queueStatus === QUEUE_STATUS.MENUNGGU).length,
        dipanggil: queues.filter((q) => q.queueStatus === QUEUE_STATUS.DIPANGGIL).length,
        selesai: queues.filter((q) => q.queueStatus === QUEUE_STATUS.SELESAI).length,
    };

    //  Render 

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
                    { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
                    { label: 'Menunggu', value: stats.menunggu, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Dipanggil', value: stats.dipanggil, color: 'text-blue-600', bg: 'bg-blue-50' },
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!filterStatus
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s
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
            <QueueTable
                queues={queues}
                loading={loading}
                actionLoading={actionLoading}
                handleCall={handleCall}
                handleFinish={handleFinish}
            />
            <QueueCreateModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                loadingRegs={loadingRegs}
                checkInRegs={checkInRegs}
                selectedRegId={selectedRegId}
                setSelectedRegId={setSelectedRegId}
                handleCreateQueue={handleCreateQueue}
                submitting={submitting}
            />
        </div>
    );
};

export default QueueManagement;
