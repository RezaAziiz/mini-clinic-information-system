import { X, User, Stethoscope, Building2, CreditCard, FileText, Pencil } from 'lucide-react';
import Backdrop from '../common/Backdrop';
import { formatDate } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from './RegistrationBadges';

const RegistrationDetailModal = ({ show, onClose, detailReg, onEdit }) => {
    if (!show || !detailReg) return null;

    return (
        <Backdrop onClose={onClose}>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-bold text-slate-800">Detail Registrasi</h3>
                    <button
                        onClick={onClose}
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
                            onClose();
                            onEdit(detailReg);
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Backdrop>
    );
};

export default RegistrationDetailModal;
