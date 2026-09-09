import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { patientService } from '../services/patient.service';
import toast from 'react-hot-toast';
import { formatDate, calculateAge, genderLabel } from '../utils/formatters';
import Backdrop from '../components/common/Backdrop';
import PatientTable from '../components/patients/PatientTable';
import PatientFormModal from '../components/patients/PatientFormModal';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import {
    Search, Plus, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight,
    Users, CreditCard, MapPin, Phone, Calendar, User, AlertTriangle, Loader2
} from 'lucide-react';



const PatientManagement = () => {
    // State
    const [searchParams, setSearchParams] = useSearchParams();
    const [patients, setPatients] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [detailPatient, setDetailPatient] = useState(null);
    const [deletingPatient, setDeletingPatient] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        nik: '', name: '', gender: 'L', dateOfBirth: '', phone: '', address: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch patients
    const fetchPatients = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await patientService.getAll({
                page, limit: 10, search: debouncedSearch
            });
            if (res.success) {
                setPatients(res.data.data);
                setMeta(res.data.meta);
            }
        } catch (error) {
            toast.error('Gagal memuat data pasien');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchPatients(1);
    }, [fetchPatients]);

    // Update URL search params
    useEffect(() => {
        if (debouncedSearch) {
            setSearchParams({ search: debouncedSearch });
        } else {
            setSearchParams({});
        }
    }, [debouncedSearch, setSearchParams]);

    // Form helpers
    const resetForm = () => {
        setForm({ nik: '', name: '', gender: 'L', dateOfBirth: '', phone: '', address: '' });
        setFormErrors({});
        setEditingPatient(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEditModal = (patient) => {
        setEditingPatient(patient);
        setForm({
            nik: patient.nik || '',
            name: patient.name || '',
            gender: patient.gender || 'L',
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
            phone: patient.phone || '',
            address: patient.address || '',
        });
        setFormErrors({});
        setShowFormModal(true);
    };

    const openDetailModal = async (patient) => {
        try {
            const res = await patientService.getById(patient.id);
            if (res.success) {
                setDetailPatient(res.data);
                setShowDetailModal(true);
            }
        } catch {
            toast.error('Gagal memuat detail pasien');
        }
    };

    const openDeleteModal = (patient) => {
        setDeletingPatient(patient);
        setShowDeleteModal(true);
    };

    // Validate form client-side
    const validateForm = () => {
        const errors = {};
        if (!form.nik || form.nik.length !== 16) errors.nik = 'NIK harus 16 digit';
        if (form.nik && !/^\d{16}$/.test(form.nik)) errors.nik = 'NIK harus 16 digit angka';
        if (!form.name || form.name.length < 3) errors.name = 'Nama minimal 3 karakter';
        if (!form.gender) errors.gender = 'Jenis kelamin wajib dipilih';
        if (!form.dateOfBirth) errors.dateOfBirth = 'Tanggal lahir wajib diisi';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit create/update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            if (editingPatient) {
                await patientService.update(editingPatient.id, form);
                toast.success('Data pasien berhasil diupdate');
            } else {
                await patientService.create(form);
                toast.success('Pasien baru berhasil ditambahkan');
            }
            setShowFormModal(false);
            resetForm();
            fetchPatients(editingPatient ? meta.page : 1);
        } catch (error) {
            const msg = error?.message || 'Terjadi kesalahan';
            const fieldErrors = error?.errors;
            if (fieldErrors) {
                setFormErrors(fieldErrors);
            } else {
                toast.error(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deletingPatient) return;
        setSubmitting(true);
        try {
            await patientService.delete(deletingPatient.id);
            toast.success('Pasien berhasil dihapus');
            setShowDeleteModal(false);
            setDeletingPatient(null);
            fetchPatients(meta.page);
        } catch (error) {
            toast.error(error?.message || 'Gagal menghapus pasien');
            setShowDeleteModal(false);
            setDeletingPatient(null);
        } finally {
            setSubmitting(false);
        }
    };


    // --- RENDER ---

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manajemen Data Pasien</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Kelola data master pasien klinik •{' '}
                        <span className="text-primary-600 font-bold">{meta.total}</span> pasien terdaftar
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Pasien Baru
                </button>
            </div>

            {/* Search & Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-5 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari berdasarkan NIK, Nama, atau No. RM..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                    <PatientTable 
                        patients={patients}
                        loading={loading}
                        onDetail={openDetailModal}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                    />

                {/* Pagination */}
                {meta.totalPages > 0 && (
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-400">
                            Menampilkan <span className="font-bold text-slate-600">{(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}</span> dari <span className="font-bold text-slate-600">{meta.total}</span> pasien
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fetchPatients(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dot-${idx}`} className="px-2 text-xs text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => fetchPatients(p)}
                                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                                                p === meta.page
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            <button
                                onClick={() => fetchPatients(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PatientFormModal 
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                submitting={submitting}
                editingPatient={editingPatient}
                resetForm={resetForm}
            />

            <PatientDetailModal 
                show={showDetailModal}
                onClose={() => { setShowDetailModal(false); setDetailPatient(null); }}
                detailPatient={detailPatient}
                onEdit={openEditModal}
            />

            {/* ====== DELETE CONFIRM MODAL ====== */}
            {showDeleteModal && deletingPatient && (
                <Backdrop onClose={() => { setShowDeleteModal(false); setDeletingPatient(null); }}>
                    <div className="max-w-xs mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Pasien?</h3>
                            <p className="text-sm text-slate-500">
                                Data pasien <span className="font-bold text-slate-700">{deletingPatient.name}</span> ({deletingPatient.medicalRecordNumber}) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeletingPatient(null); }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </Backdrop>
            )}
        </div>
    );
};

export default PatientManagement;
