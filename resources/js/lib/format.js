export const pad = (n) => String(n).padStart(2, '0');

export function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
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

export function fmtDateIndo(val) {
    if (!val) return '';
    let y, m, d;
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
    return `${d} ${BULAN[m - 1]} ${y}`;
}

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

export function formatLetterNumber(raw, date) {
    if (!raw) return '-';
    const trimmed = String(raw).trim();
    if (!trimmed) return '-';
    if (trimmed.includes('/6.20/') || trimmed.startsWith('474.2/')) {
        return trimmed;
    }
    let year = new Date().getFullYear();
    if (date) {
        if (typeof date === 'string' && date.length >= 4) {
            year = date.slice(0, 4);
        } else {
            const parsed = new Date(date);
            if (!isNaN(parsed.getFullYear())) {
                year = parsed.getFullYear();
            }
        }
    }
    return `474.2/${trimmed}/6.20/${year}`;
}

export function extractLetterSequence(raw) {
    if (!raw) return '';
    const trimmed = String(raw).trim();
    const match = trimmed.match(/^474\.2\/(.*?)\/6\.20(?:\/\d{4})?$/);
    if (match) {
        return match[1];
    }
    return trimmed;
}
