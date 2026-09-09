/**
 * Kumpulan helper functions untuk memformat data di UI.
 * Membantu mengurangi duplikasi kode di halaman (pages).
 */

/**
 * Format tanggal dari string (YYYY-MM-DD) menjadi format lokalisasi Indonesia (DD MMM YYYY)
 * Contoh: 2024-01-15 -> 15 Jan 2024
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Format tanggal dan waktu dari string ISO menjadi format lokalisasi Indonesia (DD MMM YYYY, HH:mm)
 * Contoh: 2024-01-15T08:30:00.000Z -> 15 Jan 2024, 15:30 WIB
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${timePart} WIB`;
};

/**
 * Hitung umur berdasarkan tanggal lahir
 * Contoh: 1995-01-01 -> 29 thn
 */
export const calculateAge = (dateStr) => {
    if (!dateStr) return '-';
    const birth = new Date(dateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        age--;
    }
    return `${age} thn`;
};

/**
 * Format label jenis kelamin
 * Contoh: 'L' -> 'Laki-laki', 'P' -> 'Perempuan'
 */
export const genderLabel = (gender) => {
    return gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : '-';
};
