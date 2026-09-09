import { Loader2, ListOrdered, PhoneCall, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from './QueueBadges';

const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const QueueTable = ({
    queues,
    loading,
    actionLoading,
    handleCall,
    handleFinish
}) => {
    return (
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
    );
};

export default QueueTable;
