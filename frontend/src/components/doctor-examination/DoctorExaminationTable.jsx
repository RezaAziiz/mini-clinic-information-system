import { Loader2, ClipboardList, User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from '../registrations/RegistrationBadges';
import { REGIST_STATUS } from '../../utils/constants';

const DoctorExaminationTable = ({
    displayed,
    loading,
    onOpenModal
}) => {
    return (
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
                                            {(reg.registStatus === REGIST_STATUS.CHECK_IN || reg.registStatus === REGIST_STATUS.PEMERIKSAAN) && (
                                                <button
                                                    onClick={() => onOpenModal(reg)}
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
    );
};

export default DoctorExaminationTable;
