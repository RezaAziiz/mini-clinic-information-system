import { X, CreditCard, User, Calendar, Phone, MapPin, Pencil } from 'lucide-react';
import Backdrop from '../common/Backdrop';
import { formatDate, calculateAge, genderLabel } from '../../utils/formatters';

const PatientDetailModal = ({ show, onClose, detailPatient, onEdit }) => {
    if (!show || !detailPatient) return null;

    return (
        <Backdrop onClose={onClose}>
            <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
                <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-base font-bold text-slate-800">Detail Pasien</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {/* Patient Avatar & Name */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${
                            detailPatient.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                            {detailPatient.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-800">{detailPatient.name}</h4>
                            <p className="text-xs font-semibold text-primary-600">{detailPatient.medicalRecordNumber}</p>
                        </div>
                    </div>

                    {/* Info Grid - 2 cols for compact display */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {[
                            { icon: CreditCard, label: 'NIK', value: detailPatient.nik },
                            { icon: User, label: 'Jenis Kelamin', value: genderLabel(detailPatient.gender) },
                            { icon: Calendar, label: 'Tanggal Lahir', value: `${formatDate(detailPatient.dateOfBirth)} (${calculateAge(detailPatient.dateOfBirth)})` },
                            { icon: Phone, label: 'No. Handphone', value: detailPatient.phone || '-' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/80">
                                <item.icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-xs font-semibold text-slate-700 mt-0.5 break-words">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Alamat - full width */}
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/80">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alamat</p>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">{detailPatient.address || '-'}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(detailPatient);
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
            </div>
        </Backdrop>
    );
};

export default PatientDetailModal;
