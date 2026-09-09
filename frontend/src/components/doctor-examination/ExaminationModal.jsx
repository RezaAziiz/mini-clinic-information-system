import { X, Calendar, Pill, Trash2, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import Backdrop from '../common/Backdrop';
import { formatDate } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from '../registrations/RegistrationBadges';

const SoapSection = ({ accentColor, label, sublabel, children }) => (
    <div className={`border-l-4 ${accentColor} pl-4`}>
        <div className="mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            {sublabel && <span className="ml-2 text-xs font-medium text-slate-400">— {sublabel}</span>}
        </div>
        {children}
    </div>
);

const inputCls = (hasError) =>
    `w-full px-3 py-2 text-sm bg-white border rounded-xl outline-none transition-colors ${
        hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
    } text-slate-700 placeholder:text-slate-400`;

const textareaCls = (hasError) =>
    `w-full px-3 py-2 text-sm bg-white border rounded-xl outline-none transition-colors resize-none ${
        hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
    } text-slate-700 placeholder:text-slate-400`;

const ExaminationModal = ({
    show,
    activeReg,
    onClose,
    onSubmit,
    form,
    setField,
    formErrors,
    showPresc,
    setShowPresc,
    prescNotes,
    setPrescNotes,
    prescItems,
    setPrescField,
    addPrescItem,
    removePrescItem,
    submitting
}) => {
    if (!show || !activeReg) return null;

    return (
        <Backdrop onClose={onClose}>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col w-full">

                {/* ── Sticky header ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Pemeriksaan Pasien
                            <span className="text-slate-400 font-normal"> — </span>
                            {activeReg.patient?.name}
                        </h3>
                        <p className="text-xs font-semibold text-primary-600 mt-0.5">
                            {activeReg.patient?.medicalRecordNumber}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0 mt-0.5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <form
                    id="examination-form"
                    onSubmit={onSubmit}
                    className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
                >
                    {/* Patient info strip */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-wrap gap-x-5 gap-y-2">
                        <div className="flex items-center gap-1.5">
                            <StatusBadge status={activeReg.registStatus} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Poli</span>
                            <span className="text-xs font-semibold text-slate-600">{activeReg.polyclinic?.name || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <PaymentBadge type={activeReg.paymentType} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600">{formatDate(activeReg.visitDate)}</span>
                        </div>
                        {activeReg.initialComplaint && (
                            <div className="w-full flex items-start gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 shrink-0">Keluhan</span>
                                <span className="text-xs text-slate-500">{activeReg.initialComplaint}</span>
                            </div>
                        )}
                    </div>

                    {/* ── S — Subjective ── */}
                    <SoapSection accentColor="border-blue-400" label="S" sublabel="Subjective">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Keluhan Pasien <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={form.subjective}
                                onChange={(e) => setField('subjective', e.target.value)}
                                placeholder="Deskripsikan keluhan yang disampaikan pasien..."
                                className={textareaCls(!!formErrors.subjective)}
                            />
                            {formErrors.subjective && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.subjective}</p>
                            )}
                        </div>
                    </SoapSection>

                    {/* ── O — Objective ── */}
                    <SoapSection accentColor="border-teal-400" label="O" sublabel="Objective">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Tekanan Darah
                                </label>
                                <input
                                    type="text"
                                    value={form.bloodPressure}
                                    onChange={(e) => setField('bloodPressure', e.target.value)}
                                    placeholder="misal: 120/80"
                                    className={inputCls(false)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Suhu Tubuh
                                </label>
                                <input
                                    type="number"
                                    value={form.temperature}
                                    onChange={(e) => setField('temperature', e.target.value)}
                                    placeholder="°C"
                                    step="0.1"
                                    className={inputCls(false)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Berat Badan
                                </label>
                                <input
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) => setField('weight', e.target.value)}
                                    placeholder="kg"
                                    step="0.1"
                                    className={inputCls(false)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Tinggi Badan
                                </label>
                                <input
                                    type="number"
                                    value={form.height}
                                    onChange={(e) => setField('height', e.target.value)}
                                    placeholder="cm"
                                    step="0.1"
                                    className={inputCls(false)}
                                />
                            </div>
                        </div>
                    </SoapSection>

                    {/* ── A — Assessment ── */}
                    <SoapSection accentColor="border-amber-400" label="A" sublabel="Assessment">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Diagnosa <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={2}
                                value={form.assessment}
                                onChange={(e) => setField('assessment', e.target.value)}
                                placeholder="Tuliskan diagnosa hasil pemeriksaan..."
                                className={textareaCls(!!formErrors.assessment)}
                            />
                            {formErrors.assessment && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.assessment}</p>
                            )}
                        </div>
                    </SoapSection>

                    {/* ── P — Plan ── */}
                    <SoapSection accentColor="border-rose-400" label="P" sublabel="Plan">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Rencana Terapi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.plan}
                                    onChange={(e) => setField('plan', e.target.value)}
                                    placeholder="Rencana penanganan dan terapi yang diberikan..."
                                    className={textareaCls(!!formErrors.plan)}
                                />
                                {formErrors.plan && (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.plan}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Tindakan Medis
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.medicalAction}
                                    onChange={(e) => setField('medicalAction', e.target.value)}
                                    placeholder="Tindakan medis yang dilakukan (opsional)..."
                                    className={textareaCls(false)}
                                />
                            </div>
                        </div>
                    </SoapSection>

                    {/* ── Prescription toggle ── */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPresc((v) => !v)}
                            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                                showPresc
                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                    : 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                            }`}
                        >
                            <Pill className="w-3.5 h-3.5" />
                            {showPresc ? '✕ Batal Resep' : '＋ Tambah Resep'}
                        </button>
                    </div>

                    {/* ── Prescription section ── */}
                    {showPresc && (
                        <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/60">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-primary-500" />
                                <span className="text-sm font-bold text-slate-700">Resep Obat</span>
                            </div>

                            {/* Prescription notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Catatan Resep
                                </label>
                                <textarea
                                    rows={2}
                                    value={prescNotes}
                                    onChange={(e) => setPrescNotes(e.target.value)}
                                    placeholder="Catatan tambahan untuk apoteker (opsional)..."
                                    className={textareaCls(false)}
                                />
                            </div>

                            {/* Prescription items */}
                            <div className="space-y-2">
                                {prescItems.map((item, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                                        {/* Row: label + delete button */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Obat {idx + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePrescItem(idx)}
                                                disabled={prescItems.length === 1}
                                                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Hapus obat"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {/* Nama Obat */}
                                        <input
                                            type="text"
                                            value={item.medicineName}
                                            onChange={(e) => setPrescField(idx, 'medicineName', e.target.value)}
                                            placeholder="Nama Obat"
                                            className={inputCls(false)}
                                        />
                                        {/* Dosis | Frekuensi | Jumlah */}
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={item.dosage}
                                                    onChange={(e) => setPrescField(idx, 'dosage', e.target.value)}
                                                    placeholder="Dosis (mis: 500mg)"
                                                    className={inputCls(false)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={item.frequency}
                                                    onChange={(e) => setPrescField(idx, 'frequency', e.target.value)}
                                                    placeholder="Frekuensi (mis: 3x1)"
                                                    className={inputCls(false)}
                                                />
                                            </div>
                                            <div className="w-20">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => setPrescField(idx, 'quantity', e.target.value)}
                                                    placeholder="Jml"
                                                    min="1"
                                                    className={inputCls(false)}
                                                />
                                            </div>
                                        </div>
                                        {/* Instruksi */}
                                        <input
                                            type="text"
                                            value={item.instructions}
                                            onChange={(e) => setPrescField(idx, 'instructions', e.target.value)}
                                            placeholder="Instruksi (mis: sesudah makan)"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Add medicine row */}
                            <button
                                type="button"
                                onClick={addPrescItem}
                                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 border border-primary-200 bg-white hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Obat
                            </button>
                        </div>
                    )}
                </form>

                {/* ── Sticky footer ── */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="examination-form"
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Simpan Pemeriksaan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Backdrop>
    );
};

export default ExaminationModal;
