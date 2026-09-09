import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Search, Plus, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight,
    Users, CreditCard, MapPin, Phone, Calendar, User, AlertTriangle, Loader2
} from 'lucide-react';

// Backdrop di luar component agar tidak re-create setiap render (menjaga fokus input)
const Backdrop = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="w-full">
            {children}
        </div>
    </div>
);

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
            const res = await api.get('/patients', {
                params: { page, limit: 10, search: debouncedSearch }
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
            const res = await api.get(`/patients/${patient.id}`);
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
                await api.put(`/patients/${editingPatient.id}`, form);
                toast.success('Data pasien berhasil diperbarui');
            } else {
                await api.post('/patients', form);
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
            await api.delete(`/patients/${deletingPatient.id}`);
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

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const genderLabel = (g) => g === 'L' ? 'Laki-laki' : 'Perempuan';

    const calculateAge = (dateStr) => {
        if (!dateStr) return '-';
        const birth = new Date(dateStr);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} thn`;
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Rekam Medis</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIK</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama & Usia</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tgl Lahir</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. HP</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-medium text-slate-400">Memuat data pasien...</p>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">Tidak ada data pasien ditemukan</p>
                                        <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau tambahkan pasien baru</p>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold text-primary-600">{patient.medicalRecordNumber}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-medium text-slate-600 font-mono tracking-wide">
                                                {patient.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-slate-700">{patient.name}</p>
                                            <p className="text-[10px] font-semibold text-slate-400">{calculateAge(patient.dateOfBirth)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                                patient.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                            }`}>
                                                {genderLabel(patient.gender)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                            {formatDate(patient.dateOfBirth)}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                            {patient.phone || '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openDetailModal(patient)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(patient)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(patient)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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

            {/* ====== FORM MODAL (Create / Edit) ====== */}
            {showFormModal && (
                <Backdrop onClose={() => { setShowFormModal(false); resetForm(); }}>
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {editingPatient ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {editingPatient
                                        ? `Memperbarui data ${editingPatient.name}`
                                        : 'No. Rekam Medis akan dibuat otomatis oleh sistem'}
                                </p>
                            </div>
                            <button onClick={() => { setShowFormModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
                            {/* NIK */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    NIK <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        maxLength={16}
                                        value={form.nik}
                                        onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Masukkan 16 digit NIK"
                                        className={`w-full py-2.5 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                            formErrors.nik ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                                        }`}
                                    />
                                </div>
                                {formErrors.nik && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.nik}</p>}
                            </div>

                            {/* Nama */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Nama lengkap pasien"
                                        className={`w-full py-2.5 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                            formErrors.name ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                                        }`}
                                    />
                                </div>
                                {formErrors.name && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.name}</p>}
                            </div>

                            {/* Gender & DOB Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: 'L' })}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                form.gender === 'L'
                                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            Laki-laki
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: 'P' })}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                form.gender === 'P'
                                                    ? 'bg-pink-50 border-pink-300 text-pink-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            Perempuan
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Tanggal Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                            className={`w-full py-2.5 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                                formErrors.dateOfBirth ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                                            }`}
                                        />
                                    </div>
                                    {formErrors.dateOfBirth && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.dateOfBirth}</p>}
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. Handphone</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+\-\s]/g, '') })}
                                        placeholder="08xx-xxxx-xxxx"
                                        className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Alamat lengkap pasien"
                                        rows={2}
                                        className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowFormModal(false); resetForm(); }}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingPatient ? 'Simpan Perubahan' : 'Tambah Pasien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Backdrop>
            )}

            {/* ====== DETAIL MODAL ====== */}
            {showDetailModal && detailPatient && (
                <Backdrop onClose={() => { setShowDetailModal(false); setDetailPatient(null); }}>
                    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="text-base font-bold text-slate-800">Detail Pasien</h3>
                            <button onClick={() => { setShowDetailModal(false); setDetailPatient(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
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
                                        setShowDetailModal(false);
                                        openEditModal(detailPatient);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => { setShowDetailModal(false); setDetailPatient(null); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </Backdrop>
            )}

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
