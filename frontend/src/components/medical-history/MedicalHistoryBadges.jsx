export const STATUS_STYLES = {
    'Menunggu':    'bg-yellow-50 text-yellow-700',
    'Check In':    'bg-blue-50 text-blue-700',
    'Pemeriksaan': 'bg-purple-50 text-purple-700',
    'Selesai':     'bg-green-50 text-green-700',
};

export const PAYMENT_STYLES = {
    'BPJS':             'bg-green-50 text-green-700',
    'Umum':             'bg-slate-100 text-slate-600',
    'Asuransi_Lainnya': 'bg-purple-50 text-purple-700',
};

export const paymentLabel = (t) => (t === 'Asuransi_Lainnya' ? 'Asuransi Lainnya' : t);

export const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

export const PaymentBadge = ({ type }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${PAYMENT_STYLES[type] || 'bg-slate-100 text-slate-600'}`}>
        {paymentLabel(type)}
    </span>
);

export const SoapSection = ({ accentCls, label, sublabel, children }) => (
    <div className={`border-l-4 ${accentCls} pl-4`}>
        <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            {sublabel && (
                <span className="ml-2 text-xs font-medium text-slate-400">— {sublabel}</span>
            )}
        </div>
        {children}
    </div>
);
