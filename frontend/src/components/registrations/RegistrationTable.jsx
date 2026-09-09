import { Eye, Pencil, CheckCircle2, ClipboardList, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from './RegistrationBadges';

const RegistrationTable = ({
    registrations,
    loading,
    onDetail,
    onEdit,
    onCheckIn
}) => {
    return (
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
                                                onClick={() => onDetail(reg)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                title="Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(reg)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {reg.registStatus === 'Menunggu' && (
                                                <button
                                                    onClick={() => onCheckIn(reg)}
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
    );
};

export default RegistrationTable;
