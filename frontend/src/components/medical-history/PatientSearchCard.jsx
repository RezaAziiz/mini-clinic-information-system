import { Search, X, Loader2 } from 'lucide-react';
import { calculateAge, genderLabel } from '../../utils/formatters';

const PatientSearchCard = ({
    patientSearchRef,
    patientSearch,
    setPatientSearch,
    patientResults,
    showPatientDropdown,
    setShowPatientDropdown,
    searchingPatient,
    selectPatient,
    selectedPatient,
    clearPatient
}) => {
    return (
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
    );
};

export default PatientSearchCard;
