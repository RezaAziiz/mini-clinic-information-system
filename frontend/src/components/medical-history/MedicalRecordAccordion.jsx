import { Loader2, ClipboardList, Calendar, Stethoscope, Building2, ChevronUp, ChevronDown, CreditCard, Pill } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge, PaymentBadge, SoapSection } from './MedicalHistoryBadges';

const MedicalRecordAccordion = ({
    selectedPatient,
    loadingRecords,
    records,
    expandedId,
    toggleExpand
}) => {
    if (!selectedPatient) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">Belum ada pasien dipilih</p>
                <p className="text-xs text-slate-400 mt-1">
                    Cari pasien di atas untuk melihat riwayat pemeriksaan
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-700">Riwayat Pemeriksaan</h3>
                {!loadingRecords && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-primary-50 text-primary-700">
                        {records.length} catatan
                    </span>
                )}
                <span className="text-sm text-slate-400 font-medium">
                    dari <span className="font-bold text-slate-600">{selectedPatient.name}</span>
                </span>
            </div>

            {/* Loading */}
            {loadingRecords && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin mr-3" />
                    <p className="text-sm text-slate-500 font-medium">Memuat riwayat pemeriksaan...</p>
                </div>
            )}

            {/* Empty */}
            {!loadingRecords && records.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Belum ada riwayat pemeriksaan</p>
                    <p className="text-xs text-slate-400 mt-1">Pasien ini belum memiliki catatan pemeriksaan</p>
                </div>
            )}

            {/* Record cards */}
            {!loadingRecords && records.map((record) => {
                const isExpanded = expandedId === record.id;
                const reg        = record.registration;

                return (
                    <div
                        key={record.id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                        {/* Card header (always visible, clickable) */}
                        <button
                            onClick={() => toggleExpand(record.id)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Date */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {formatDateTime(record.examinedAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <span className="text-slate-200 hidden sm:block">|</span>

                                {/* Doctor */}
                                {reg?.doctor && (
                                    <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                                        <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-600 truncate">
                                            {reg.doctor.name}
                                            {reg.doctor.specialization && (
                                                <span className="text-slate-400 font-normal"> • {reg.doctor.specialization}</span>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Poli */}
                                {reg?.polyclinic && (
                                    <div className="hidden md:flex items-center gap-1.5 min-w-0">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-500 truncate">
                                            {reg.polyclinic.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Chevron */}
                            <div className="shrink-0 ml-3">
                                {isExpanded
                                    ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                    : <ChevronDown className="w-4 h-4 text-slate-400" />
                                }
                            </div>
                        </button>

                        {/* Card body (accordion) */}
                        {isExpanded && (
                            <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-4">

                                {/* Info strip */}
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    {reg?.visitDate && (
                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            Kunjungan: <span className="font-semibold text-slate-700">{formatDate(reg.visitDate)}</span>
                                        </div>
                                    )}
                                    {reg?.paymentType && (
                                        <div className="flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                            <PaymentBadge type={reg.paymentType} />
                                        </div>
                                    )}
                                    {reg?.registStatus && (
                                        <StatusBadge status={reg.registStatus} />
                                    )}
                                    {reg?.doctor && (
                                        <div className="flex items-center gap-1.5 sm:hidden">
                                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 font-medium">{reg.doctor.name}</span>
                                        </div>
                                    )}
                                    {reg?.polyclinic && (
                                        <div className="flex items-center gap-1.5 md:hidden">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 font-medium">{reg.polyclinic.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── S — Subjective ── */}
                                <SoapSection accentCls="border-blue-400" label="S" sublabel="Subjective — Keluhan Pasien">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {record.subjective || <span className="text-slate-400 italic">—</span>}
                                    </p>
                                </SoapSection>

                                {/* ── O — Objective ── */}
                                <SoapSection accentCls="border-teal-400" label="O" sublabel="Objective — Pemeriksaan Fisik">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Tekanan Darah', value: record.bloodPressure, unit: 'mmHg' },
                                            { label: 'Suhu',          value: record.temperature,   unit: '°C'   },
                                            { label: 'Berat Badan',   value: record.weight,        unit: 'kg'   },
                                            { label: 'Tinggi Badan',  value: record.height,        unit: 'cm'   },
                                        ].map(({ label, value, unit }) => (
                                            <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                    {label}
                                                </p>
                                                {value ? (
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {value}
                                                        <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-300">—</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SoapSection>

                                {/* ── A — Assessment ── */}
                                <SoapSection accentCls="border-amber-400" label="A" sublabel="Assessment — Diagnosa">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {record.assessment || <span className="text-slate-400 italic">—</span>}
                                    </p>
                                </SoapSection>

                                {/* ── P — Plan ── */}
                                <SoapSection accentCls="border-rose-400" label="P" sublabel="Plan — Rencana Terapi">
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {record.plan || <span className="text-slate-400 italic">—</span>}
                                        </p>
                                        {record.medicalAction && (
                                            <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5">
                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                                                    Tindakan Medis
                                                </p>
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {record.medicalAction}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </SoapSection>

                                {/* ── Prescriptions ── */}
                                {record.prescriptions?.length > 0 && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                                            <Pill className="w-4 h-4 text-primary-500" />
                                            <span className="text-sm font-bold text-slate-700">Resep Obat</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-600">
                                                {record.prescriptions.length} resep
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {record.prescriptions.map((presc, prescIdx) => (
                                                <div key={presc.id} className="p-4 space-y-3">
                                                    {/* Prescription header */}
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <span className="text-xs font-bold text-slate-500">
                                                            Resep #{prescIdx + 1}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-slate-400">
                                                            {presc.prescriptionDate
                                                                ? formatDate(presc.prescriptionDate)
                                                                : ''}
                                                        </span>
                                                    </div>

                                                    {/* Notes */}
                                                    {presc.notes && (
                                                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 italic">
                                                            {presc.notes}
                                                        </p>
                                                    )}

                                                    {/* Items table */}
                                                    {presc.prescriptionItems?.length > 0 && (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left text-xs">
                                                                <thead>
                                                                    <tr className="bg-slate-50">
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8">No</th>
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Obat</th>
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosis</th>
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frekuensi</th>
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Jumlah</th>
                                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instruksi</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-50">
                                                                    {presc.prescriptionItems.map((item, itemIdx) => (
                                                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                                            <td className="px-3 py-2.5 text-slate-400 font-semibold">{itemIdx + 1}</td>
                                                                            <td className="px-3 py-2.5 font-bold text-slate-700">{item.medicineName}</td>
                                                                            <td className="px-3 py-2.5 text-slate-600">{item.dosage || '—'}</td>
                                                                            <td className="px-3 py-2.5 text-slate-600">{item.frequency || '—'}</td>
                                                                            <td className="px-3 py-2.5 text-slate-600 text-center font-semibold">{item.quantity ?? '—'}</td>
                                                                            <td className="px-3 py-2.5 text-slate-500 italic">{item.instructions || '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MedicalRecordAccordion;
