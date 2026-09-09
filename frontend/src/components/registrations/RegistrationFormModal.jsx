import { X, Search, Loader2, Calendar, FileText } from 'lucide-react';
import Backdrop from '../common/Backdrop';
import { PAYMENT_TYPES } from './RegistrationBadges';

const RegistrationFormModal = ({
    show, onClose, onSubmit, form, setForm,
    formErrors, submitting, editingReg, resetForm,
    patientSearch, setPatientSearch, patientResults,
    showPatientDropdown, setShowPatientDropdown,
    patientSearchRef, searchingPatient, doctors, polyclinics
}) => {
    if (!show) return null;

    return (
        <Backdrop onClose={() => { onClose(); resetForm(); }}>
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col w-full">
                {/* Sticky header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {editingReg ? 'Edit Registrasi' : 'Daftar Kunjungan Pasien'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {editingReg
                                ? 'Perbarui data pendaftaran kunjungan'
                                : 'Isi form pendaftaran kunjungan pasien'}
                        </p>
                    </div>
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto">

                    {/* ── Patient search ── */}
                    <div ref={patientSearchRef} className="relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Pasien <span className="text-red-500">*</span>
                        </label>

                        {/* Show "selected" card only in create mode after picking */}
                        {form.patientId && !editingReg ? (
                            <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-primary-800">{form.patientName}</p>
                                    <p className="text-[10px] font-medium text-primary-500">Pasien dipilih</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((f) => ({ ...f, patientId: '', patientName: '' }));
                                        setPatientSearch('');
                                    }}
                                    className="text-primary-400 hover:text-primary-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={patientSearch}
                                    onChange={(e) => {
                                        setPatientSearch(e.target.value);
                                        // If user types again in edit mode, clear the current selection
                                        if (editingReg && e.target.value !== form.patientName) {
                                            setForm((f) => ({ ...f, patientId: '', patientName: '' }));
                                        }
                                    }}
                                    onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                                    placeholder="Ketik nama pasien atau No. RM..."
                                    className={`w-full py-2.5 pl-10 pr-10 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                        formErrors.patientId ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                                    }`}
                                />
                                {searchingPatient && (
                                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                                )}
                            </div>
                        )}

                        {/* Dropdown results */}
                        {showPatientDropdown && patientResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                {patientResults.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setForm((f) => ({
                                                ...f,
                                                patientId:   String(p.id),
                                                patientName: p.name,
                                            }));
                                            setPatientSearch(p.name);
                                            setShowPatientDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                    >
                                        <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400">
                                            {p.medicalRecordNumber}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {formErrors.patientId && (
                            <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.patientId}</p>
                        )}
                    </div>

                    {/* ── Doctor & Polyclinic ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Dokter <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.doctorId}
                                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                                className={`w-full py-2.5 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                    formErrors.doctorId ? 'border-red-300' : 'border-slate-200'
                                }`}
                            >
                                <option value="">Pilih Dokter</option>
                                {doctors.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {formErrors.doctorId && (
                                <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.doctorId}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Poliklinik <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.polyId}
                                onChange={(e) => setForm((f) => ({ ...f, polyId: e.target.value }))}
                                className={`w-full py-2.5 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                    formErrors.polyId ? 'border-red-300' : 'border-slate-200'
                                }`}
                            >
                                <option value="">Pilih Poliklinik</option>
                                {polyclinics.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {formErrors.polyId && (
                                <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.polyId}</p>
                            )}
                        </div>
                    </div>

                    {/* ── Visit Date & Payment Type ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Tanggal Kunjungan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="date"
                                    value={form.visitDate}
                                    onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
                                    className={`w-full py-2.5 pl-10 pr-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none ${
                                        formErrors.visitDate ? 'border-red-300' : 'border-slate-200'
                                    }`}
                                />
                            </div>
                            {formErrors.visitDate && (
                                <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.visitDate}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jenis Pembayaran <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-1.5">
                                {PAYMENT_TYPES.map((pt) => (
                                    <button
                                        key={pt.value}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, paymentType: pt.value }))}
                                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold border text-left transition-all ${
                                            form.paymentType === pt.value
                                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {pt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Status (edit mode, only when Menunggu) ── */}
                    {editingReg && editingReg.registStatus === 'Menunggu' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Status Kunjungan
                            </label>
                            <div className="flex gap-2">
                                {['Menunggu', 'Check In'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, registStatus: s }))}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                            form.registStatus === s
                                                ? s === 'Menunggu'
                                                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                                    : 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Initial Complaint ── */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Keluhan Awal
                            <span className="text-slate-400 font-normal ml-1">(opsional)</span>
                        </label>
                        <div className="relative">
                            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <textarea
                                value={form.initialComplaint}
                                onChange={(e) => setForm((f) => ({ ...f, initialComplaint: e.target.value }))}
                                placeholder="Deskripsikan keluhan awal pasien..."
                                rows={3}
                                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { onClose(); resetForm(); }}
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
                            {editingReg ? 'Simpan Perubahan' : 'Daftarkan Pasien'}
                        </button>
                    </div>
                </form>
            </div>
        </Backdrop>
    );
};

export default RegistrationFormModal;
