import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../services/patient.service';
import medicalRecordService from '../services/medical-record.service';
import { formatDate, formatDateTime, calculateAge, genderLabel } from '../utils/formatters';
import {
    Search, X, ChevronDown, ChevronUp, Loader2,
    ClipboardList, Stethoscope, Building2, Calendar, CreditCard, Pill,
    FileText, User, MapPin, Clock, Activity, ChevronRight, CheckCircle2, ChevronLeft, CalendarDays
} from 'lucide-react';

import PatientSearchCard from '../components/medical-history/PatientSearchCard';
import MedicalRecordAccordion from '../components/medical-history/MedicalRecordAccordion';

// Main component 

const MedicalHistory = () => {
    // Patient search
    const [patientSearch, setPatientSearch] = useState('');
    const [patientResults, setPatientResults] = useState([]);
    const [searchingPatient, setSearchingPatient] = useState(false);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Medical records
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Accordion
    const [expandedId, setExpandedId] = useState(null);

    // Refs
    const patientSearchRef = useRef(null);

    // Click-outside: close dropdown 
    useEffect(() => {
        const handler = (e) => {
            if (patientSearchRef.current && !patientSearchRef.current.contains(e.target)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Patient search debounce (400 ms) 
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
                const res = await patientService.getAll({ search: patientSearch, limit: 6 });
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

    // Fetch medical records when patient selected 
    useEffect(() => {
        if (!selectedPatient) return;

        const fetchRecords = async () => {
            setLoadingRecords(true);
            setExpandedId(null);
            try {
                const res = await medicalRecordService.getByPatientId(selectedPatient.id);
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

    // Handlers 

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

    // Render 
    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    Riwayat Pemeriksaan Pasien
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Lihat riwayat pemeriksaan dan resep obat pasien
                </p>
            </div>

            <PatientSearchCard
                patientSearchRef={patientSearchRef}
                patientSearch={patientSearch}
                setPatientSearch={setPatientSearch}
                patientResults={patientResults}
                showPatientDropdown={showPatientDropdown}
                setShowPatientDropdown={setShowPatientDropdown}
                searchingPatient={searchingPatient}
                selectPatient={selectPatient}
                selectedPatient={selectedPatient}
                clearPatient={clearPatient}
            />

            <MedicalRecordAccordion
                selectedPatient={selectedPatient}
                loadingRecords={loadingRecords}
                records={records}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
            />
        </div>
    );
};

export default MedicalHistory;
