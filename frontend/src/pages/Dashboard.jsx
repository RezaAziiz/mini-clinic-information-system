import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
    Users, CalendarDays, ListOrdered, Clock, CheckCircle2,
    UserPlus, Building2, Stethoscope, X, ArrowRight, Loader2
} from 'lucide-react';
import Button from '../components/common/Button';

const todayISO = () => new Date().toISOString().split('T')[0];

const STATUS_STYLES = {
    'Menunggu':    'bg-amber-50 text-amber-700',
    'Check In':    'bg-blue-50 text-blue-700',
    'Pemeriksaan': 'bg-indigo-50 text-indigo-700',
    'Selesai':     'bg-emerald-50 text-emerald-700',
};

const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

const VisitTable = ({ rows, paginate = false }) => {
    const [page, setPage] = useState(1);
    const limit = 10;
    
    // Calculate pagination locally if paginate=true
    const totalPages = Math.ceil(rows.length / limit);
    const displayedRows = paginate ? rows.slice((page - 1) * limit, page * limit) : rows;

    return (
        <div className="flex flex-col">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">NO. RM</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">PASIEN</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">POLI TUJUAN</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">JAM MASUK</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {displayedRows.length > 0 ? displayedRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-xs font-bold text-primary-600">
                                #{row.patient?.medicalRecordNumber}
                            </td>
                            <td className="py-4">
                                <p className="font-bold text-slate-700 text-xs">{row.patient?.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{row.paymentType}</p>
                            </td>
                            <td className="py-4 text-xs font-bold text-slate-600">{row.polyclinic?.name}</td>
                            <td className="py-4 text-xs font-medium text-slate-500">
                                {new Date(row.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </td>
                            <td className="py-4">
                                <StatusBadge status={row.registStatus} />
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" className="py-8 text-center text-xs font-medium text-slate-400">
                                Belum ada kunjungan
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {paginate && totalPages > 1 && (
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                    <p className="text-xs font-medium text-slate-400">
                        Menampilkan <span className="font-bold text-slate-600">{(page - 1) * limit + 1}–{Math.min(page * limit, rows.length)}</span> dari <span className="font-bold text-slate-600">{rows.length}</span> kunjungan
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-xs font-bold text-slate-600 px-2">{page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, loading, icon: Icon, subInfo, badge }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</h3>
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div className="flex items-end gap-3 mt-auto">
            <span className="text-4xl font-black text-slate-800 tabular-nums tracking-tight">
                {loading ? '...' : value}
            </span>
            {subInfo && <span className="text-xs font-semibold text-slate-400 mb-1.5">{subInfo}</span>}
        </div>
        {badge && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-bold w-max">
                {badge.icon} {badge.text}
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const isDoctor = user?.role === 'Dokter';

    const [metrics, setMetrics] = useState({
        totalPasien: 0,
        totalKunjunganHariIni: 0,
        totalAntreanHariIni: 0,
        antreanMenunggu: 0,
        antreanSelesai: 0
    });

    const [loading, setLoading] = useState(true);
    const [allVisits, setAllVisits] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [todayQueues, setTodayQueues] = useState([]);
    const [showAllModal, setShowAllModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resMetrics, resVisits, resDoctors, resQueues] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/registrations'),
                    api.get('/doctors'),
                    api.get('/queues', { params: { startDate: todayISO() } }),
                ]);

                if (resMetrics.success) setMetrics(resMetrics.data);
                if (resVisits.success)  setAllVisits(resVisits.data);
                if (resDoctors.success) setDoctors(resDoctors.data);
                if (resQueues.success)  setTodayQueues(resQueues.data);
            } catch (error) {
                console.error('Gagal mengambil data dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Build per-poli queue summary from today's queues
    const poliSummary = (() => {
        const map = {};
        todayQueues.forEach((q) => {
            const polyId  = q.registration?.polyclinic?.id;
            const polyName = q.registration?.polyclinic?.name;
            const docName  = q.registration?.doctor?.name;
            if (!polyId) return;
            if (!map[polyId]) {
                map[polyId] = { polyName, docName, waiting: 0, lastCalled: null };
            }
            if (q.queueStatus === 'Menunggu')   map[polyId].waiting++;
            if (q.queueStatus === 'Dipanggil')  map[polyId].lastCalled = q.queueNumber;
        });
        return Object.values(map);
    })();

    const recentVisits = allVisits.slice(0, 5);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Pusat Operasional Klinik
                    </h2>
                </div>
                {!isDoctor && (
                    <Button icon={UserPlus} className="px-6">
                        Daftarkan Pasien Baru
                    </Button>
                )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard loading={loading} title="Total Pasien"      value={metrics.totalPasien}           icon={Users} />
                <MetricCard loading={loading} title="Pasien Hari Ini"   value={metrics.totalKunjunganHariIni} icon={CalendarDays} subInfo="Kunjungan" />
                <MetricCard loading={loading} title="Total Antrean"     value={metrics.totalAntreanHariIni}   icon={ListOrdered}  subInfo="Rawat Jalan" />
                <MetricCard loading={loading} title="Sedang Menunggu"   value={metrics.antreanMenunggu}       icon={Clock}
                    badge={{ text: `${metrics.antreanMenunggu} Menunggu`, icon: <Clock className="w-3 h-3" /> }} />
                <MetricCard loading={loading} title="Pemeriksaan Usai"  value={metrics.antreanSelesai}        icon={CheckCircle2} subInfo="Pasien"
                    badge={{ text: `${metrics.antreanSelesai} Selesai`, icon: <CheckCircle2 className="w-3 h-3" /> }} />
            </div>

            {/* Antrean Poli — real data from /queues */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Alur Antrean Poli Aktif Hari Ini</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {poliSummary.length > 0
                                    ? `${poliSummary.length} poliklinik aktif`
                                    : 'Belum ada antrean hari ini'}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 text-primary-400 animate-spin mr-2" />
                        <span className="text-sm text-slate-400">Memuat data antrean...</span>
                    </div>
                ) : poliSummary.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">
                        Belum ada antrean aktif hari ini
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {poliSummary.map((item, idx) => (
                            <div key={idx} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/80">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-0.5">{item.polyName}</h4>
                                        <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">
                                            {item.docName}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${
                                        item.lastCalled
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {item.lastCalled ? 'Memeriksa' : 'Menunggu'}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between mt-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Nomor Dipanggil</p>
                                        <p className="text-3xl font-black text-primary-600 tracking-tighter leading-none">
                                            {item.lastCalled || '—'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Sisa Antre</p>
                                        <p className="text-sm font-black text-slate-700">
                                            {item.waiting}{' '}
                                            <span className="text-[10px] font-semibold text-slate-500">orang</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom: Recent Visits + Dokter Bertugas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Aktivitas Kunjungan Terkini */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Aktivitas Kunjungan Terkini</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Pembaruan rekam alur pasien rawat jalan hari ini
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAllModal(true)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                        >
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <VisitTable rows={recentVisits} />
                    </div>
                </div>

                {/* Dokter Bertugas */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Dokter Bertugas</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-pulse"></div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                        </div>
                    ) : doctors.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">Tidak ada data dokter</p>
                    ) : (
                        <div className="space-y-3">
                            {doctors.map((doc, idx) => {
                                const initials = doc.name
                                    .split(' ')
                                    .filter((w) => /^[A-Z]/.test(w))
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('');
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
                                            {initials || doc.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 truncate">
                                                {doc.specialization || 'Dokter Umum'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* ====== "Lihat Semua" Modal ====== */}
            {showAllModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowAllModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col"
                    >
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Semua Aktivitas Kunjungan</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Total <span className="font-bold text-primary-600">{allVisits.length}</span> kunjungan
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAllModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Modal body */}
                        <div className="overflow-y-auto p-6">
                            <VisitTable rows={allVisits} paginate={true} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
