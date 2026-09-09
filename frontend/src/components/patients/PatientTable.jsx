import { Eye, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { formatDate, calculateAge, genderLabel } from '../../utils/formatters';

const PatientTable = ({ patients, loading, onDetail, onEdit, onDelete }) => {
    return (
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
                                            onClick={() => onDetail(patient)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                            title="Detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(patient)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(patient)}
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
    );
};

export default PatientTable;
