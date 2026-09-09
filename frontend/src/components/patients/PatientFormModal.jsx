import { CreditCard, User, Calendar, Phone, MapPin, Loader2, X } from 'lucide-react';
import Backdrop from '../common/Backdrop';

const PatientFormModal = ({ 
    show, onClose, onSubmit, form, setForm, 
    formErrors, submitting, editingPatient, resetForm 
}) => {
    if (!show) return null;

    const handleClose = () => {
        onClose();
        resetForm();
    };

    return (
        <Backdrop onClose={handleClose}>
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto w-full">
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
                    <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-3.5">
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
                            onClick={handleClose}
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
    );
};

export default PatientFormModal;
