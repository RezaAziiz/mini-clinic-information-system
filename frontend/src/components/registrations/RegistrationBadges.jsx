export const STATUS_STYLES = {
    'Menunggu':    'bg-yellow-50 text-yellow-700',
    'Check_In':    'bg-blue-50 text-blue-700',
    'Pemeriksaan': 'bg-purple-50 text-purple-700',
    'Selesai':     'bg-green-50 text-green-700',
};

export const PAYMENT_LABELS = {
    'Umum':             'Umum',
    'BPJS':             'BPJS',
    'Asuransi_Lainnya': 'Asuransi Lainnya',
};

export const PAYMENT_STYLES = {
    'BPJS':             'bg-green-50 text-green-700',
    'Umum':             'bg-slate-100 text-slate-600',
    'Asuransi_Lainnya': 'bg-purple-50 text-purple-700',
};

export const STATUSES = ['Menunggu', 'Check_In', 'Pemeriksaan', 'Selesai'];

export const PAYMENT_TYPES = [
    { value: 'Umum',             label: 'Umum' },
    { value: 'BPJS',             label: 'BPJS' },
    { value: 'Asuransi_Lainnya', label: 'Asuransi Lainnya' },
];

export const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status?.replace('_', ' ')}
    </span>
);

export const PaymentBadge = ({ type }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${PAYMENT_STYLES[type] || 'bg-slate-100 text-slate-600'}`}>
        {PAYMENT_LABELS[type] || type}
    </span>
);
