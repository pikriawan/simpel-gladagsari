export const pad = (n) => String(n).padStart(2, '0');

export function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

const HARI = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
];
const BULAN = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function fmtDateDay(val) {
    if (!val) return '';
    let y;
    let m;
    let d;
    if (typeof val === 'string' && val.includes('-')) {
        [y, m, d] = val.slice(0, 10).split('-').map(Number);
    } else if (typeof val === 'string' && val.includes('/')) {
        [d, m, y] = val.split('/').map(Number);
    } else {
        const dt = new Date(val);
        if (isNaN(dt.getTime())) return val;
        y = dt.getFullYear();
        m = dt.getMonth() + 1;
        d = dt.getDate();
    }
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return val;
    return `${HARI[date.getDay()]}, ${d} ${BULAN[date.getMonth()]} ${y}`;
}
