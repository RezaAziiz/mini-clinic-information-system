import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { patientService } from '../services/patient.service';
import { registrationService } from '../services/registration.service';
import { referenceService } from '../services/reference.service';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import Backdrop from '../components/common/Backdrop';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus, Filter, Calendar, X
} from 'lucide-react';
import { STATUSES } from '../components/registrations/RegistrationBadges';
import RegistrationTable from '../components/registrations/RegistrationTable';
import RegistrationFormModal from '../components/registrations/RegistrationFormModal';
import RegistrationDetailModal from '../components/registrations/RegistrationDetailModal';
import { ROLE, REGIST_STATUS } from '../utils/constants';



const todayISO = () => new Date().toISOString().split('T')[0];



const Registrations = () => {
    const { user } = useAuth();

    const [registrations, setRegistrations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [polyclinics, setPolyclinics] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterDate, setFilterDate] = useState(todayISO());
    const [filterStatus, setFilterStatus] = useState('');

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingReg, setEditingReg] = useState(null);
    const [detailReg, setDetailReg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        patientId: '',
        patientName: '',
        doctorId: '',
        polyId: '',
        visitDate: todayISO(),
        paymentType: 'Umum',
        initialComplaint: '',
        registStatus: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const [patientSearch, setPatientSearch] = useState('');
    const [patientResults, setPatientResults] = useState([]);
    const [searchingPatient, setSearchingPatient] = useState(false);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const patientSearchRef = useRef(null);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterDate) params.startDate = filterDate;
            if (filterStatus) params.status = filterStatus;

            const res = await registrationService.getAll(params);
            if (res.success) setRegistrations(res.data);
        } catch {
            toast.error('Gagal memuat data registrasi');
        } finally {
            setLoading(false);
        }
    }, [filterDate, filterStatus]);

    const fetchSupportData = useCallback(async () => {
        try {
            const [drRes, polyRes] = await Promise.all([
                referenceService.getDoctors(),
                referenceService.getPolyclinics(),
            ]);
            if (drRes.success) setDoctors(drRes.data);
            if (polyRes.success) setPolyclinics(polyRes.data);
        } catch {
            // non-critical
        }
    }, []);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);
    useEffect(() => { fetchSupportData(); }, [fetchSupportData]);

    useEffect(() => {
        if (!patientSearch || patientSearch.length < 2) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingPatient(true);
            try {
                const res = await patientService.getAll({
                    search: patientSearch,
                    limit: 5
                });
                if (res.success) {
                    setPatientResults(res.data.data || []);
                    setShowPatientDropdown(true);
                }
            } catch {
                // silent
            } finally {
                setSearchingPatient(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    // Close patient dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (patientSearchRef.current && !patientSearchRef.current.contains(e.target)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const resetForm = () => {
        setForm({
            patientId: '', patientName: '', doctorId: '', polyId: '',
            visitDate: todayISO(), paymentType: 'Umum',
            initialComplaint: '', registStatus: '',
        });
        setPatientSearch('');
        setPatientResults([]);
        setFormErrors({});
        setEditingReg(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEditModal = (reg) => {
        setEditingReg(reg);
        setForm({
            patientId: String(reg.patient?.id || reg.patientId || ''),
            patientName: reg.patient?.name || '',
            doctorId: String(reg.doctor?.id || reg.doctorId || ''),
            polyId: String(reg.polyclinic?.id || reg.polyId || ''),
            visitDate: reg.visitDate ? reg.visitDate.split('T')[0] : todayISO(),
            paymentType: reg.paymentType || 'Umum',
            initialComplaint: reg.initialComplaint || '',
            registStatus: reg.registStatus || '',
        });
        setPatientSearch(reg.patient?.name || '');
        setFormErrors({});
        setShowFormModal(true);
    };

    const openDetailModal = async (reg) => {
        try {
            const res = await registrationService.getById(reg.id);
            if (res.success) {
                setDetailReg(res.data);
                setShowDetailModal(true);
            }
        } catch {
            toast.error('Gagal memuat detail registrasi');
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.patientId) errors.patientId = 'Pasien wajib dipilih dari hasil pencarian';
        if (!form.doctorId) errors.doctorId = 'Dokter wajib dipilih';
        if (!form.polyId) errors.polyId = 'Poliklinik wajib dipilih';
        if (!form.visitDate) errors.visitDate = 'Tanggal kunjungan wajib diisi';
        if (!form.paymentType) errors.paymentType = 'Jenis pembayaran wajib dipilih';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);

        const payload = {
            patientId: Number(form.patientId),
            doctorId: Number(form.doctorId),
            polyId: Number(form.polyId),
            visitDate: form.visitDate,
            paymentType: form.paymentType,
            initialComplaint: form.initialComplaint || undefined,
        };

        // Only send registStatus if it actually changed (prevents invalid-transition error)
        if (editingReg && form.registStatus && form.registStatus !== editingReg.registStatus) {
            payload.registStatus = form.registStatus;
        }

        try {
            if (editingReg) {
                await registrationService.update(editingReg.id, payload);
                toast.success('Pendaftaran berhasil diupdate');
            } else {
                await registrationService.create(payload);
                toast.success('Registrasi kunjungan berhasil dibuat');
            }
            setShowFormModal(false);
            resetForm();
            fetchRegistrations();
        } catch (error) {
            const fieldErrors = error?.errors;
            if (fieldErrors) {
                setFormErrors(fieldErrors);
            } else {
                toast.error(error?.message || 'Terjadi kesalahan');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Quick check-in from table row
    const handleCheckIn = async (reg) => {
        try {
            await registrationService.update(reg.id, { registStatus: REGIST_STATUS.CHECK_IN });
            toast.success(`${reg.patient?.name} berhasil Check In`);
            fetchRegistrations();
        } catch (error) {
            toast.error(error?.message || 'Gagal melakukan check in');
        }
    };


    // Role guard — only Petugas Pendaftaran (hooks must all be called before this)
    if (user && user.role !== ROLE.PETUGAS_PENDAFTARAN) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Registrasi Kunjungan
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Pendaftaran kunjungan pasien •{' '}
                        <span className="text-primary-600 font-bold">{registrations.length}</span> data ditemukan
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Daftar Pasien Baru
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Filter className="w-3.5 h-3.5" />
                        Filter
                    </div>

                    {/* Date filter */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status filter pills */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!filterStatus
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            Semua
                        </button>
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <RegistrationTable
                registrations={registrations}
                loading={loading}
                onDetail={openDetailModal}
                onEdit={openEditModal}
                onCheckIn={handleCheckIn}
            />

            <RegistrationFormModal
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                submitting={submitting}
                editingReg={editingReg}
                resetForm={resetForm}
                patientSearch={patientSearch}
                setPatientSearch={setPatientSearch}
                patientResults={patientResults}
                showPatientDropdown={showPatientDropdown}
                setShowPatientDropdown={setShowPatientDropdown}
                patientSearchRef={patientSearchRef}
                searchingPatient={searchingPatient}
                doctors={doctors}
                polyclinics={polyclinics}
            />

            {/* ====== DETAIL MODAL ====== */}
            <RegistrationDetailModal
                show={showDetailModal}
                onClose={() => { setShowDetailModal(false); setDetailReg(null); }}
                detailReg={detailReg}
                onEdit={openEditModal}
            />
        </div>
    );
};

export default Registrations;
