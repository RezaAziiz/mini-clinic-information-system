import { X, Loader2, Clock, User, Building2, Stethoscope, CheckCircle2, Hash } from 'lucide-react';
import Backdrop from '../common/Backdrop';

const QueueCreateModal = ({
    show,
    onClose,
    loadingRegs,
    checkInRegs,
    selectedRegId,
    setSelectedRegId,
    handleCreateQueue,
    submitting
}) => {
    if (!show) return null;

    return (
        <Backdrop onClose={onClose}>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col w-full">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Generate Nomor Antrean</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Pilih pendaftaran (status Check In) untuk digenerate antreannya
                        </p>
                    </div>
                    <button
                        onClick={onClose}
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
                        onClick={onClose}
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
    );
};

export default QueueCreateModal;
