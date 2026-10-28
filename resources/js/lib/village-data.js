export const DEFAULT_VILLAGE_DATA = [
    {
        id: 'candisari',
        name: 'Candisari',
        subvillages: [
            { id: 'banjaran', name: 'Banjaran' },
            { id: 'candilaras', name: 'Candilaras' },
            { id: 'candirejo', name: 'Candirejo' },
            { id: 'cuken', name: 'Cuken' },
            { id: 'kembangkuning', name: 'Kembangkuning' },
            { id: 'kumpulrejo', name: 'Kumpulrejo' },
            { id: 'ledoksari', name: 'Ledoksari' },
            { id: 'ngelo', name: 'Ngelo' },
            { id: 'sukorejo', name: 'Sukorejo' },
            { id: 'sorengan', name: 'Sorengan' },
            { id: 'tugusari', name: 'Tugusari' },
            { id: 'wonosari', name: 'Wonosari' },
        ],
    },
    {
        id: 'gladagsari',
        name: 'Gladagsari',
        subvillages: [
            { id: 'tempel', name: 'Tempel' },
            { id: 'belang', name: 'Belang' },
            { id: 'gladagsari-1', name: 'Gladagsari' },
            { id: 'ngemplak', name: 'Ngemplak' },
        ],
    },
    {
        id: 'jlarem',
        name: 'Jlarem',
        subvillages: [
            { id: 'jlarem-1', name: 'Jlarem' },
            { id: 'gagan', name: 'Gagan' },
        ],
    },
    {
        id: 'kaligentong',
        name: 'Kaligentong',
        subvillages: [
            { id: 'belang-kidul', name: 'Belang Kidul' },
            { id: 'kaligentong-1', name: 'Kaligentong' },
        ],
    },
    {
        id: 'kembang',
        name: 'Kembang',
        subvillages: [
            { id: 'kembang-1', name: 'Kembang' },
            { id: 'kembangsari', name: 'Kembangsari' },
        ],
    },
    {
        id: 'ngadirojo',
        name: 'Ngadirojo',
        subvillages: [
            { id: 'ngadirojo-1', name: 'Ngadirojo' },
            { id: 'rejosari', name: 'Rejosari' },
        ],
    },
    {
        id: 'ngagrong',
        name: 'Ngagrong',
        subvillages: [
            { id: 'ngagrong-1', name: 'Ngagrong' },
            { id: 'batur', name: 'Batur' },
        ],
    },
    {
        id: 'ngargoloka',
        name: 'Ngargoloka',
        subvillages: [
            { id: 'ngargoloka-1', name: 'Ngargoloka' },
            { id: 'sidomulyo', name: 'Sidomulyo' },
        ],
    },
    {
        id: 'sampetan',
        name: 'Sampetan',
        subvillages: [
            { id: 'sampetan-1', name: 'Sampetan' },
            { id: 'selodoko', name: 'Selodoko' },
        ],
    },
    {
        id: 'seboto',
        name: 'Seboto',
        subvillages: [
            { id: 'seboto-1', name: 'Seboto' },
            { id: 'sidoharjo', name: 'Sidoharjo' },
        ],
    },
];

const STORAGE_KEY = 'simpel_village_subvillage_data';

export function getStoredVillageData() {
    if (typeof window === 'undefined') return DEFAULT_VILLAGE_DATA;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_VILLAGE_DATA;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VILLAGE_DATA;
    } catch {
        return DEFAULT_VILLAGE_DATA;
    }
}

export function saveStoredVillageData(data) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('village_data_updated'));
    } catch (e) {
        console.error('Failed to save village data to localStorage', e);
    }
}

export function resetStoredVillageData() {
    if (typeof window === 'undefined') return DEFAULT_VILLAGE_DATA;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VILLAGE_DATA));
        window.dispatchEvent(new Event('village_data_updated'));
    } catch (e) {
        console.error('Failed to reset village data in localStorage', e);
    }
    return DEFAULT_VILLAGE_DATA;
}

export function getAllSubvillagesList() {
    const data = getStoredVillageData();
    const list = [];
    data.forEach((v) => {
        (v.subvillages || []).forEach((s) => {
            list.push(`${s.name}, ${v.name}`);
        });
    });
    return list;
}
