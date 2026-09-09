const QUEUE_STATUS_STYLES = {
    Menunggu:   'bg-yellow-50 text-yellow-700',
    Dipanggil:  'bg-blue-50  text-blue-700',
    Selesai:    'bg-green-50 text-green-700',
};

export const StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${QUEUE_STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);
