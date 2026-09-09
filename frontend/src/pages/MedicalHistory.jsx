import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Search, X, ChevronDown, ChevronUp, Loader2,
    ClipboardList, Stethoscope, Building2, Calendar, CreditCard, Pill,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    'Menunggu':    'bg-yellow-50 text-yellow-700',
    'Check In':    'bg-blue-50 text-blue-700',
    'Pemeriksaan': 'bg-purple-50 text-purple-700',
    'Selesai':     'bg-green-50 text-green-700',
};

const PAYMENT_STYLES = {
    'BPJS':             'bg-green-50 text-green-700',
    'Umum':             'bg-slate-100 text-slate-600',
    'Asuransi_Lainnya': 'bg-purple-50 text-purple-700',
};

// ─── Helper functions ─────────────────────────────────────────────────────────

const formatDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (d) =>
    new Date(d).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const genderLabel = (g) => (g === 'L' ? 'Laki-laki' : 'Perempuan');

const calculateAge = (dateStr) => {
    if (!dateStr) return '-';
    const birth = new Date(dateStr);
    const now   = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return `${age} thn`;
};

const paymentLabel = (t) => (t === 'Asuransi_Lainnya' ? 'Asuransi Lainnya' : t);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

const PaymentBadge = ({ type }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${PAYMENT_STYLES[type] || 'bg-slate-100 text-slate-600'}`}>
        {paymentLabel(type)}
    </span>
);

// SOAP section with left accent border
const SoapSection = ({ accentCls, label, sublabel, children }) => (
    <div className={`border-l-4 ${accentCls} pl-4`}>
        <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            {sublabel && (
                <span className="ml-2 text-xs font-medium text-slate-400">— {sublabel}</span>
            )}
        </div>
        {children}
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const MedicalHistory = () => {
    // Patient search
    const [patientSearch,       setPatientSearch]       = useState('');
    const [patientResults,      setPatientResults]      = useState([]);
    const [searchingPatient,    setSearchingPatient]    = useState(false);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [selectedPatient,     setSelectedPatient]     = useState(null);

    // Medical records
    const [records,        setRecords]        = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Accordion
    const [expandedId, setExpandedId] = useState(null);

    // Refs
    const patientSearchRef = useRef(null);

    // ── Click-outside: close dropdown ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (patientSearchRef.current && !patientSearchRef.current.contains(e.target)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Patient search debounce (400 ms) ──────────────────────────────────────
    useEffect(() => {
        // Use a short delay for the clear case, full debounce for search
        const delay = patientSearch.length < 2 ? 0 : 400;

        const timer = setTimeout(async () => {
            if (patientSearch.length < 2) {
                setPatientResults([]);
                setShowPatientDropdown(false);
                setSearchingPatient(false);
                return;
            }

            setSearchingPatient(true);
            try {
                const res = await api.get('/patients', {
                    params: { search: patientSearch, limit: 6 },
                });
                if (res.success) {
                    setPatientResults(res.data.data || []);
                    setShowPatientDropdown(true);
                }
            } catch {
                toast.error('Gagal mencari pasien');
            } finally {
                setSearchingPatient(false);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [patientSearch]);

    // ── Fetch medical records when patient selected ────────────────────────────
    useEffect(() => {
        if (!selectedPatient) return;

        const fetchRecords = async () => {
            setLoadingRecords(true);
            setExpandedId(null);
            try {
                const res = await api.get(`/medical-records/${selectedPatient.id}`);
                if (res.success) {
                    setRecords(res.data || []);
                }
            } catch {
                toast.error('Gagal memuat riwayat pemeriksaan');
            } finally {
                setLoadingRecords(false);
            }
        };

        fetchRecords();
    }, [selectedPatient]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setPatientSearch('');
        setPatientResults([]);
        setShowPatientDropdown(false);
    };

    const clearPatient = () => {
        setSelectedPatient(null);
        setRecords([]);
        setExpandedId(null);
        setPatientSearch('');
    };

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    Riwayat Pemeriksaan Pasien
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Lihat riwayat pemeriksaan dan resep obat pasien
                </p>
            </div>

            {/* ── Patient Search Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Cari Pasien
                </p>

                {/* Search input */}
                <div className="relative" ref={patientSearchRef}>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                        <input
                            type="text"
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                            placeholder="Ketik nama atau No. RM..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {searchingPatient ? (
                                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : patientSearch ? (
                                <button
                                    onClick={() => {
                                        setPatientSearch('');
                                        setPatientResults([]);
                                        setShowPatientDropdown(false);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Dropdown results */}
                    {showPatientDropdown && patientResults.length > 0 && (
                        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                            {patientResults.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => selectPatient(patient)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left group"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                                        patient.gender === 'L'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-pink-100 text-pink-600'
                                    }`}>
                                        {patient.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary-700">
                                            {patient.name}
                                        </p>
                                        <p className="text-[10px] font-semibold text-primary-600">
                                            {patient.medicalRecordNumber}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showPatientDropdown && patientResults.length === 0 && !searchingPatient && patientSearch.length >= 2 && (
                        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                            <p className="text-sm text-slate-400 font-medium">Pasien tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Selected patient card */}
                {selectedPatient && (
                    <div className="mt-4 flex items-center gap-4 bg-primary-50 border border-primary-100 rounded-xl p-4">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-extrabold text-lg ${
                            selectedPatient.gender === 'L'
                                ? 'bg-blue-200 text-blue-700'
                                : 'bg-pink-200 text-pink-700'
                        }`}>
                            {selectedPatient.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-slate-800 truncate">{selectedPatient.name}</p>
                            <p className="text-[10px] font-bold text-primary-600 mt-0.5">{selectedPatient.medicalRecordNumber}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    {genderLabel(selectedPatient.gender)}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-500 font-medium">
                                    {calculateAge(selectedPatient.dateOfBirth)}
                                </span>
                                {selectedPatient.phone && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs text-slate-500 font-medium">{selectedPatient.phone}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Change patient button */}
                        <button
                            onClick={clearPatient}
                            className="shrink-0 text-xs font-semibold text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                            Ganti Pasien
                        </button>
                    </div>
                )}
            </div>

            {/* ── Medical Records Section ── */}
            {selectedPatient ? (
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
            ) : (
                /* ── Initial empty state ── */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Belum ada pasien dipilih</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Cari pasien di atas untuk melihat riwayat pemeriksaan
                    </p>
                </div>
            )}
        </div>
    );
};

export default MedicalHistory;
