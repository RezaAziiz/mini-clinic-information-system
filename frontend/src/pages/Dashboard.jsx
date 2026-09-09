import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
    Users, CalendarDays, ListOrdered, Clock, CheckCircle2,
    UserPlus, Building2, Stethoscope, HeartPulse, Stethoscope as PediatricIcon, ShieldAlert, ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';

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
    const [recentVisits, setRecentVisits] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch metrics
                const resMetrics = await api.get('/dashboard');
                if (resMetrics.success) {
                    setMetrics(resMetrics.data);
                }

                // Fetch recent visits (Aktivitas Kunjungan Terkini)
                const resVisits = await api.get('/registrations');
                if (resVisits.success) {
                    // Ambil 5 data terbaru
                    setRecentVisits(resVisits.data.slice(0, 5));
                }
            } catch (error) {
                console.error("Gagal mengambil data dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper untuk render metric card
    const MetricCard = ({ title, value, icon: Icon, subInfo, badge }) => (
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

    return (
        <div className="space-y-6">

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Pagi</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pusat Operasional Klinik</h2>
                </div>

                {/* Sembunyikan tombol ini untuk Dokter */}
                {!isDoctor && (
                    <Button icon={UserPlus} className="px-6">
                        Daftarkan Pasien Baru
                    </Button>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Pasien"
                    value={metrics.totalPasien}
                    icon={Users}
                />
                <MetricCard
                    title="Pasien Hari Ini"
                    value={metrics.totalKunjunganHariIni}
                    icon={CalendarDays}
                    subInfo="Kunjungan"
                />
                <MetricCard
                    title="Total Antrean"
                    value={metrics.totalAntreanHariIni}
                    icon={ListOrdered}
                    subInfo="Rawat Jalan"
                />
                <MetricCard
                    title="Sedang Menunggu"
                    value={metrics.antreanMenunggu}
                    icon={Clock}
                    subInfo="Pasien"
                    badge={{ text: `${metrics.antreanMenunggu} Menunggu`, icon: <Clock className="w-3 h-3" /> }}
                />
                <MetricCard
                    title="Pemeriksaan Usai"
                    value={metrics.antreanSelesai}
                    icon={CheckCircle2}
                    subInfo="Pasien"
                    badge={{ text: `${metrics.antreanSelesai} Selesai`, icon: <CheckCircle2 className="w-3 h-3" /> }}
                />
            </div>

            {/* Antrean Poli Section (Mocked UI for now) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Alur Antrean Poli Aktif Hari Ini</h3>
                            <p className="text-xs text-slate-500 font-medium">Status panggilan langsung dari 4 Pli</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">Auto-Sync 5s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Dummy Data sesuai screenshot tapi di-adaptasi (tanpa ruang, nama dokter sesuai seed) */}
                    {[
                        { poli: 'Poli Umum', doc: 'dr. Sari Dewi, Sp.PD', queue: 'A-018', left: 4, status: 'Memeriksa', icon: HeartPulse },
                        { poli: 'Poli Gigi', doc: 'drg. Budi Santoso', queue: 'B-009', left: 3, status: 'Memeriksa', icon: Stethoscope },
                        { poli: 'Poli Anak', doc: 'dr. Rina Kartika, Sp.A', queue: 'C-012', left: 5, status: 'Menunggu', icon: PediatricIcon },
                        { poli: 'Poli Umum', doc: 'dr. Sari Dewi, Sp.PD', queue: 'A-019', left: 2, status: 'Memeriksa', icon: HeartPulse }, // Seeded doctors might be limited, mocking names here
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/80">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-0.5">{item.poli}</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate w-32">{item.doc}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${item.status === 'Memeriksa' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="flex items-end justify-between mt-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">Nomor Dipanggil</p>
                                    <p className="text-3xl font-black text-primary-600 tracking-tighter leading-none">{item.queue}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">Sisa Antre</p>
                                    <p className="text-sm font-black text-slate-700">{item.left} <span className="text-[10px] font-semibold text-slate-500">orang</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Bottom Section: Kunjungan Terkini & Dokter Aktif */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Aktivitas Kunjungan Terkini */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Aktivitas Kunjungan Terkini</h3>
                            <p className="text-xs text-slate-500 font-medium">Pembaruan rekam alur pasien rawat jalan hari ini</p>
                        </div>
                        <button className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
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
                                {recentVisits.length > 0 ? recentVisits.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 text-xs font-bold text-primary-600">#{row.patient?.medicalRecordNumber}</td>
                                        <td className="py-4">
                                            <p className="font-bold text-slate-700 text-xs">{row.patient?.name}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold">{row.paymentType}</p>
                                        </td>
                                        <td className="py-4 text-xs font-bold text-slate-600">{row.polyclinic?.name}</td>
                                        <td className="py-4 text-xs font-medium text-slate-500">
                                            {new Date(row.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                                                row.registStatus === 'Pemeriksaan' ? 'bg-indigo-50 text-indigo-700' :
                                                row.registStatus === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {row.registStatus}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-xs font-medium text-slate-400">Belum ada kunjungan hari ini</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dokter Sedang Bertugas */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Dokter Bertugas</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-pulse"></div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'dr. Sari Dewi, Sp.PD', initial: 'SD', poli: 'Poli Dalam', count: '18/25' },
                            { name: 'drg. Budi Santoso', initial: 'BS', poli: 'Poli Gigi', count: '9/15' },
                            { name: 'dr. Rina Kartika, Sp.A', initial: 'RK', poli: 'Poli Anak', count: '12/20' },
                        ].map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all cursor-default">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                                    {doc.initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                                    <p className="text-[10px] font-semibold text-slate-500">{doc.poli}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-800">{doc.count}</p>
                                    <p className="text-[9px] font-semibold text-slate-400">Pasien</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
